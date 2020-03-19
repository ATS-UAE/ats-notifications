import moment from "moment";
import {
	Api,
	ServiceStatus,
	Fleet,
	Interval,
	Service,
	Unit
} from "./fleet-run";
import { EmailReport } from "./EmailReport";
import { HtmlTable } from "./HtmlTable";

interface OverdueServiceData {
	unit: string;
	serviceName: string;
	mileageOverdue: number | string;
	daysOverdue: number | string;
	engineHoursOverdue: number | string;
}

interface ReportData {
	services: Service[];
	intervals: Interval[];
	units: Unit[];
	api: Api;
}
interface Overdues {
	mileageOverdue: number | string | null;
	daysOverdue: number | string | null;
	engineHoursOverdue: number | string | null;
}

export class OverdueServiceReport {
	private constructor(
		private data: Array<OverdueServiceData>,
		private timezone?: string
	) {}

	private static getOverdues = (
		{
			service,
			unit
		}: {
			service: Service;
			unit: Unit;
		},
		timezone?: string
	): Overdues => {
		const overdues: Overdues = {
			daysOverdue: null,
			mileageOverdue: null,
			engineHoursOverdue: null
		};

		if (service.isDaysOverdue) {
			overdues.daysOverdue = service.getDate(timezone).fromNow();
		}
		if (service.isEngineHoursOverdue) {
			let engineHoursOverdue = unit.engineHours - service.engineHours;
			overdues.engineHoursOverdue = engineHoursOverdue;
		}
		if (service.isMileageOverdue) {
			let mileageOverdue = unit.mileage - service.mileage;
			overdues.mileageOverdue = mileageOverdue;
		}

		return overdues;
	};

	private static getOverdueMessage = (
		value: string | number | undefined | null
	): number | string => {
		if (value === undefined || value === null) {
			return "N/A";
		}
		return value;
	};

	private static getServiceStatusMessage = (
		reportData: {
			service: Service;
			intervals: Interval[];
			units: Unit[];
		},
		timezone?: string
	): OverdueServiceData => {
		const unit = reportData.units.find(
			unit => unit.data.id === reportData.service.data.uid
		);
		const overdues =
			unit &&
			OverdueServiceReport.getOverdues(
				{
					unit,
					service: reportData.service
				},
				timezone
			);

		const message: OverdueServiceData = {
			unit: unit?.data?.n || "N/A",
			serviceName: reportData.service.data.n,
			mileageOverdue: OverdueServiceReport.getOverdueMessage(
				overdues?.mileageOverdue
			),
			daysOverdue: OverdueServiceReport.getOverdueMessage(
				overdues?.daysOverdue
			),
			engineHoursOverdue: OverdueServiceReport.getOverdueMessage(
				overdues?.engineHoursOverdue
			)
		};

		return message;
	};

	private static fetchReportData = async (
		token: string,
		fleetId: number
	): Promise<ReportData> => {
		const api = new Api(token);
		const units = await Unit.getAll(api, fleetId);
		const intervals = await Interval.getAll(api, fleetId);
		const services = await Service.getAll(api, fleetId);

		return {
			api,
			units,
			intervals,
			services
		};
	};

	private static composeOverdueServiceData = (
		data: ReportData,
		timezone?: string
	): OverdueServiceData[] => {
		const overdueServiceReportData: OverdueServiceData[] = data.services
			.filter(service => !service.isInProgress)
			.map(service =>
				OverdueServiceReport.getServiceStatusMessage(
					{
						units: data.units,
						intervals: data.intervals,
						service
					},
					timezone
				)
			);
		return overdueServiceReportData;
	};

	public static create = async (
		token: string,
		fleetId: number,
		timezone?: string
	): Promise<OverdueServiceReport> => {
		const reportData = await OverdueServiceReport.fetchReportData(
			token,
			fleetId
		);

		const overdueServices = OverdueServiceReport.composeOverdueServiceData(
			reportData,
			timezone
		);

		return new OverdueServiceReport(overdueServices, timezone);
	};

	private getHtmlTable = () => {
		const table = new HtmlTable([
			"Unit name",
			"Service name",
			"Mileage overdue",
			"Days overdue",
			"Engine hours overdue"
		]);
		for (const row of this.data) {
			const mileageOverdue =
				typeof row.mileageOverdue === "number"
					? `${row.mileageOverdue} km`
					: row.mileageOverdue;

			const engineHoursOverdue =
				typeof row.engineHoursOverdue === "number"
					? `${row.engineHoursOverdue} hours`
					: row.engineHoursOverdue;

			table.addRow([
				row.unit,
				row.serviceName,
				mileageOverdue,
				row.daysOverdue,
				engineHoursOverdue
			]);
		}
		return table;
	};

	public sendReportByEmail = ({
		recipients,
		subject
	}: {
		recipients: string[];
		subject: string;
	}) => {
		const emailReport = new EmailReport();
		const currentDate = moment();
		emailReport.appendBody("<h1>Daily service overdue list.</h1>");
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
			subject
		});
	};
}
