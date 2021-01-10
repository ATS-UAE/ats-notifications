"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonReportingTrackersReport = void 0;
const date_fns_1 = require("date-fns");
const node_wialon_1 = require("node-wialon");
const securepath_api_1 = require("securepath-api");
const HtmlTable_1 = require("./HtmlTable");
const JobCard_1 = require("./job-card/JobCard");
const TextTable_1 = require("./TextTable");
const MarkdownToHtml_1 = require("./MarkdownToHtml");
const Mailer_1 = require("./Mailer");
const DateUtils_1 = require("./DateUtils");
const NOT_AVAILABLE_STRING = "N/A";
class NonReportingTrackersReport {
    constructor(data, options) {
        this.options = options;
        this.getHtmlTable = () => {
            const table = new HtmlTable_1.HtmlTable(this.getColumnsFromArray([
                "System",
                "Client",
                "Subclient",
                "Subclient2",
                "IMEI",
                "Vehicle",
                "Plate Number",
                "Chassis",
                "Days Since Last Report",
                "Last Report Date"
            ]));
            this.data.forEach((trackerData) => {
                if (this.shouldIncludeClient(trackerData)) {
                    table.addRow(this.getColumns(trackerData));
                }
            });
            return table;
        };
        this.getTextTable = () => {
            const table = new TextTable_1.TextTable();
            table.addRow(this.getColumnsFromArray([
                "System",
                "Client",
                "Subclient",
                "Subclient2",
                "IMEI",
                "Vehicle",
                "Plate Number",
                "Chassis",
                "Days Since Last Report",
                "Last Report Date"
            ]));
            this.data.forEach((trackerData) => {
                if (this.shouldIncludeClient(trackerData)) {
                    table.addRow(this.getColumns(trackerData));
                }
            });
            return table;
        };
        this.shouldIncludeClient = (trackerData) => {
            if (this.options.clients) {
                return this.options.clients.some((client) => this.searchClientKeyword(client, trackerData));
            }
            return true;
        };
        this.searchClientKeyword = (client, trackerData) => {
            const keywords = [trackerData.client.toLowerCase()];
            if (trackerData.subclient) {
                keywords.push(trackerData.subclient.toLowerCase());
            }
            if (trackerData.subclient2) {
                keywords.push(trackerData.subclient2.toLowerCase());
            }
            return keywords.some((keyword) => {
                const compareString = client.toLowerCase();
                return keyword.includes(compareString);
            });
        };
        this.getColumnsFromArray = (row) => {
            const filteredRow = [];
            if (this.options.columns) {
                const validColumns = this.options.columns;
                row.filter((row, index) => {
                    if (validColumns.includes(index + 1)) {
                        filteredRow.push(row);
                    }
                });
                return filteredRow;
            }
            return row;
        };
        this.getColumns = (trackerData) => {
            return this.getColumnsFromArray([
                trackerData.system,
                trackerData.client,
                trackerData.subclient || NOT_AVAILABLE_STRING,
                trackerData.subclient2 || NOT_AVAILABLE_STRING,
                trackerData.imei,
                trackerData.vehicle,
                trackerData.plateNumber,
                trackerData.chassis,
                trackerData.daysSinceLastReport || NOT_AVAILABLE_STRING,
                trackerData.lastReport
            ]);
        };
        this.printTextTable = () => {
            const table = this.getTextTable();
            return table.render();
        };
        this.sendReportByEmail = ({ mailConfig, recipients, threshold, cc }) => {
            const htmlReport = new MarkdownToHtml_1.MarkdownToHtml(`
Dear Team,
		
Please find the table below for the updated list of non-reporting vehicles for more than ${threshold} days.

To protect your assets and ensure that our GPS devices are working properly, our team will be having an inspection on each of your vehicles as listed in the following table.

Kindly arrange the vehicles for device physical checking and please provide the person/s involved, locations, and contact numbers.
		
Your immediate response will be appreciated so we can arrange our team ahead of time and also to prioritize your desired date of inspection	,

${this.getTextTable().getMarkdown()}

Regards,`).getHtml();
            const mailer = new Mailer_1.Mailer(mailConfig);
            return mailer.sendMail({
                body: htmlReport,
                nickname: "ATS Support",
                subject: `Non Reporting Vehicles ${DateUtils_1.DateUtils.getDateString()}`,
                to: recipients,
                cc
            });
        };
        this.data = NonReportingTrackersReport.sortByLastReportingDate(data);
    }
}
exports.NonReportingTrackersReport = NonReportingTrackersReport;
NonReportingTrackersReport.sortByLastReportingDate = (data) => {
    return data.sort((a, b) => {
        // Wialon first
        if (a.system < b.system) {
            return 1;
        }
        else if (a.system > b.system) {
            return -1;
        }
        else {
            // Sort descending numeric
            const lastReportA = a.daysSinceLastReport || 0;
            const lastReportB = b.daysSinceLastReport || 0;
            if (lastReportA < lastReportB) {
                return 1;
            }
            else if (lastReportA > lastReportB) {
                return -1;
            }
            return 0;
        }
    });
};
NonReportingTrackersReport.getNonReportingSecurepath = (jobCards, trackers, threshold) => {
    return trackers.reduce((acc, tracker) => {
        const lastReport = tracker.timestamp && date_fns_1.parse(tracker.timestamp.toString(), "t", new Date());
        const daysSinceLastReport = lastReport
            ? date_fns_1.differenceInDays(new Date(), lastReport)
            : null;
        if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
            const jobCard = jobCards.find((jc) => String(jc.imei) === String(tracker.imei));
            acc.push({
                chassis: jobCard?.chassis || NOT_AVAILABLE_STRING,
                client: jobCard?.client.name || NOT_AVAILABLE_STRING,
                subclient: jobCard?.client?.subclient?.name,
                subclient2: jobCard?.client?.subclient?.subclient?.name,
                daysSinceLastReport,
                imei: tracker.imei,
                lastReport: (lastReport && date_fns_1.formatISO(lastReport)) || NOT_AVAILABLE_STRING,
                plateNumber: jobCard?.plateNo || NOT_AVAILABLE_STRING,
                vehicle: jobCard?.vehicle || NOT_AVAILABLE_STRING,
                system: "SecurePath"
            });
        }
        return acc;
    }, []);
};
NonReportingTrackersReport.getNonReportingWialon = (jobCards, trackers, threshold) => {
    return trackers.items.reduce((acc, tracker) => {
        const lastReport = (tracker.lmsg?.t && date_fns_1.parse(tracker.lmsg.t.toString(), "t", new Date())) ||
            undefined;
        const daysSinceLastReport = lastReport
            ? date_fns_1.differenceInDays(new Date(), lastReport)
            : null;
        if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
            const jobCard = (tracker.uid &&
                jobCards.find((jc) => String(jc.imei) === String(tracker.uid))) ||
                undefined;
            if (!tracker.uid) {
                console.error(`${tracker.nm} has no IMEI`);
            }
            acc.push({
                chassis: jobCard?.chassis || NOT_AVAILABLE_STRING,
                client: jobCard?.client.name || NOT_AVAILABLE_STRING,
                daysSinceLastReport,
                subclient: jobCard?.client.subclient?.name || NOT_AVAILABLE_STRING,
                subclient2: jobCard?.client?.subclient?.subclient?.name || NOT_AVAILABLE_STRING,
                imei: tracker.uid || tracker.nm || NOT_AVAILABLE_STRING,
                lastReport: (lastReport && date_fns_1.formatISO(lastReport)) || NOT_AVAILABLE_STRING,
                plateNumber: jobCard?.plateNo || NOT_AVAILABLE_STRING,
                vehicle: jobCard?.vehicle || NOT_AVAILABLE_STRING,
                system: "Wialon"
            });
        }
        return acc;
    }, []);
};
NonReportingTrackersReport.fetchReportData = async (credentials, options) => {
    const sp = await securepath_api_1.SecurePath.login(credentials.securepath.user, credentials.securepath.pass, { baseUrl: "http://rac.securepath.ae:1024" });
    const securepathUnits = await sp.Live.getTrackers();
    const jobCards = await JobCard_1.JobCard.findAll({
        database: credentials.database.name,
        host: credentials.database.host,
        password: credentials.database.pass,
        user: credentials.database.user
    }, {
        active: true
    });
    const w = await node_wialon_1.Wialon.login({
        token: credentials.wialon.token
    });
    const wialonUnits = await w.Utils.getUnits({ flags: 1024 + 256 + 1 });
    const nonReportingTrackers = [
        ...NonReportingTrackersReport.getNonReportingSecurepath(jobCards, securepathUnits, options.threshold),
        ...NonReportingTrackersReport.getNonReportingWialon(jobCards, wialonUnits, options.threshold)
    ];
    return nonReportingTrackers;
};
NonReportingTrackersReport.create = async (credentials, options, tableOptions) => {
    const reportData = await NonReportingTrackersReport.fetchReportData(credentials, options);
    return new NonReportingTrackersReport(reportData, tableOptions);
};
//# sourceMappingURL=NonReportingTrackersReport.js.map