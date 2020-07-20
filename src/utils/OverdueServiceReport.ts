import moment from "moment";
import { Api, Interval, Service, Unit } from "./fleet-run";
import { EmailReport } from "./EmailReport";
import { HtmlTable } from "./HtmlTable";
import { MailConfig } from "../config/types";
import { ReportColumn } from "../config/fleetrun-overdue-report";

interface OverdueServiceData {
	unit: string;
	serviceName: string;
	mileage: number | null;
	engineHours: number | null;
	mileageOverdue: number | null;
	daysOverdue: number | null;
	engineHoursOverdue: number | null;
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
		private options: {
			timezone?: string;
			columns?: ReportColumn[];
		}
	) {}

	private static getOverdues = (
		{
			service,
			unit,
			interval
		}: {
			service: Service;
			unit: Unit;
			interval: Interval;
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
			if (service.engineHours) {
				overdues.engineHoursOverdue = unit.engineHours - service.engineHours;
			} else {
				overdues.engineHoursOverdue = unit.engineHours;
			}
		}
		if (isMileageOverdue) {
			if (service.mileage) {
				overdues.mileageOverdue = unit.mileage - service.mileage;
			} else {
				overdues.mileageOverdue = unit.mileage;
			}
		}

		return overdues;
	};

	private static getOverdueMessage = (
		value: number | undefined | null
	): number | null => {
		if (value === undefined || value === null) {
			return null;
		}
		return value;
	};

	private static getServiceStatusMessage = (
		reportData: {
			service: Service;
			interval: Interval;
			unit: Unit;
		},
		timezone?: string
	): OverdueServiceData | null => {
		const overdues = OverdueServiceReport.getOverdues(
			{
				unit: reportData.unit,
				service: reportData.service,
				interval: reportData.interval
			},
			timezone
		);

		if (overdues) {
			const message: OverdueServiceData = {
				unit: reportData.unit.data.n,
				mileage: reportData.unit.mileage,
				engineHours: reportData.unit.engineHours,
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
			.reduce<OverdueServiceData[]>((acc, service) => {
				const unit = data.units.find((unit) => unit.data.id === service.data.uid);
				const interval = data.intervals.find(
					(interval) => interval.data.id === service.data.ivid
				);
				if (unit && interval) {
					const serviceStatus = OverdueServiceReport.getServiceStatusMessage(
						{
							unit,
							interval,
							service
						},
						timezone
					);
					serviceStatus && acc.push(serviceStatus);
				}
				return acc;
			}, []);
		return overdueServiceReportData;
	};

	public static create = async (
		token: string,
		fleetId: number,
		timezone?: string,
		columns?: ReportColumn[]
	): Promise<OverdueServiceReport> => {
		const reportData = await OverdueServiceReport.fetchReportData(token, fleetId);

		const overdueServices = OverdueServiceReport.composeOverdueServiceData(
			reportData,
			timezone
		);

		return new OverdueServiceReport(overdueServices, { timezone, columns });
	};

	private static formatStringValue = (
		value: number | null,
		append: string
	): string => {
		return typeof value === "number" ? `${value} ${append}` : "N/A";
	};

	private getHtmlTable = ({
		columns = Object.values(ReportColumn)
	}: {
		columns?: ReportColumn[];
	}) => {
		const tableColums = [
			"Unit name",
			"Service name",
			"Mileage counter (Km)",
			"Engine hours counter (Hour)"
		];
		const includeMilageColumn = columns.includes(ReportColumn.OVERDUE_MILEAGE);
		const includeDaysColumn = columns.includes(ReportColumn.OVERDUE_DAY);
		const includeEngineHoursColumn = columns.includes(
			ReportColumn.OVERDUE_ENGINE_HOURS
		);
		if (includeMilageColumn) {
			tableColums.push("Mileage overdue (Km)");
		}
		if (includeDaysColumn) {
			tableColums.push("Days overdue (Days)");
		}
		if (includeEngineHoursColumn) {
			tableColums.push("Engine hours overdue (Hours)");
		}
		let table = new HtmlTable(tableColums);
		for (const row of this.data) {
			const columnValues = [
				row.unit,
				row.serviceName,
				row.mileage || "N/A",
				row.engineHours || "N/A"
			];

			const mileage = OverdueServiceReport.formatStringValue(row.mileage, "km");
			if (includeMilageColumn) {
				columnValues.push(row.mileageOverdue || "N/A");
			}
			if (includeDaysColumn) {
				columnValues.push(row.daysOverdue || "N/A");
			}
			if (includeEngineHoursColumn) {
				columnValues.push(row.engineHoursOverdue || "N/A");
			}

			table.addRow(columnValues);
		}
		return table;
	};

	public sendReportByEmail = ({
		mailConfig,
		recipients,
		subject
	}: {
		mailConfig: MailConfig;
		recipients: string[];
		subject: string;
	}) => {
		const emailReport = new EmailReport(mailConfig);
		const currentDate = moment();
		emailReport.appendBody("<h1>Daily service overdue list.</h1>");
		emailReport.appendBody(this.getHtmlTable({ columns: this.options.columns }));
		if (this.options.timezone) {
			emailReport.appendBody(
				`<p>Sent ${currentDate.utcOffset(this.options.timezone).format()}</p>`
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
