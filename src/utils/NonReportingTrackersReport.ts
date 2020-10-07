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

interface TrackerData {
	vehicle: string;
	chassis: string;
	plateNumber: string;
	imei: string;
	client: string;
	daysSinceLastReport: number | null;
	lastReport: string;
	system: string;
	subclient: string;
	subclient2: string;
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

export class NonReportingTrackersReport {
	private constructor(
		public data: Array<TrackerData>,
		private timezone?: string
	) {}

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
					chassis: jobCard?.chassis || "N/A",
					client: jobCard?.client || "N/A",
					subclient: jobCard?.subclient?.name || "N/A",
					subclient2: jobCard?.subclient?.subclient?.name || "N/A",
					daysSinceLastReport,
					imei: tracker.imei,
					lastReport: (lastReport && formatISO(lastReport)) || "N/A",
					plateNumber: jobCard?.plateNo || "N/A",
					vehicle: jobCard?.vehicle || "N/A",
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
					chassis: jobCard?.chassis || "N/A",
					client: jobCard?.client || "N/A",
					daysSinceLastReport,
					subclient: jobCard?.subclient?.name || "N/A",
					subclient2: jobCard?.subclient?.subclient?.name || "N/A",
					imei: tracker.uid || tracker.nm || "N/A",
					lastReport: (lastReport && formatISO(lastReport)) || "N/A",
					plateNumber: jobCard?.plateNo || "N/A",
					vehicle: jobCard?.vehicle || "N/A",
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
		timezone?: string
	): Promise<NonReportingTrackersReport> => {
		const reportData = await NonReportingTrackersReport.fetchReportData(
			credentials,
			options
		);

		return new NonReportingTrackersReport(reportData, timezone);
	};

	private getHtmlTable = () => {
		const table = new HtmlTable([
			"System",
			"Client",
			"IMEI",
			"Vehicle",
			"Plate Number",
			"Chassis",
			"Days Since Last Report",
			"Last Report Date"
		]);
		this.data.forEach((row) => {
			table.addRow([
				row.system,
				row.client,
				row.subclient2,
				row.imei,
				row.vehicle,
				row.plateNumber,
				row.chassis,
				row.daysSinceLastReport || "N/A",
				row.lastReport
			]);
		});
		return table;
	};

	public getTextTable = () => {
		const table = new TextTable();
		table.addRow([
			"System",
			"Client",
			"Subclient",
			"IMEI",
			"Vehicle",
			"Plate Number",
			"Chassis",
			"Days Since Last Report",
			"Last Report Date"
		]);
		this.data.forEach((row) => {
			table.addRow([
				row.system,
				row.client,
				row.subclient,
				row.subclient2,
				row.imei,
				row.vehicle,
				row.plateNumber,
				row.chassis,
				row.daysSinceLastReport || "N/A",
				row.lastReport
			]);
		});
		return table;
	};

	public printTextTable = () => {
		const table = this.getTextTable();
		return table.render();
	};

	public sendReportByEmail = ({
		mailConfig,
		recipients,
		subject,
		threshold
	}: {
		mailConfig: MailConfig;
		recipients: string[];
		subject: string;
		threshold: number;
	}) => {
		const emailReport = new EmailReport(mailConfig);
		const currentDate = new Date();
		emailReport.appendBody("<h1>Non Reporting Tracker List.</h1>");
		emailReport.appendBody(
			`<p>Vehicles not reporting for more than ${threshold} days.</p>`
		);
		emailReport.appendBody(this.getHtmlTable());
		if (this.timezone) {
			emailReport.appendBody(
				`<p>Sent ${formatISO(utcToZonedTime(currentDate, this.timezone))}</p>`
			);
		} else {
			emailReport.appendBody(`<p>Sent ${formatISO(currentDate)}</p>`);
		}

		return emailReport.send({
			to: recipients,
			subject,
			nickname: "ATS Notifications"
		});
	};
}
