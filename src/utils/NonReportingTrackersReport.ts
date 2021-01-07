import { parse, differenceInDays, formatISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Wialon, CoreSearchItemsResponse } from "node-wialon";
import { SecurePath, LiveTrackerItem } from "securepath-api";
import { EmailReport } from "./EmailReport";
import { HtmlTable } from "./HtmlTable";
import { JobCard } from "./job-card/JobCard";
import { TextTable } from "./TextTable";
import { DatabaseConfig, MailConfig } from "../config/types";
import {
	SecurePathConfig,
	WialonConfig
} from "../config/non-reporting-trackers-report";
import { MarkdownToHtml } from "./MarkdownToHtml";
import { Mailer } from "./Mailer";
import { DateUtils } from "./DateUtils";

interface TrackerData {
	vehicle: string;
	chassis: string;
	plateNumber: string;
	imei: string;
	client: string;
	daysSinceLastReport: number | null;
	lastReport: string;
	system: "Wialon" | "SecurePath";
	subclient?: string;
	subclient2?: string;
}

interface ResourceCredentials {
	database: DatabaseConfig;
	mail?: MailConfig;
	securepath: SecurePathConfig;
	wialon: WialonConfig;
}

interface NonReportingFetchOptions {
	/** Number of days a tracker has not reported before it is considered non reporting. Compared in >= */
	threshold: number;
}

export interface ReportDataOption {
	columns?: number[];
	clients?: string[];
}

const NOT_AVAILABLE_STRING = "N/A";

export class NonReportingTrackersReport {
	public data: Array<TrackerData>;
	private constructor(
		data: Array<TrackerData>,
		private options: ReportDataOption
	) {
		this.data = NonReportingTrackersReport.sortByLastReportingDate(data);
	}

	private static sortByLastReportingDate = (data: TrackerData[]) => {
		return data.sort((a, b) => {
			// Wialon first
			if (a.system < b.system) {
				return 1;
			} else if (a.system > b.system) {
				return -1;
			} else {
				// Sort descending numeric
				const lastReportA = a.daysSinceLastReport || 0;
				const lastReportB = b.daysSinceLastReport || 0;
				if (lastReportA < lastReportB) {
					return 1;
				} else if (lastReportA > lastReportB) {
					return -1;
				}
				return 0;
			}
		});
	};

