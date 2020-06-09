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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverdueServiceReport = void 0;
var moment_1 = __importDefault(require("moment"));
var fleet_run_1 = require("./fleet-run");
var EmailReport_1 = require("./EmailReport");
var HtmlTable_1 = require("./HtmlTable");
var OverdueServiceReport = /** @class */ (function () {
    function OverdueServiceReport(data, timezone) {
        var _this = this;
        this.data = data;
        this.timezone = timezone;
        this.getHtmlTable = function () {
            var table = new HtmlTable_1.HtmlTable([
                "Unit name",
                "Service name",
                "Mileage overdue",
                "Days overdue",
                "Engine hours overdue"
            ]);
            for (var _i = 0, _a = _this.data; _i < _a.length; _i++) {
                var row = _a[_i];
                var mileageOverdue = typeof row.mileageOverdue === "number"
                    ? row.mileageOverdue + " km"
                    : row.mileageOverdue;
                var engineHoursOverdue = typeof row.engineHoursOverdue === "number"
                    ? row.engineHoursOverdue + " hours"
                    : row.engineHoursOverdue;
                table.addRow([
                    row.unit,
                    row.serviceName,
                    mileageOverdue,
                    row.daysOverdue,
                    engineHoursOverdue
                ]);
            }
            return table;
        };
        this.sendReportByEmail = function (_a) {
            var recipients = _a.recipients, subject = _a.subject;
            var emailReport = new EmailReport_1.EmailReport();
            var currentDate = moment_1.default();
            emailReport.appendBody("<h1>Daily service overdue list.</h1>");
            emailReport.appendBody(_this.getHtmlTable());
            if (_this.timezone) {
                emailReport.appendBody("<p>Sent " + currentDate.utcOffset(_this.timezone).format() + "</p>");
            }
            else {
                emailReport.appendBody("<p>Sent " + currentDate.format() + "</p>");
            }
            return emailReport.send({
                to: recipients,
                subject: subject
            });
        };
    }
    OverdueServiceReport.getOverdues = function (_a, timezone) {
        var service = _a.service, unit = _a.unit;
        var overdues = {
            daysOverdue: null,
            mileageOverdue: null,
            engineHoursOverdue: null
        };
        if (service.isDaysOverdue) {
            var serviceDate = service.getDate(timezone);
            overdues.daysOverdue =
                (serviceDate.isValid() && serviceDate.fromNow()) || null;
        }
        if (service.isEngineHoursOverdue) {
            var engineHoursOverdue = unit.engineHours - service.engineHours;
            overdues.engineHoursOverdue = engineHoursOverdue;
        }
        if (service.isMileageOverdue) {
            var mileageOverdue = unit.mileage - service.mileage;
            overdues.mileageOverdue = mileageOverdue;
        }
        return overdues;
    };
    OverdueServiceReport.getOverdueMessage = function (value) {
        if (value === undefined || value === null) {
            return "N/A";
        }
        return value;
    };
    OverdueServiceReport.getServiceStatusMessage = function (reportData, timezone) {
        var _a;
        var unit = reportData.units.find(function (unit) { return unit.data.id === reportData.service.data.uid; });
        var overdues = unit &&
            OverdueServiceReport.getOverdues({
                unit: unit,
                service: reportData.service
            }, timezone);
        var message = {
            unit: ((_a = unit === null || unit === void 0 ? void 0 : unit.data) === null || _a === void 0 ? void 0 : _a.n) || "N/A",
            serviceName: reportData.service.data.n,
            mileageOverdue: OverdueServiceReport.getOverdueMessage(overdues === null || overdues === void 0 ? void 0 : overdues.mileageOverdue),
            daysOverdue: OverdueServiceReport.getOverdueMessage(overdues === null || overdues === void 0 ? void 0 : overdues.daysOverdue),
            engineHoursOverdue: OverdueServiceReport.getOverdueMessage(overdues === null || overdues === void 0 ? void 0 : overdues.engineHoursOverdue)
        };
        return message;
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
            .map(function (service) {
            return OverdueServiceReport.getServiceStatusMessage({
                units: data.units,
                intervals: data.intervals,
                service: service
            }, timezone);
        });
        return overdueServiceReportData;
    };
    OverdueServiceReport.create = function (token, fleetId, timezone) { return __awaiter(void 0, void 0, void 0, function () {
        var reportData, overdueServices;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, OverdueServiceReport.fetchReportData(token, fleetId)];
                case 1:
                    reportData = _a.sent();
                    overdueServices = OverdueServiceReport.composeOverdueServiceData(reportData, timezone);
                    return [2 /*return*/, new OverdueServiceReport(overdueServices, timezone)];
            }
        });
    }); };
    return OverdueServiceReport;
}());
exports.OverdueServiceReport = OverdueServiceReport;
//# sourceMappingURL=OverdueServiceReport.js.map