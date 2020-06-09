import mysql, { RowDataPacket } from "mysql2/promise";

interface FindAllOptions {
	active?: boolean;
}

interface JobCardTableFields extends RowDataPacket {
	id: number;
	chassis_no: string;
	imei_no: string;
	client_name: string;
	plate_no: string;
	vehicle: string;
	active: string;
	system_type: string;
}

interface DataBaseConnectionOptions {
	host: string;
	user: string;
	password: string;
	database: string;
}

export class JobCard {
	public id: number;
	public chassis: string;
	public client: string;
	public plateNo: string;
	public vehicle: string;
	public active: boolean;
	public imei: string;
	public systemType: "securepath" | "wialon";
	constructor(data: JobCardTableFields) {
		this.id = data.id;
		this.chassis = data.chassis_no;
		this.client = data.client_name;
		this.plateNo = data.plate_no;
		this.vehicle = data.vehicle;
		this.active = data.active === "yes";
		this.imei = data.imei_no;
		this.systemType =
			data.system_type.toLowerCase() === "securepath" ? "securepath" : "wialon";
	}

	public static findAll = async (
		dataBaseOptions: DataBaseConnectionOptions,
		findAllOptions?: FindAllOptions
	) => {
		let query = `SELECT * FROM job_cards;`;
		if (findAllOptions?.active) {
			query = `SELECT * FROM job_cards where active = "yes"`;
		}
		const connection = await mysql.createConnection(dataBaseOptions);
		const [jobCards] = await connection.query<JobCardTableFields[]>(query);
		return jobCards.map((j) => new JobCard(j));
	};
}
