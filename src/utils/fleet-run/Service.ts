import moment from "moment";
import { Api, Fleet } from ".";

export interface ServiceData {
	ats: number;
	c: number | null;
	cneh: number | null;
	/** Mileage counter */
	cnm: number;
	d: string;
	f: number;
	/** Date in format "2020-03-16" */
	fdt: string;
	fid: number;
	ftm: string;
	id: number;
	ivid: number;
	li: Array<{
		c: number;
		id: number;
		n: string;
		num: number;
		t: 1;
	}>;
	limcneh: number;
	limcnm: number;
	/** Date in format "2020-03-16" */
	limdt: string;
	n: string;
	/** Starting date in format "2020-03-16" */
	sdt: string;
	stm: string;
	tm: number;
	uid: number;
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
	private static POSSIBLE_FLAG_VALUES: ServiceStatus[] = Object.keys(
		ServiceStatus
	)
		.map((k) => ServiceStatus[k as any])
		.map((v: unknown) => v as ServiceStatus)
		.filter((ss) => ss in ServiceStatus)
		.sort(numberSorter)
		.reverse();

	constructor(private api: Api, public data: ServiceData) {}

	get isInProgress() {
		return this.getServiceStatus().includes(ServiceStatus.IN_PROGRESS);
	}
	get isMileageOverdue() {
		const serviceStatus = this.getServiceStatus();
		return (
			serviceStatus.includes(ServiceStatus.OVERDUE) &&
			serviceStatus.includes(ServiceStatus.OVERDUE_BY_MILEAGE)
		);
	}
	get isEngineHoursOverdue() {
		const serviceStatus = this.getServiceStatus();
		return (
			serviceStatus.includes(ServiceStatus.OVERDUE) &&
			serviceStatus.includes(ServiceStatus.OVERDUE_BY_ENGINE_HOURS)
		);
	}
	get isDaysOverdue() {
		const serviceStatus = this.getServiceStatus();
		return (
			serviceStatus.includes(ServiceStatus.OVERDUE) &&
			serviceStatus.includes(ServiceStatus.OVERDUE_BY_DAYS)
		);
	}

	get mileage() {
		return this.data.cnm;
	}

	get engineHours() {
		return this.data.cnm;
	}

	public getDate(timeZone?: string): moment.Moment | null {
		const date = [this.data.sdt, "YYYY-MM-DD"];
		const time = [this.data.stm, "HH:mm:ss"];

		const parsedDate = moment(date[0] + time[0], date[1] + time[1]);

		if (timeZone) {
			return parsedDate.utcOffset(timeZone);
		}
		if (!parsedDate.isValid) {
			return null;
		}
		return parsedDate;
	}

	public static getAll = (api: Api, fleet: Fleet | number) =>
		api
			.runApi<{ services: ServiceData[] }>(
				`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/services`,
				"GET"
			)
			.then((res) => res.services.map((service) => new Service(api, service)));

	public getServiceStatus = (): ServiceStatus[] => {
		let flagRemaining = this.data.f;
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
