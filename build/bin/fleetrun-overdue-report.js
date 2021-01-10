#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OverdueServiceReport_1 = require("../utils/OverdueServiceReport");
const fleetrun_overdue_report_1 = require("../config/fleetrun-overdue-report");
if (fleetrun_overdue_report_1.args.h || fleetrun_overdue_report_1.args.help) {
    console.log(`Work in progress...`);
    process.exit(0);
}
OverdueServiceReport_1.OverdueServiceReport.create(fleetrun_overdue_report_1.options.token, fleetrun_overdue_report_1.options.fleetId, fleetrun_overdue_report_1.options.timezone, fleetrun_overdue_report_1.options.columns).then(async (serviceReport) => {
    // Send only if the service report has any pending services.
    if (serviceReport.data.length > 0) {
        const html = serviceReport.getServiceOverdueHtmlTable();
        const sent = await serviceReport.sendReportByEmail({
            mailConfig: fleetrun_overdue_report_1.mail,
            subject: fleetrun_overdue_report_1.options.subject,
            recipients: fleetrun_overdue_report_1.options.recipients,
            html
        });
        console.log(sent);
    }
    process.exit(0);
});
//# sourceMappingURL=fleetrun-overdue-report.js.map