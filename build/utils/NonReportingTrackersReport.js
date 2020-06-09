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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
var node_wialon_1 = require("node-wialon");
var securepath_api_1 = require("securepath-api");
var EmailReport_1 = require("./EmailReport");
var HtmlTable_1 = require("./HtmlTable");
var JobCard_1 = require("./job-card/JobCard");
var NonReportingTrackersReport = /** @class */ (function () {
    function NonReportingTrackersReport(data, timezone) {
        var _this = this;
        this.data = data;
        this.timezone = timezone;
        this.getHtmlTable = function () {
            var table = new HtmlTable_1.HtmlTable([
                "System",
                "Client",
                "IMEI",
                "Vehicle",
                "Plate Number",
                "Chassis",
                "Days Since Last Report",
                "Last Report Date"
            ]);
            _this.data.forEach(function (row) {
                table.addRow([
                    row.system,
                    row.client || "N/A",
                    row.imei,
                    row.vehicle,
                    row.plateNumber,
                    row.chassis,
                    row.daysSinceLastReport || "N/A",
                    row.lastReport
                ]);
            });
            return table;
        };
        this.sendReportByEmail = function (_a) {
            var recipients = _a.recipients, subject = _a.subject;
            var emailReport = new EmailReport_1.EmailReport();
            var currentDate = moment_1.default();
            emailReport.appendBody("<h1>Non Reporting Tracker List.</h1>");
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
    NonReportingTrackersReport.getNonReportingSecurepath = function (jobCards, trackers, threshold) {
        return trackers.reduce(function (acc, tracker) {
            var lastReport = tracker.timestamp && moment_1.default(tracker.timestamp, "X");
            var daysSinceLastReport = lastReport
                ? moment_1.default().diff(lastReport, "days")
                : null;
            if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
                var jobCard = jobCards.find(function (jc) { return String(jc.imei) === String(tracker.imei); });
                acc.push({
                    chassis: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.chassis) || "N/A",
                    client: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.client) || "N/A",
                    daysSinceLastReport: daysSinceLastReport,
                    imei: tracker.imei,
                    lastReport: (lastReport && lastReport.format()) || "N/A",
                    plateNumber: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.plateNo) || "N/A",
                    vehicle: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.vehicle) || "N/A",
                    system: "SecurePath"
                });
            }
            return acc;
        }, []);
    };
    NonReportingTrackersReport.getNonReportingWialon = function (jobCards, trackers, threshold) {
        return trackers.items.reduce(function (acc, tracker) {
            var _a;
            var lastReport = (((_a = tracker.lmsg) === null || _a === void 0 ? void 0 : _a.t) && moment_1.default(tracker.lmsg.t, "X")) || undefined;
            var daysSinceLastReport = lastReport
                ? moment_1.default().diff(lastReport, "days")
                : null;
            if (daysSinceLastReport === null || daysSinceLastReport >= threshold) {
                var jobCard = (tracker.uid &&
                    jobCards.find(function (jc) { return String(jc.imei) === String(tracker.uid); })) ||
                    undefined;
                acc.push({
                    chassis: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.chassis) || "N/A",
                    client: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.client) || "N/A",
                    daysSinceLastReport: daysSinceLastReport,
                    imei: tracker.uid || "N/A",
                    lastReport: (lastReport && lastReport.format()) || "N/A",
                    plateNumber: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.plateNo) || "N/A",
                    vehicle: (jobCard === null || jobCard === void 0 ? void 0 : jobCard.vehicle) || "N/A",
                    system: "Wialon"
                });
            }
            return acc;
        }, []);
    };
    NonReportingTrackersReport.fetchReportData = function (credentials, options) { return __awaiter(void 0, void 0, void 0, function () {
        var sp, securepathUnits, jobCards, w, wialonUnits, nonReportingTrackers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, securepath_api_1.SecurePath.login(credentials.spUser, credentials.spPassword, { baseUrl: "http://rac.securepath.ae:1024" })];
                case 1:
                    sp = _a.sent();
                    return [4 /*yield*/, sp.Live.getTrackers()];
                case 2:
                    securepathUnits = _a.sent();
                    return [4 /*yield*/, JobCard_1.JobCard.findAll({
                            database: "atsoperations",
                            host: credentials.dbHost,
                            password: credentials.dbPass,
                            user: credentials.dbUser
                        })];
                case 3:
                    jobCards = _a.sent();
                    return [4 /*yield*/, node_wialon_1.Wialon.login({
                            token: credentials.wialonToken
                        })];
                case 4:
                    w = _a.sent();
                    return [4 /*yield*/, w.Utils.getUnits({ flags: 1024 + 256 })];
                case 5:
                    wialonUnits = _a.sent();
                    nonReportingTrackers = __spreadArrays(NonReportingTrackersReport.getNonReportingSecurepath(jobCards, securepathUnits, options.threshold), NonReportingTrackersReport.getNonReportingWialon(jobCards, wialonUnits, options.threshold));
                    return [2 /*return*/, nonReportingTrackers];
            }
        });
    }); };
    NonReportingTrackersReport.create = function (credentials, options, timezone) { return __awaiter(void 0, void 0, void 0, function () {
        var reportData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, NonReportingTrackersReport.fetchReportData(credentials, options)];
                case 1:
                    reportData = _a.sent();
                    return [2 /*return*/, new NonReportingTrackersReport(reportData, timezone)];
            }
        });
    }); };
    return NonReportingTrackersReport;
}());
exports.NonReportingTrackersReport = NonReportingTrackersReport;
//# sourceMappingURL=NonReportingTrackersReport.js.map