import { parse } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Api, Fleet } from ".";
import { LineItem } from "./LineItem";

export interface ServiceData {
	/** Attachments number */
	ats: number;
	/** cost */
	c: number | null;
	/** Engine hour counter */
	cneh: number | null;
	/** Mileage counter */
	cnm: number | null;
	/** Details */
	d: string;
	/** Flags that indicate service status. */
	f: number;
	/** Finish date in format "YYYY-MM-DD" */
	fdt: string | null;
	/** Fleet ID */
	fid: number;
	/** Finish time in format "HH:mm:ss" */
	ftm: string;
	/** Service ID */
	id: number;
	/** Interval ID */
	ivid: number;
	/** Line items */
	li: Array<LineItem>;
	/** Last engine hour service */
	limcneh: number | null;
	/** Last mileage service */
	limcnm: number | null;
	/** Last service date in format "YYYY-MM-DD" */
	limdt: string | null;
	/** Name */
	n: string;
	/** Starting date in format "YYYY-MM-DD" */
	sdt: string | null;
	/** Starting time in format HH:mm:ss */
	stm: string;
	/** Unix timestamp of latest update. */
	tm: number;
	/** Unit ID */
	uid: number;
	/** Entity type, one of: u - unit, t - trailer, d - driver */
	t: "u" | "t" | "d";
}

export enum ServiceStatus {
	NEW = 0,
	UPCOMING = 1,
	IN_PROGRESS = 2,
	OVERDUE = 4,
	CLOSED = 8,
	REJECTED = 16,
	MANUALLY_CREATED = 128,
	OVERDUE_BY_MILEAGE = 256,
	OVERDUE_BY_ENGINE_HOURS = 512,
	OVERDUE_BY_DAYS = 1024
}

function numberSorter(num1: number, num2: number) {
	if (num1 > num2) {
		return 1;
	} else if (num1 < num2) {
		return -1;
	}
	return 0;
}

export class Service {
	/** The values of ServiceStatus enum stored in an array. */
	private static POSSIBLE_FLAG_VALUES: ServiceStatus[] = Object.keys(
		ServiceStatus
	)
		.map((k) => ServiceStatus[k as any])
		.map((v: unknown) => v as ServiceStatus)
		.filter((ss) => ss in ServiceStatus)
		.sort(numberSorter)
		.reverse();

	public serviceStatus: ServiceStatus[] = [];

	constructor(private api: Api, public data: ServiceData) {
		this.serviceStatus = Service.getServiceStatus(data.f);
	}

	get serviceName() {
		return this.data.n;
	}

	get isInProgress() {
		return this.serviceStatus.includes(ServiceStatus.IN_PROGRESS);
	}
	get isMileageOverdue() {
		return (
			this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
			this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_MILEAGE)
		);
	}
	get isEngineHoursOverdue() {
		return (
			this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
			this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_ENGINE_HOURS)
		);
	}
	get isDaysOverdue() {
		return (
			this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
			this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_DAYS)
		);
	}

	get mileage() {
		return this.data.cnm;
	}

	get engineHours() {
		return this.data.cneh;
	}

	public getDate(timezone?: string): Date | null {
		const date = [this.data.sdt, "YYYY-MM-DD"];
		const time = [this.data.stm, "HH:mm:ss"];

		try {
			const parsedDate = parse(date[0] + time[0], date[1] + time[1], new Date());
			if (timezone) {
				return utcToZonedTime(parsedDate, timezone);
			}
			return parsedDate;
		} catch (e) {
			return null;
		}
	}

	public static getAll = (api: Api, fleet: Fleet | number) =>
		api
			.runApi<{ services: ServiceData[] }>(
				`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/services`,
				"GET"
			)
			.then((res) => res.services.map((service) => new Service(api, service)));

	public static getServiceStatus = (flags: number): ServiceStatus[] => {
		let flagRemaining = flags;
		const status: ServiceStatus[] = [];

		for (const value of Service.POSSIBLE_FLAG_VALUES) {
			if (flagRemaining >= value) {
				status.push(value);
				flagRemaining -= value;
			}
		}

		return status.sort(numberSorter);
	};
}
