#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NonReportingTrackersReport_1 = require("../utils/NonReportingTrackersReport");
const non_reporting_trackers_report_1 = require("../config/non-reporting-trackers-report");
if (non_reporting_trackers_report_1.args.h || non_reporting_trackers_report_1.args.help) {
    console.log(`Work in progress...`);
    process.exit(0);
}
NonReportingTrackersReport_1.NonReportingTrackersReport.create({
    database: non_reporting_trackers_report_1.database,
    securepath: non_reporting_trackers_report_1.securepath,
    wialon: non_reporting_trackers_report_1.wialon,
    mail: non_reporting_trackers_report_1.mail || undefined
}, {
    threshold: non_reporting_trackers_report_1.options.threshold
}, {
    columns: non_reporting_trackers_report_1.options.columns,
    clients: non_reporting_trackers_report_1.options.clients
})
    .then(async (serviceReport) => {
    // Send only if the service report has any pending services.
    if (serviceReport.data.length > 0) {
        if (non_reporting_trackers_report_1.mail && non_reporting_trackers_report_1.options.recipients) {
            const sent = await serviceReport.sendReportByEmail({
                mailConfig: non_reporting_trackers_report_1.mail,
                recipients: non_reporting_trackers_report_1.options.recipients,
                threshold: non_reporting_trackers_report_1.options.threshold,
                cc: non_reporting_trackers_report_1.options.cc
            });
            console.log(sent);
        }
        else {
            const table = serviceReport.getTextTable();
            console.log(table.render());
        }
    }
    process.exit(0);
})
    .catch((e) => {
    console.log(e);
    process.exit(2);
});
//# sourceMappingURL=non-reporting-trackers-report.js.map