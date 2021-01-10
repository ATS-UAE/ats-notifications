"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCard = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
class JobCard {
    constructor(data) {
        this.id = data.id;
        this.chassis = data.chassis_no;
        this.client = {
            name: data.client_name
        };
        this.plateNo = data.plate_no;
        this.vehicle = data.vehicle;
        this.active = data.active === "yes";
        this.imei = data.imei_no;
        this.systemType =
            data.system_type.toLowerCase() === "securepath" ? "securepath" : "wialon";
        if (data.sub_client) {
            this.client.subclient = {
                name: data.sub_client
            };
            if (data.subclient_2) {
                this.client.subclient.subclient = {
                    name: data.subclient_2
                };
            }
        }
    }
}
exports.JobCard = JobCard;
JobCard.findAll = async (dataBaseOptions, findAllOptions) => {
    let query = `SELECT * FROM job_cards;`;
    if (findAllOptions?.active) {
        query = `SELECT * FROM job_cards where active = "yes"`;
    }
    const connection = await promise_1.default.createConnection(dataBaseOptions);
    const [jobCards] = await connection.query(query);
    return jobCards.map((j) => new JobCard(j));
};
//# sourceMappingURL=JobCard.js.map