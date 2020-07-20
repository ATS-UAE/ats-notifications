#!/usr/bin/env node
import { OverdueServiceReport } from "../utils/OverdueServiceReport";
import { options, args, mail } from "../config/fleetrun-overdue-email-report";

if (args.h || args.help) {
	console.log(`Work in progress...`);
	process.exit(0);
}

OverdueServiceReport.create(
	options.token,
	options.fleetId,
	options.timezone
).then(async (serviceReport) => {
	// Send only if the service report has any pending services.
	if (serviceReport.data.length > 0) {
		const sent = await serviceReport.sendReportByEmail({
			mailConfig: mail,
			subject: options.subject,
			recipients: options.recipients
		});
		console.log(sent);
	}
	process.exit(0);
});
