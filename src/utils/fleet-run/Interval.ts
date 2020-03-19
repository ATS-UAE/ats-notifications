import { Api } from "./Api";
import { Fleet } from "./Fleet";

export interface IntervalData {
	c: number | null;
	cnehd: number | null;
	cnehe: boolean;
	cneho: number | null;
	cnmd: number | null;
	cnme: boolean;
	cnmo: number | null;
	d: string;
	dd: string;
	de: boolean;
	do: boolean;
	id: number;
	li: Array<unknown>;
	n: string;
	/**Assigned units*/
	tm: number;
	/**Assigned units*/
	u: Array<{
		/**Entity id*/
		id: number;
		/**Entity Type */
		t: string;
		/**last engine hours */
		lcneh: number;
		/**last mileage */
		lcnm: number;
		/**last date */
		ldt: string;
	}>;
}

export class Interval {
	constructor(private api: Api, public data: IntervalData) {}

	public static getAll = (api: Api, fleet: number | Fleet) =>
		api
			.runApi<{ intervals: IntervalData[] }>(
				`/fleets/${
					typeof fleet === "number" ? fleet : fleet.data.id
				}/intervals`,
				"GET"
			)
			.then(res => res.intervals.map(interval => new Interval(api, interval)));
}
