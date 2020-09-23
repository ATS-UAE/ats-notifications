"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueServiceReport = void 0;
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var fleet_run_1 = require("./fleet-run");
var EmailReport_1 = require("./EmailReport");
var HtmlTable_1 = require("./HtmlTable");
var fleetrun_overdue_report_1 = require("../config/fleetrun-overdue-report");
var OverdueServiceReport = /** @class */ (function () {
    function OverdueServiceReport(data, options) {
        var _this = this;
        this.getFleetRunOverdueHtmlTable = function () {
            var tableColums = [
                "Unit name",
                "Service name",
                "Mileage counter (Km)",
                "Engine hours counter (Hour)"
            ];
            var includeMilageColumn = _this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_MILEAGE);
            var includeDaysColumn = _this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_DAY);
            var includeEngineHoursColumn = _this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_ENGINE_HOURS);
            if (includeMilageColumn) {
                tableColums.push("Mileage overdue (Km)");
            }
            if (includeDaysColumn) {
                tableColums.push("Days overdue (Days)");
            }
            if (includeEngineHoursColumn) {
                tableColums.push("Engine hours overdue (Hours)");
            }
            var table = new HtmlTable_1.HtmlTable(tableColums);
            for (var _i = 0, _a = _this.data; _i < _a.length; _i++) {
                var row = _a[_i];
                var columnValues = [
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
        this.getServiceOverdueHtmlTable = function () {
            var table = new HtmlTable_1.HtmlTable([
                "Unit",
                "Service",
                "Unit",
                "Frequency",
                "Current Reading",
                "Last Service",
                "Overdue"
            ]);
            var includeMilageColumn = _this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_MILEAGE);
            var includeDaysColumn = _this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_DAY);
            var includeEngineHoursColumn = _this.options.columns.includes(fleetrun_overdue_report_1.ReportColumn.OVERDUE_ENGINE_HOURS);
            _this.data.forEach(function (service) {
                var _a, _b, _c;
                if (includeMilageColumn && service.mileageOverdue !== null) {
                    var lastService = service.mileage
                        ? service.mileage -
                            (service.mileageOverdue + ((_a = service.mileageFrequency) !== null && _a !== void 0 ? _a : 0))
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
                    var lastService = date_fns_1.formatISO(date_fns_1.sub(new Date(), {
                        days: service.daysOverdue + ((_b = service.daysFrequency) !== null && _b !== void 0 ? _b : 0)
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
                    var lastService = service.engineHours
                        ? service.engineHours -
                            (service.engineHoursOverdue + ((_c = service.engineHoursFrequency) !== null && _c !== void 0 ? _c : 0))
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
        this.sendReportByEmail = function (_a) {
            var mailConfig = _a.mailConfig, recipients = _a.recipients, subject = _a.subject, html = _a.html;
            var emailReport = new EmailReport_1.EmailReport(mailConfig);
            var currentDate = new Date();
            emailReport.appendBody("<h1>Daily service overdue list.</h1>");
            emailReport.appendBody(html);
            if (_this.options.timezone) {
                emailReport.appendBody("<p>Sent " + date_fns_1.formatISO(date_fns_tz_1.utcToZonedTime(currentDate, _this.options.timezone)) + "</p>");
            }
            else {
                emailReport.appendBody("<p>Sent " + date_fns_1.formatISO(currentDate) + "</p>");
            }
            return emailReport.send({
                to: recipients,
                subject: subject,
                nickname: "FleetRun Notifications"
            });
        };
        this.data = data;
        this.options = {
            timezone: options.timezone,
            columns: options.columns || Object.values(fleetrun_overdue_report_1.ReportColumn)
        };
    }
    OverdueServiceReport.getOverdues = function (_a, timezone) {
        var service = _a.service, unit = _a.unit, interval = _a.interval;
        var overdues = {
            daysOverdue: null,
            mileageOverdue: null,
            engineHoursOverdue: null
        };
        var isDaysOverdue = service.isDaysOverdue;
        var isEngineHoursOverdue = service.isEngineHoursOverdue;
        var isMileageOverdue = service.isMileageOverdue;
        if (!isMileageOverdue && !isEngineHoursOverdue && !isDaysOverdue) {
            return null;
        }
        if (isDaysOverdue) {
            var serviceDate = service.getDate(timezone);
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
    OverdueServiceReport.getOverdueMessage = function (value) {
        if (value === undefined || value === null) {
            return null;
        }
        return value;
    };
    OverdueServiceReport.getServiceStatusMessage = function (reportData, timezone) {
        var overdues = OverdueServiceReport.getOverdues({
            unit: reportData.unit,
            service: reportData.service,
            interval: reportData.interval
        }, timezone);
        if (overdues) {
            var unit = reportData.unit, service = reportData.service, interval = reportData.interval;
            var unitName = unit.unitName, mileage = unit.mileage, engineHours = unit.engineHours;
            var serviceName = service.serviceName;
            var mileageFrequency = interval.mileageFrequency, engineHoursFrequency = interval.engineHoursFrequency, daysFrequency = interval.daysFrequency;
            var message = {
                unit: unitName,
                mileage: mileage,
                engineHours: engineHours,
                serviceName: serviceName,
                mileageOverdue: OverdueServiceReport.getOverdueMessage(overdues.mileageOverdue),
                mileageFrequency: mileageFrequency,
                daysFrequency: daysFrequency,
                engineHoursFrequency: engineHoursFrequency,
                daysOverdue: OverdueServiceReport.getOverdueMessage(overdues.daysOverdue),
                engineHoursOverdue: OverdueServiceReport.getOverdueMessage(overdues.engineHoursOverdue)
            };
            return message;
        }
        return null;
    };
    OverdueServiceReport.fetchReportData = function (token, fleetId) { return __awaiter(void 0, void 0, void 0, function () {
        var api, units, intervals, services;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new fleet_run_1.Api(token);
                    return [4 /*yield*/, fleet_run_1.Unit.getAll(api, fleetId)];
                case 1:
                    units = _a.sent();
                    return [4 /*yield*/, fleet_run_1.Interval.getAll(api, fleetId)];
                case 2:
                    intervals = _a.sent();
                    return [4 /*yield*/, fleet_run_1.Service.getAll(api, fleetId)];
                case 3:
                    services = _a.sent();
                    return [2 /*return*/, {
                            api: api,
                            units: units,
                            intervals: intervals,
                            services: services
                        }];
            }
        });
    }); };
    OverdueServiceReport.composeOverdueServiceData = function (data, timezone) {
        var overdueServiceReportData = data.services
            .filter(function (service) { return !service.isInProgress; })
            .reduce(function (acc, service) {
            var unit = data.units.find(function (unit) { return unit.data.id === service.data.uid; });
            var interval = data.intervals.find(function (interval) { return interval.data.id === service.data.ivid; });
            if (unit && interval) {
                var serviceStatus = OverdueServiceReport.getServiceStatusMessage({
                    unit: unit,
                    interval: interval,
                    service: service
                }, timezone);
                serviceStatus && acc.push(serviceStatus);
            }
            return acc;
        }, []);
        return overdueServiceReportData;
    };
    OverdueServiceReport.create = function (token, fleetId, timezone, columns) { return __awaiter(void 0, void 0, void 0, function () {
        var reportData, overdueServices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, OverdueServiceReport.fetchReportData(token, fleetId)];
                case 1:
                    reportData = _a.sent();
                    overdueServices = OverdueServiceReport.composeOverdueServiceData(reportData, timezone);
                    return [2 /*return*/, new OverdueServiceReport(overdueServices, { timezone: timezone, columns: columns })];
            }
        });
    }); };
    return OverdueServiceReport;
}());
exports.OverdueServiceReport = OverdueServiceReport;
//# sourceMappingURL=OverdueServiceReport.js.map