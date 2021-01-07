#!/usr/bin/env node
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
var NonReportingTrackersReport_1 = require("../utils/NonReportingTrackersReport");
var non_reporting_trackers_report_1 = require("../config/non-reporting-trackers-report");
if (non_reporting_trackers_report_1.args.h || non_reporting_trackers_report_1.args.help) {
    console.log("Work in progress...");
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
    .then(function (serviceReport) { return __awaiter(void 0, void 0, void 0, function () {
    var sent, table;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(serviceReport.data.length > 0)) return [3 /*break*/, 3];
                if (!(non_reporting_trackers_report_1.mail && non_reporting_trackers_report_1.options.recipients)) return [3 /*break*/, 2];
                return [4 /*yield*/, serviceReport.sendReportByEmail({
                        mailConfig: non_reporting_trackers_report_1.mail,
                        recipients: non_reporting_trackers_report_1.options.recipients,
                        threshold: non_reporting_trackers_report_1.options.threshold,
                        cc: non_reporting_trackers_report_1.options.cc
                    })];
            case 1:
                sent = _a.sent();
                console.log(sent);
                return [3 /*break*/, 3];
            case 2:
                table = serviceReport.getTextTable();
                console.log(table.render());
                _a.label = 3;
            case 3:
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (e) {
    console.log(e);
    process.exit(2);
});
//# sourceMappingURL=non-reporting-trackers-report.js.map