import minimist from "minimist";
import * as yup from "yup";
import { MailConfig, DatabaseConfig } from "./types";

export interface FleetRunOverdueEmailReportCommandLineArgs {
	h?: boolean;
	help?: boolean;
	/** Comma separated emails. */
	recipients?: string;
	/** Comma separated emails. */
	cc?: string;
	// eg. "+04:00"
	timezone?: string;
	"db-name"?: string;
	"db-user"?: string;
	"db-pass"?: string;
	"db-host"?: string;
	"sp-user"?: string;
	"sp-password"?: string;
	"wialon-token"?: string;
	/** Non reporting days before it is included in the report */
	threshold?: string;
	"mail-host"?: string;
	"mail-user"?: string;
	"mail-pass"?: string;
	"mail-port"?: string;
	/** Comma separated clients to pick from. */
	clients?: string;
	/** comma separated column numbers starting from 1 */
	columns?: string;
}

export interface SecurePathConfig {
	user: string;
	pass: string;
}

export interface WialonConfig {
	token: string;
}

const validator = yup
	.object()
	.shape({
		h: yup.boolean().default(false),
		help: yup.boolean().default(false),
		recipients: yup
			.array(yup.string().required())
			.notRequired()
			.transform((v, ogV) => {
				return ogV.split(",");
			}),
		timezone: yup.string(),
		"db-name": yup.string().required(),
		"db-user": yup.string().required(),
		"db-pass": yup.string().required(),
		"db-host": yup.string().required(),
		"sp-user": yup.string().required(),
		"sp-password": yup.string().required(),
		"wialon-token": yup.string().required(),
		threshold: yup.number().required().default(7),
		"mail-host": yup.string(),
		"mail-user": yup.string(),
		"mail-pass": yup.string(),
		"mail-port": yup.number(),
		columns: yup
			.array(yup.number().required())
			.notRequired()
			.transform((v, ogV) => {
				return ogV.split(",").map((string: string) => parseInt(string));
			}),
		cc: yup
			.array(yup.string().required())
			.notRequired()
			.transform((v, ogV) => {
				return ogV.split(",");
			}),
		clients: yup
			.array(yup.string().required())
			.notRequired()
			.transform((v, ogV) => {
				return ogV.split(",");
			})
	})
	.required();

const parsedArgs = minimist<FleetRunOverdueEmailReportCommandLineArgs>(
	process.argv
);

validator.validateSync(parsedArgs);

export const args = validator.cast(parsedArgs);

export let mail: MailConfig | null = null;

if (
	args["mail-host"] &&
	args["mail-pass"] &&
	args["mail-port"] &&
	args["mail-user"]
) {
	mail = {
		host: args["mail-host"],
		pass: args["mail-pass"],
		port: args["mail-port"],
		user: args["mail-user"]
	};
}

export const database: DatabaseConfig = {
	name: args["db-name"],
	host: args["db-host"],
	pass: args["db-pass"],
	user: args["db-user"]
};

export const securepath: SecurePathConfig = {
	user: args["sp-user"],
	pass: args["sp-password"]
};

export const wialon: WialonConfig = {
	token: args["wialon-token"]
};

export const options = {
	threshold: args.threshold,
	timezone: args.timezone,
	recipients: args.recipients,
	columns: args.columns,
	cc: args.cc,
	clients: args.clients
};
