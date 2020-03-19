#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import { OverdueServiceReport } from "../utils/OverdueServiceReport";
import minimist from "minimist";

interface CommandLineArgs {
	h?: boolean;
	help?: boolean;
	token?: string;
	recipient?: string | string[];
	subject?: string;
	timezone?: string;
	"fleet-id"?: string;
}

const args = minimist<CommandLineArgs>(process.argv);

if (args.h || args.help) {
	console.log(`Work in progress...`);
	process.exit(0);
}

if (args.token && args["fleet-id"]) {
	OverdueServiceReport.create(
		args.token,
		parseInt(args["fleet-id"]),
		args.timezone
	).then(async serviceReport => {
		if (args.subject && args.recipient) {
			const recipients = Array.isArray(args.recipient)
				? args.recipient
				: [args.recipient];
			const sent = await serviceReport.sendReportByEmail({
				subject: args.subject,
				recipients
			});
			console.log(sent);
			process.exit(0);
		}
		console.log("Argument error.");
		process.exit(2);
	});
} else {
	console.log("Argument error.");
	process.exit(2);
}
