import moment from "moment";
import { Wialon, CoreSearchItemsResponse } from "node-wialon";
import { SecurePath, LiveTrackerItem } from "securepath-api";
import { EmailReport } from "./EmailReport";
import { HtmlTable } from "./HtmlTable";
import { JobCard } from "./job-card/JobCard";

interface TrackerData {
	vehicle: string;
	chassis: string;
	plateNumber: string;
	imei: string;
	client: string | null;
	daysSinceLastReport: number | null;
	lastReport: string;
	system: string;
}

interface ResourceCredentials {
	dbUser: string;
	dbPass: string;
	dbHost: string;
	spUser: string;
	spPassword: string;
	wialonToken: string;
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
			const lastReport = tracker.timestamp && moment(tracker.timestamp, "X");
			const daysSinceLastReport = lastReport
				? moment().diff(lastReport, "days")
				: null;
			if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
				const jobCard = jobCards.find(
					(jc) => String(jc.imei) === String(tracker.imei)
				);
				acc.push({
					chassis: jobCard?.chassis || "N/A",
					client: jobCard?.client || "N/A",
					daysSinceLastReport,
					imei: tracker.imei,
					lastReport: (lastReport && lastReport.format()) || "N/A",
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
				(tracker.lmsg?.t && moment(tracker.lmsg.t, "X")) || undefined;
			const daysSinceLastReport = lastReport
				? moment().diff(lastReport, "days")
				: null;
			if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
				const jobCard =
					(tracker.uid &&
						jobCards.find((jc) => String(jc.imei) === String(tracker.uid))) ||
					undefined;
				if (!tracker.uid) {
					console.log(`${tracker.nm} has no IMEI`);
				}
				acc.push({
					chassis: jobCard?.chassis || "N/A",
					client: jobCard?.client || "N/A",
					daysSinceLastReport,
					imei: tracker.uid || tracker.nm || "N/A",
					lastReport: (lastReport && lastReport.format()) || "N/A",
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
			credentials.spUser,
			credentials.spPassword,
			{ baseUrl: "http://rac.securepath.ae:1024" }
		);
		const securepathUnits = await sp.Live.getTrackers();
		const jobCards = await JobCard.findAll(
			{
				database: "atsoperations",
				host: credentials.dbHost,
				password: credentials.dbPass,
				user: credentials.dbUser
			},
			{
				active: true
			}
		);
		const w = await Wialon.login({
			token: credentials.wialonToken
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
				row.client || "N/A",
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

	public sendReportByEmail = ({
		recipients,
		subject,
		threshold
	}: {
		recipients: string[];
		subject: string;
		threshold: number;
	}) => {
		const emailReport = new EmailReport();
		const currentDate = moment();
		emailReport.appendBody("<h1>Non Reporting Tracker List.</h1>");
		emailReport.appendBody(
			`<p>Vehicles not reporting for more than ${threshold} days.</p>`
		);
		emailReport.appendBody(this.getHtmlTable());
		if (this.timezone) {
			emailReport.appendBody(
				`<p>Sent ${currentDate.utcOffset(this.timezone).format()}</p>`
			);
		} else {
			emailReport.appendBody(`<p>Sent ${currentDate.format()}</p>`);
		}

		return emailReport.send({
			to: recipients,
			subject,
			nickname: "ATS Notifications"
		});
	};
}
