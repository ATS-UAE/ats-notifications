"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var minimist_1 = __importDefault(require("minimist"));
var args = minimist_1.default(process.argv);
var getConfig = function () {
    var recipients = (args.recipient &&
        (Array.isArray(args.recipient) ? args.recipient : [args.recipient])) ||
        undefined;
    var token = args.token || process.env.FLEETRUN_TOKEN;
    var fleetId = (args["fleet-id"] && parseInt(args["fleet-id"])) || undefined;
    var subject = args.subject;
    var mailUser = args["mail-user"] || process.env.MAIL_USER;
    var mailPass = args["mail-pass"] || process.env.MAIL_USER;
    var mailHost = args["mail-host"] || process.env.MAIL_HOST;
    var mailPort = args.port || process.env.MAIL_PORT || 465;
    // TODO: provide a better validation where it outputs which exactly is missing from the parameters.
    // Check if all parameters exist.
    if (token &&
        recipients &&
        fleetId &&
        subject &&
        mailUser &&
        mailPass &&
        mailHost &&
        mailPort) {
        var config = {
            token: token,
            recipients: recipients,
            fleetId: fleetId,
            subject: subject,
            mail: {
                user: mailUser,
                password: mailPass,
                host: mailHost,
                port: mailPort
            }
        };
        return config;
    }
    throw new Error("Missing arguments.");
};
exports.default = getConfig();
//# sourceMappingURL=fleetrun-overdue-email-report.js.map