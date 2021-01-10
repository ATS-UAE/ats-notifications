"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueServiceReport = void 0;
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
const fleet_run_1 = require("./fleet-run");
const EmailReport_1 = require("./EmailReport");
const HtmlTable_1 = require("./HtmlTable");
const fleetrun_overdue_report_1 = require("../config/fleetrun-overdue-report");
class OverdueServiceReport {
    constructor(data, options) {
        this.getFleetRunOverdueHtmlTable = () => {
            const tableColums = [
                "Unit name",
                "Service name",
                "Mileage counter (Km)",
                "Engine hours counter (Hour)"
            ];
            const includeMilageColumn = this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_MILEAGE);
            const includeDaysColumn = this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_DAY);
            const includeEngineHoursColumn = this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_ENGINE_HOURS);
            if (includeMilageColumn) {
                tableColums.push("Mileage overdue (Km)");
            }
            if (includeDaysColumn) {
                tableColums.push("Days overdue (Days)");
            }
            if (includeEngineHoursColumn) {
                tableColums.push("Engine hours overdue (Hours)");
            }
            let table = new HtmlTable_1.HtmlTable(tableColums);
            for (const row of this.data) {
                const columnValues = [
                    row.unit,
                    row.serviceName,
                    row.mileage || "N/A",
                    row.engineHours || "N/A"
                ];
                if (includeMilageColumn) {
                    columnValues.push(row.mileageOverdue || "N/A");
                }
                if (includeDaysColumn) {
                    columnValues.push(row.daysOverdue || "N/A");
                }
                if (includeEngineHoursColumn) {
                    columnValues.push(row.engineHoursOverdue || "N/A");
                }
                table.addRow(columnValues);
            }
            return table;
        };
        this.getServiceOverdueHtmlTable = () => {
            const table = new HtmlTable_1.HtmlTable([
                "Unit",
                "Service",
                "Unit",
                "Frequency",
                "Current Reading",
                "Last Service",
                "Overdue"
            ]);
            const includeMilageColumn = this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_MILEAGE);
            const includeDaysColumn = this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_DAY);
            const includeEngineHoursColumn = this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_ENGINE_HOURS);
            this.data.forEach((service) => {
                if (includeMilageColumn && service.mileageOverdue !== null) {
                    const lastService = service.mileage
                        ? service.mileage -
                            (service.mileageOverdue + (service.mileageFrequency ?? 0))
                        : "";
                    table.addRow([
                        service.unit,
                        service.serviceName,
                        "Km",
                        service.mileageFrequency || "",
                        service.mileage || "",
                        lastService,
                        service.mileageOverdue
                    ]);
                }
                if (includeDaysColumn && service.daysOverdue !== null) {
                    const lastService = date_fns_1.formatISO(date_fns_1.sub(new Date(), {
                        days: service.daysOverdue + (service.daysFrequency ?? 0)
                    }));
                    table.addRow([
                        service.unit,
                        service.serviceName,
                        "Day",
                        service.daysFrequency || "",
                        "",
                        lastService,
                        service.daysOverdue
                    ]);
                }
                if (includeEngineHoursColumn && service.engineHoursOverdue !== null) {
                    const lastService = service.engineHours
                        ? service.engineHours -
                            (service.engineHoursOverdue + (service.engineHoursFrequency ?? 0))
                        : "";
                    table.addRow([
                        service.unit,
                        service.serviceName,
                        "Hr",
                        service.engineHoursFrequency || "",
                        service.engineHours || "",
                        lastService,
                        service.engineHoursOverdue
                    ]);
                }
            });
            return table;
        };
        this.sendReportByEmail = ({ mailConfig, recipients, subject, html }) => {
            const emailReport = new EmailReport_1.EmailReport(mailConfig);
            const currentDate = new Date();
            emailReport.appendBody("<h1>Daily service overdue list.</h1>");
            emailReport.appendBody(html);
            if (this.options.timezone) {
                emailReport.appendBody(`<p>Sent ${date_fns_1.formatISO(date_fns_tz_1.utcToZonedTime(currentDate, this.options.timezone))}</p>`);
            }
            else {
                emailReport.appendBody(`<p>Sent ${date_fns_1.formatISO(currentDate)}</p>`);
            }
            return emailReport.send({
                to: recipients,
                subject,
                nickname: "FleetRun Notifications"
            });
        };
        this.data = data;
        this.options = {
            timezone: options.timezone,
            columns: options.columns || Object.values(fleetrun_overdue_report_1.ReportColumn)
        };
    }
}
exports.OverdueServiceReport = OverdueServiceReport;
OverdueServiceReport.getOverdues = ({ service, unit, interval }, timezone) => {
    const overdues = {
        daysOverdue: null,
        mileageOverdue: null,
        engineHoursOverdue: null
    };
    const isDaysOverdue = service.isDaysOverdue;
    const isEngineHoursOverdue = service.isEngineHoursOverdue;
    const isMileageOverdue = service.isMileageOverdue;
    if (!isMileageOverdue && !isEngineHoursOverdue && !isDaysOverdue) {
        return null;
    }
    if (isDaysOverdue) {
        const serviceDate = service.getDate(timezone);
        overdues.daysOverdue =
            (serviceDate && date_fns_1.differenceInDays(new Date(), serviceDate)) || null;
    }
    if (isEngineHoursOverdue) {
        if (service.engineHours) {
            overdues.engineHoursOverdue = unit.engineHours - service.engineHours;
        }
        else {
            overdues.engineHoursOverdue = unit.engineHours;
        }
    }
    if (isMileageOverdue) {
        if (service.mileage) {
            overdues.mileageOverdue = unit.mileage - service.mileage;
        }
        else {
            overdues.mileageOverdue = unit.mileage;
        }
    }
    return overdues;
};
OverdueServiceReport.getOverdueMessage = (value) => {
    if (value === undefined || value === null) {
        return null;
    }
    return value;
};
OverdueServiceReport.getServiceStatusMessage = (reportData, timezone) => {
    const overdues = OverdueServiceReport.getOverdues({
        unit: reportData.unit,
        service: reportData.service,
        interval: reportData.interval
    }, timezone);
    if (overdues) {
        const { unit, service, interval } = reportData;
        const { unitName, mileage, engineHours } = unit;
        const { serviceName } = service;
        const { mileageFrequency, engineHoursFrequency, daysFrequency } = interval;
        const message = {
            unit: unitName,
            mileage: mileage,
            engineHours: engineHours,
            serviceName: serviceName,
            mileageOverdue: OverdueServiceReport.getOverdueMessage(overdues.mileageOverdue),
            mileageFrequency,
            daysFrequency,
            engineHoursFrequency,
            daysOverdue: OverdueServiceReport.getOverdueMessage(overdues.daysOverdue),
            engineHoursOverdue: OverdueServiceReport.getOverdueMessage(overdues.engineHoursOverdue)
        };
        return message;
    }
    return null;
};
OverdueServiceReport.fetchReportData = async (token, fleetId) => {
    const api = new fleet_run_1.Api(token);
    const units = await fleet_run_1.Unit.getAll(api, fleetId);
    const intervals = await fleet_run_1.Interval.getAll(api, fleetId);
    const services = await fleet_run_1.Service.getAll(api, fleetId);
    return {
        api,
        units,
        intervals,
        services
    };
};
OverdueServiceReport.composeOverdueServiceData = (data, timezone) => {
    const overdueServiceReportData = data.services
        .filter((service) => !service.isInProgress)
        .reduce((acc, service) => {
        const unit = data.units.find((unit) => unit.data.id === service.data.uid);
        const interval = data.intervals.find((interval) => interval.data.id === service.data.ivid);
        if (unit && interval) {
            const serviceStatus = OverdueServiceReport.getServiceStatusMessage({
                unit,
                interval,
                service
            }, timezone);
            serviceStatus && acc.push(serviceStatus);
        }
        return acc;
    }, []);
    return overdueServiceReportData;
};
OverdueServiceReport.create = async (token, fleetId, timezone, columns) => {
    const reportData = await OverdueServiceReport.fetchReportData(token, fleetId);
    const overdueServices = OverdueServiceReport.composeOverdueServiceData(reportData, timezone);
    return new OverdueServiceReport(overdueServices, { timezone, columns });
};
//# sourceMappingURL=OverdueServiceReport.js.map