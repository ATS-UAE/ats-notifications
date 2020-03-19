import { Api } from "./Api";
import { Fleet } from "./Fleet";

export interface UnitData {
	bact: number;
	cid: number;
	cneh: number;
	cnm: number;
	d: unknown;
	fid: number;
	id: number;
	ins: boolean;
	ivals: number[];
	n: string;
	pd: string;
	pt: number;
	tm: number;
}

export class Unit {
	constructor(private api: Api, public data: UnitData) {}

	get mileage() {
		return this.data.cnm;
	}

	get engineHours() {
		return this.data.cneh;
	}

	public static getAll = (api: Api, fleet: Fleet | number) =>
		api
			.runApi<{ units: UnitData[] }>(
				`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/units`,
				"GET"
			)
			.then(res => res.units.map(unit => new Unit(api, unit)));
}
