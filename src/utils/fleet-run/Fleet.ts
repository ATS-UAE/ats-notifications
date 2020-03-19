import { Api } from ".";

export interface FleetData {
	id: number;
}

export class Fleet {
	constructor(private api: Api, public data: FleetData) {}

	public static getAll = async (api: Api) =>
		api
			.runApi<{ fleets: FleetData[] }>("/fleets", "GET")
			.then(res => res.fleets.map(fleet => new Fleet(api, fleet)));
}
