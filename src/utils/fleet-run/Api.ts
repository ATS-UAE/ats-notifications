import https from "https";

export class Api {
	constructor(private token: string) {}

	public runApi = <T extends object>(
		path: string,
		method: "GET" | "POST" | "UPDATE" | "DELETE"
	): Promise<T> =>
		new Promise((resolve, reject) => {
			const BASE_URL = "https://fleetrun.wialon.com/api";
			let data = "";
			const request = https.request(
				BASE_URL + path,
				{
					method,
					headers: {
						Authorization: "Token " + this.token,
						accept: "application/json"
					}
				},
				res => {
					res.on("data", (chunk: Buffer) => {
						data += chunk.toString("utf8");
					});
					res.on("end", () => {
						resolve(JSON.parse(data));
					});
					res.on("error", error => {
						reject(error);
					});
				}
			);
			request.on("error", error => {
				reject(error);
			});
			request.end();
		});
}
