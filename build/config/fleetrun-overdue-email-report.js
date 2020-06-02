"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var minimist_1 = __importDefault(require("minimist"));
var ObjectValidator_1 = require("../utils/ObjectValidator");
var args = minimist_1.default(process.argv);
var getConfig = function () {
    var recipients = (args.recipient &&
        (Array.isArray(args.recipient) ? args.recipient : [args.recipient])) ||
        undefined;
    var config = {
        token: args.token || process.env.FLEETRUN_TOKEN,
        recipients: recipients,
        fleetId: (args["fleet-id"] && parseInt(args["fleet-id"])) || undefined,
        subject: args.subject,
        mail: {
            user: args["mail-user"] || process.env.MAIL_USER,
            password: args["mail-pass"] || process.env.MAIL_USER,
            host: args["mail-host"] || process.env.MAIL_HOST,
            port: args.port || process.env.MAIL_PORT || 465
        }
    };
    var validator = new ObjectValidator_1.ObjectValidator(config, function (values) {
        var _a, _b, _c;
        var errors = {
            mail: {}
        };
        if (!values.token) {
            errors.token = "--token is required";
        }
        if (!values.recipients) {
            errors.recipients = "--recipient is required";
        }
        if (!values.fleetId) {
            errors.fleetId = "--fleet-id is required";
        }
        if (!values.subject) {
            errors.subject = "--subject is required";
        }
        if (!((_a = values.mail) === null || _a === void 0 ? void 0 : _a.user)) {
            errors.mail.user = "--mail-user is required";
        }
        if (!((_b = values.mail) === null || _b === void 0 ? void 0 : _b.password)) {
            errors.mail.password = "--mail-pass is required";
        }
        if (!((_c = values.mail) === null || _c === void 0 ? void 0 : _c.host)) {
            errors.mail.host = "--mail-host is required";
        }
        return {};
    });
    return validator.cast();
};
exports.default = getConfig();
//# sourceMappingURL=fleetrun-overdue-email-report.js.map