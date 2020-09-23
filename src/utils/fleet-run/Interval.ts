import { Api } from "./Api";
import { Fleet } from "./Fleet";
import { LineItem } from "./LineItem";

export interface UnitInterval {
	/** Entity ID */
	id: number;
	/** Enity type. One of: u - unit, t - trailer, d - driver. */
	t: "u" | "t" | "d";
	/** Last engine hours */
	lcneh: number | null;
	/** Last mileage. */
	lcnm: number | null;
	/** Last date in format "YYYY-MM-DD" */
	ldt: string | null;
}
export interface IntervalData {
	/** Cost */
	c: number | null;
	/** Engine hours delta */
	cnehd: number | null;
	/** Engine hours enabled */
	cnehe: boolean;
	/** Engine hours offset */
	cneho: number | null;
	/** Mileage delta */
	cnmd: number | null;
	/** Mileage enabled */
	cnme: boolean;
	/** Mileage offset */
	cnmo: number | null;
	/** details */
	d: string;
	/** Days delta */
	dd: string | null;
	/** Days enabled */
	de: boolean;
	/** Days offset */
	do: boolean;
	/** Interval ID */
	id: number;

	li: LineItem[];
	n: string;
	/**Assigned units*/
	tm: number;
	/**Assigned units*/
	u: UnitInterval[];
}

export class Interval {
	constructor(private api: Api, public data: IntervalData) {}

	get daysFrequency() {
		const { dd } = this.data;
		if (dd) {
			return parseInt(dd.replace("d", ""));
		}
		return null;
	}

	get mileageFrequency() {
		const { cnmd } = this.data;
		return cnmd;
	}

	get engineHoursFrequency() {
		const { cnehd } = this.data;
		return cnehd;
	}

	public static getAll = (api: Api, fleet: number | Fleet) =>
		api
			.runApi<{ intervals: IntervalData[] }>(
				`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/intervals`,
				"GET"
			)
			.then((res) => res.intervals.map((interval) => new Interval(api, interval)));
}