	private static getNonReportingSecurepath = (
		jobCards: JobCard[],
		trackers: LiveTrackerItem[],
		threshold: number
	): TrackerData[] => {
		return trackers.reduce<TrackerData[]>((acc, tracker) => {
			const lastReport =
				tracker.timestamp && parse(tracker.timestamp.toString(), "t", new Date());
			const daysSinceLastReport = lastReport
				? differenceInDays(new Date(), lastReport)
				: null;
			if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
				const jobCard = jobCards.find(
					(jc) => String(jc.imei) === String(tracker.imei)
				);
				acc.push({
					chassis: jobCard?.chassis || NOT_AVAILABLE_STRING,
					client: jobCard?.client.name || NOT_AVAILABLE_STRING,
					subclient: jobCard?.client?.subclient?.name,
					subclient2: jobCard?.client?.subclient?.subclient?.name,
					daysSinceLastReport,
					imei: tracker.imei,
					lastReport: (lastReport && formatISO(lastReport)) || NOT_AVAILABLE_STRING,
					plateNumber: jobCard?.plateNo || NOT_AVAILABLE_STRING,
					vehicle: jobCard?.vehicle || NOT_AVAILABLE_STRING,
					system: "SecurePath"
				});
			}
			return acc;
		}, []);
	};

	private static getNonReportingWialon = (
		jobCards: JobCard[],
		trackers: CoreSearchItemsResponse,
		threshold: number
	): TrackerData[] => {
		return trackers.items.reduce<TrackerData[]>((acc, tracker) => {
			const lastReport =
				(tracker.lmsg?.t && parse(tracker.lmsg.t.toString(), "t", new Date())) ||
				undefined;
			const daysSinceLastReport = lastReport
				? differenceInDays(new Date(), lastReport)
				: null;
			if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
				const jobCard =
					(tracker.uid &&
						jobCards.find((jc) => String(jc.imei) === String(tracker.uid))) ||
					undefined;
				if (!tracker.uid) {
					console.error(`${tracker.nm} has no IMEI`);
				}
				acc.push({
					chassis: jobCard?.chassis || NOT_AVAILABLE_STRING,
					client: jobCard?.client.name || NOT_AVAILABLE_STRING,
					daysSinceLastReport,
					subclient: jobCard?.client.subclient?.name || NOT_AVAILABLE_STRING,
					subclient2:
						jobCard?.client?.subclient?.subclient?.name || NOT_AVAILABLE_STRING,
					imei: tracker.uid || tracker.nm || NOT_AVAILABLE_STRING,
					lastReport: (lastReport && formatISO(lastReport)) || NOT_AVAILABLE_STRING,
					plateNumber: jobCard?.plateNo || NOT_AVAILABLE_STRING,
					vehicle: jobCard?.vehicle || NOT_AVAILABLE_STRING,
					system: "Wialon"
				});
			}
			return acc;
		}, []);
	};

	private static fetchReportData = async (
		credentials: ResourceCredentials,
		options: NonReportingFetchOptions
	): Promise<TrackerData[]> => {
		const sp = await SecurePath.login(
			credentials.securepath.user,
			credentials.securepath.pass,
			{ baseUrl: "http://rac.securepath.ae:1024" }
		);
		const securepathUnits = await sp.Live.getTrackers();
		const jobCards = await JobCard.findAll(
			{
				database: credentials.database.name,
				host: credentials.database.host,
				password: credentials.database.pass,
				user: credentials.database.user
			},
			{
				active: true
			}
		);
		const w = await Wialon.login({
			token: credentials.wialon.token
		});
		const wialonUnits = await w.Utils.getUnits({ flags: 1024 + 256 + 1 });
		const nonReportingTrackers: TrackerData[] = [
			...NonReportingTrackersReport.getNonReportingSecurepath(
				jobCards,
				securepathUnits,
				options.threshold
			),
			...NonReportingTrackersReport.getNonReportingWialon(
				jobCards,
				wialonUnits,
				options.threshold
			)
		];

		return nonReportingTrackers;
	};

	public static create = async (
		credentials: ResourceCredentials,
		options: NonReportingFetchOptions,
		tableOptions: ReportDataOption
	): Promise<NonReportingTrackersReport> => {
		const reportData = await NonReportingTrackersReport.fetchReportData(
			credentials,
			options
		);

		return new NonReportingTrackersReport(reportData, tableOptions);
	};

	private getHtmlTable = () => {
		const table = new HtmlTable(
			this.getColumnsFromArray([
				"System",
				"Client",
				"Subclient",
				"Subclient2",
				"IMEI",
				"Vehicle",
				"Plate Number",
				"Chassis",
				"Days Since Last Report",
				"Last Report Date"
			])
		);
		this.data.forEach((trackerData) => {
			if (this.shouldIncludeClient(trackerData)) {
				table.addRow(this.getColumns(trackerData));
			}
		});
		return table;
	};

	public getTextTable = () => {
		const table = new TextTable();
		table.addRow(
			this.getColumnsFromArray([
				"System",
				"Client",
				"Subclient",
				"Subclient2",
				"IMEI",
				"Vehicle",
				"Plate Number",
				"Chassis",
				"Days Since Last Report",
				"Last Report Date"
			])
		);
		this.data.forEach((trackerData) => {
			if (this.shouldIncludeClient(trackerData)) {
				table.addRow(this.getColumns(trackerData));
			}
		});
		return table;
	};

	private shouldIncludeClient = (trackerData: TrackerData) => {
		if (this.options.clients) {
			return this.options.clients.some((client) =>
				this.searchClientKeyword(client, trackerData)
			);
		}

		return true;
	};

	private searchClientKeyword = (client: string, trackerData: TrackerData) => {
		const keywords = [trackerData.client.toLowerCase()];
		if (trackerData.subclient) {
			keywords.push(trackerData.subclient.toLowerCase());
		}
		if (trackerData.subclient2) {
			keywords.push(trackerData.subclient2.toLowerCase());
		}
		return keywords.some((keyword) => {
			const compareString = client.toLowerCase();
			return keyword.includes(compareString);
		});
	};

	public getColumnsFromArray = <T>(row: Array<T>) => {
		const filteredRow: T[] = [];

		if (this.options.columns) {
			const validColumns = this.options.columns;
			row.filter((row, index) => {
				if (validColumns.includes(index + 1)) {
					filteredRow.push(row);
				}
			});
			return filteredRow;
		}

		return row;
	};

	public getColumns = (trackerData: TrackerData): Array<string | number> => {
		return this.getColumnsFromArray([
			trackerData.system,
			trackerData.client,
			trackerData.subclient || NOT_AVAILABLE_STRING,
			trackerData.subclient2 || NOT_AVAILABLE_STRING,
			trackerData.imei,
			trackerData.vehicle,
			trackerData.plateNumber,
			trackerData.chassis,
			trackerData.daysSinceLastReport || NOT_AVAILABLE_STRING,
			trackerData.lastReport
		]);
	};

	public printTextTable = () => {
		const table = this.getTextTable();
		return table.render();
	};

	public sendReportByEmail = ({
		mailConfig,
		recipients,
		threshold,
		cc
	}: {
		mailConfig: MailConfig;
		recipients: string[];
		threshold: number;
		cc?: string[];
	}) => {
		const htmlReport = new MarkdownToHtml(`
Dear Team,
		
Please find the table below for the updated list of non-reporting vehicles for more than ${threshold} days.

To protect your assets and ensure that our GPS devices are working properly, our team will be having an inspection on each of your vehicles as listed in the following table.

Kindly arrange the vehicles for device physical checking and please provide the person/s involved, locations, and contact numbers.
		
Your immediate response will be appreciated so we can arrange our team ahead of time and also to prioritize your desired date of inspection	,

${this.getTextTable().getMarkdown()}

Regards,`).getHtml();
		const mailer = new Mailer(mailConfig);

		return mailer.sendMail({
			body: htmlReport,
			nickname: "ATS Support",
			subject: `Non Reporting Vehicles ${DateUtils.getDateString()}`,
			to: recipients,
			cc
		});
	};
}
