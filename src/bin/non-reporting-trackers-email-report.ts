#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import minimist from "minimist";
import { NonReportingTrackersReport } from "../utils/NonReportingTrackersReport";

// Command line argument options.
interface CommandLineArgs {
	h?: boolean;
	help?: boolean;
	recipient?: string | string[];
	subject?: string;
	// eg. "+04:00"
	timezone?: string;
	"db-user"?: string;
	"db-pass"?: string;
	"db-host"?: string;
	"sp-user"?: string;
	"sp-password"?: string;
	"wialon-token"?: string;
	threshold?: number;
}

const args = minimist<CommandLineArgs>(process.argv);

if (args.h || args.help) {
	console.log(`Work in progress...`);
	process.exit(0);
}

if (
	args["db-user"] &&
	args["db-host"] &&
	args["db-pass"] &&
	args["sp-user"] &&
	args["sp-password"] &&
	args["wialon-token"]
) {
	NonReportingTrackersReport.create(
		{
			dbHost: args["db-host"],
			dbPass: args["db-pass"],
			dbUser: args["db-user"],
			spPassword: args["sp-password"],
			spUser: args["sp-user"],
			wialonToken: args["wialon-token"]
		},
		{
			threshold: args.threshold || 5
		},
		args.timezone
	)
		.then(async (serviceReport) => {
			if (args.subject && args.recipient) {
				// Send only if the service report has any pending services.
				if (serviceReport.data.length > 0) {
					const recipients = Array.isArray(args.recipient)
						? args.recipient
						: [args.recipient];
					const sent = await serviceReport.sendReportByEmail({
						subject: args.subject,
						recipients,
						threshold: args.threshold || 5
					});
					console.log(sent);
				}
				process.exit(0);
			}
			console.log("Argument error.");
			process.exit(2);
		})
		.catch((e) => {
			console.log(e);
			process.exit(2);
		});
} else {
	console.log("Argument error.");
	process.exit(2);
}
