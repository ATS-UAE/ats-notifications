import { differenceInDays, sub, formatISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Api, Interval, Service, Unit } from "./fleet-run";
import { EmailReport } from "./EmailReport";
import { HtmlTable } from "./HtmlTable";
import { MailConfig } from "../config/types";
import { ReportColumn } from "../config/fleetrun-overdue-report";

interface OverdueServiceData {
	unit: string;
	serviceName: string;
	mileage: number | null;
	mileageFrequency: number | null;
	engineHours: number | null;
	mileageOverdue: number | null;
	daysOverdue: number | null;
	daysFrequency: number | null;
	engineHoursOverdue: number | null;
	engineHoursFrequency: number | null;
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
	public data: Array<OverdueServiceData>;
	private options: {
		timezone: string;
		columns: ReportColumn[];
	};
	private constructor(
		data: Array<OverdueServiceData>,
		options: {
			timezone: string;
			columns?: ReportColumn[];
		}
	) {
		this.data = data;
		this.options = {
			timezone: options.timezone,
			columns: options.columns || Object.values(ReportColumn)
		};
	}

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
				(serviceDate && differenceInDays(new Date(), serviceDate)) || null;
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
			const { unit, service, interval } = reportData;
			const { unitName, mileage, engineHours } = unit;

			const { serviceName } = service;
			const { mileageFrequency, engineHoursFrequency, daysFrequency } = interval;

			const message: OverdueServiceData = {
				unit: unitName,
				mileage: mileage,
				engineHours: engineHours,
				serviceName: serviceName,
				mileageOverdue: OverdueServiceReport.getOverdueMessage(
					overdues.mileageOverdue
				),
				mileageFrequency,
				daysFrequency,
				engineHoursFrequency,
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
		timezone: string,
		columns?: ReportColumn[]
	): Promise<OverdueServiceReport> => {
		const reportData = await OverdueServiceReport.fetchReportData(token, fleetId);

		const overdueServices = OverdueServiceReport.composeOverdueServiceData(
			reportData,
			timezone
		);

		return new OverdueServiceReport(overdueServices, { timezone, columns });
	};

	public getFleetRunOverdueHtmlTable = () => {
		const tableColums = [
			"Unit name",
			"Service name",
			"Mileage counter (Km)",
			"Engine hours counter (Hour)"
		];
		const includeMilageColumn = this.options.columns.includes(
			ReportColumn.OVERDUE_MILEAGE
		);
		const includeDaysColumn = this.options.columns.includes(
			ReportColumn.OVERDUE_DAY
		);
		const includeEngineHoursColumn = this.options.columns.includes(
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

	public getServiceOverdueHtmlTable = (): HtmlTable => {
		const table = new HtmlTable([
			"Unit",
			"Service",
			"Unit",
			"Frequency",
			"Current Reading",
			"Last Service",
			"Overdue"
		]);

		const includeMilageColumn = this.options.columns.includes(
			ReportColumn.OVERDUE_MILEAGE
		);
		const includeDaysColumn = this.options.columns.includes(
			ReportColumn.OVERDUE_DAY
		);
		const includeEngineHoursColumn = this.options.columns.includes(
			ReportColumn.OVERDUE_ENGINE_HOURS
		);

		this.data.forEach((service) => {
			if (includeMilageColumn && service.mileageOverdue !== null) {
				const lastService = service.mileage
					? service.mileage -
					  (service.mileageOverdue + (service.mileageFrequency ?? 0))
					: "";
				table.addRow([
					service.unit,
					service.serviceName,
					"Km",
					service.mileageFrequency || "",
					service.mileage || "",
					lastService,
					service.mileageOverdue
				]);
			}
			if (includeDaysColumn && service.daysOverdue !== null) {
				const lastService = formatISO(
					sub(new Date(), {
						days: service.daysOverdue + (service.daysFrequency ?? 0)
					})
				);
				table.addRow([
					service.unit,
					service.serviceName,
					"Day",
					service.daysFrequency || "",
					"",
					lastService,
					service.daysOverdue
				]);
			}
			if (includeEngineHoursColumn && service.engineHoursOverdue !== null) {
				const lastService = service.engineHours
					? service.engineHours -
					  (service.engineHoursOverdue + (service.engineHoursFrequency ?? 0))
					: "";
				table.addRow([
					service.unit,
					service.serviceName,
					"Hr",
					service.engineHoursFrequency || "",
					service.engineHours || "",
					lastService,
					service.engineHoursOverdue
				]);
			}
		});

		return table;
	};

	public sendReportByEmail = ({
		mailConfig,
		recipients,
		subject,
		html
	}: {
		mailConfig: MailConfig;
		recipients: string[];
		subject: string;
		html: HtmlTable;
	}) => {
		const emailReport = new EmailReport(mailConfig);
		const currentDate = new Date();
		emailReport.appendBody("<h1>Daily service overdue list.</h1>");
		emailReport.appendBody(html);
		if (this.options.timezone) {
			emailReport.appendBody(
				`<p>Sent ${formatISO(
					utcToZonedTime(currentDate, this.options.timezone)
				)}</p>`
			);
		} else {
			emailReport.appendBody(`<p>Sent ${formatISO(currentDate)}</p>`);
		}

		return emailReport.send({
			to: recipients,
			subject,
			nickname: "FleetRun Notifications"
		});
	};
}
