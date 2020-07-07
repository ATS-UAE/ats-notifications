import moment from "moment";
import { Api, Interval, Service, Unit } from "./fleet-run";
import { EmailReport } from "./EmailReport";
import { HtmlTable } from "./HtmlTable";

interface OverdueServiceData {
	unit: string;
	serviceName: string;
	mileage: number | "N/A";
	engineHours: number | "N/A";
	mileageOverdue: number | "N/A";
	daysOverdue: number | "N/A";
	engineHoursOverdue: number | "N/A";
}

interface ReportData {
	services: Service[];
	intervals: Interval[];
	units: Unit[];
	api: Api;
}
interface Overdues {
	mileageOverdue: number | null;
	daysOverdue: number | null;
	engineHoursOverdue: number | null;
}

export class OverdueServiceReport {
	private constructor(
		public data: Array<OverdueServiceData>,
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
	): Overdues | null => {
		const overdues: Overdues = {
			daysOverdue: null,
			mileageOverdue: null,
			engineHoursOverdue: null
		};
		const isDaysOverdue = service.isDaysOverdue;
		const isEngineHoursOverdue = service.isEngineHoursOverdue;
		const isMileageOverdue = service.isMileageOverdue;

		if (!isMileageOverdue && !isEngineHoursOverdue && !isDaysOverdue) {
			return null;
		}

		if (isDaysOverdue) {
			const serviceDate = service.getDate(timezone);
			overdues.daysOverdue =
				(serviceDate && moment().diff(serviceDate, "days")) || null;
		}
		if (isEngineHoursOverdue) {
			const engineHoursOverdue = unit.engineHours - service.engineHours;
			overdues.engineHoursOverdue = engineHoursOverdue;
		}
		if (isMileageOverdue) {
			const mileageOverdue = unit.mileage - service.mileage;
			overdues.mileageOverdue = mileageOverdue;
		}

		return overdues;
	};

	private static getOverdueMessage = (
		value: number | undefined | null
	): number | "N/A" => {
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
	): OverdueServiceData | null => {
		const unit = reportData.units.find(
			(unit) => unit.data.id === reportData.service.data.uid
		);
		if (unit) {
			const overdues = OverdueServiceReport.getOverdues(
				{
					unit,
					service: reportData.service
				},
				timezone
			);

			if (overdues) {
				const message: OverdueServiceData = {
					unit: unit.data.n,
					mileage: unit.mileage,
					engineHours: unit.engineHours,
					serviceName: reportData.service.data.n,
					mileageOverdue: OverdueServiceReport.getOverdueMessage(
						overdues.mileageOverdue
					),
					daysOverdue: OverdueServiceReport.getOverdueMessage(overdues.daysOverdue),
					engineHoursOverdue: OverdueServiceReport.getOverdueMessage(
						overdues.engineHoursOverdue
					)
				};
				return message;
			}
		}
		return null;
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
			.filter((service) => !service.isInProgress)
			.map((service) =>
				OverdueServiceReport.getServiceStatusMessage(
					{
						units: data.units,
						intervals: data.intervals,
						service
					},
					timezone
				)
			)
			.filter((service): service is OverdueServiceData => service !== null);
		return overdueServiceReportData;
	};

	public static create = async (
		token: string,
		fleetId: number,
		timezone?: string
	): Promise<OverdueServiceReport> => {
		const reportData = await OverdueServiceReport.fetchReportData(token, fleetId);

		const overdueServices = OverdueServiceReport.composeOverdueServiceData(
			reportData,
			timezone
		);

		return new OverdueServiceReport(overdueServices, timezone);
	};

	private static formatStringValue = (
		value: number | string,
		append: string
	) => {
		return typeof value === "number" ? `${value} ${append}` : value;
	};

	private getHtmlTable = () => {
		const table = new HtmlTable([
			"Unit name",
			"Service name",
			"Mileage counter",
			"Engine hours counter",
			"Mileage overdue",
			"Days overdue",
			"Engine hours overdue"
		]);
		for (const row of this.data) {
			const mileageOverdue = OverdueServiceReport.formatStringValue(
				row.mileageOverdue,
				"km"
			);

			const engineHoursOverdue = OverdueServiceReport.formatStringValue(
				row.engineHoursOverdue,
				"hours"
			);

			const engineHours = OverdueServiceReport.formatStringValue(
				row.engineHours,
				"hours"
			);

			const mileage = OverdueServiceReport.formatStringValue(row.mileage, "km");

			table.addRow([
				row.unit,
				row.serviceName,
				mileage,
				engineHours,
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
			subject,
			nickname: "FleetRun Notifications"
		});
	};
}
