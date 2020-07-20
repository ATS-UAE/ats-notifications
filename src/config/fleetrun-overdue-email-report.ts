import minimist from "minimist";
import * as yup from "yup";
import { MailConfig, DatabaseConfig } from "./types";

export interface FleetRunOverdueEmailReportCommandLineArgs {
	h?: boolean;
	help?: boolean;
	recipient?: string[];
	subject?: string;
	// eg. "+04:00"
	timezone?: string;
	token?: string;
	"fleet-id"?: string;
	"mail-host"?: string;
	"mail-user"?: string;
	"mail-pass"?: string;
	"mail-port"?: string;
}

const validator = yup
	.object()
	.shape({
		h: yup.boolean().required().default(false),
		help: yup.boolean().required().default(false),
		recipient: yup
			.array(yup.string().required())
			.required()
			.transform((v, ogV) => (typeof ogV === "string" ? [ogV] : ogV)),
		subject: yup.string().required(),
		timezone: yup.string(),
		token: yup.string().required(),
		"fleet-id": yup.number().required(),
		"mail-host": yup.string().required(),
		"mail-user": yup.string().required(),
		"mail-pass": yup.string().required(),
		"mail-port": yup.number().required()
	})
	.required();

const parsedArgs = minimist<FleetRunOverdueEmailReportCommandLineArgs>(
	process.argv
);

validator.validateSync(parsedArgs);

export const args = validator.cast(parsedArgs);

export const mail: MailConfig = {
	host: args["mail-host"],
	pass: args["mail-pass"],
	port: args["mail-port"],
	user: args["mail-user"]
};

export const options = {
	timezone: args.timezone,
	recipients: args.recipient,
	subject: args.subject,
	token: args.token,
	fleetId: args["fleet-id"]
};
