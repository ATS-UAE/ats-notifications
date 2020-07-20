"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.options = exports.mail = exports.args = void 0;
var minimist_1 = __importDefault(require("minimist"));
var yup = __importStar(require("yup"));
var validator = yup
    .object()
    .shape({
    h: yup.boolean().required().default(false),
    help: yup.boolean().required().default(false),
    recipient: yup
        .array(yup.string().required())
        .required()
        .transform(function (v, ogV) { return (typeof ogV === "string" ? [ogV] : ogV); }),
    subject: yup.string().required(),
    timezone: yup.string(),
    token: yup.string().required(),
    "fleet-id": yup.number().required(),
    "mail-host": yup.string().required(),
    "mail-user": yup.string().required(),
    "mail-pass": yup.string().required(),
    "mail-port": yup.number().required()
})
    .required();
var parsedArgs = minimist_1.default(process.argv);
validator.validateSync(parsedArgs);
exports.args = validator.cast(parsedArgs);
exports.mail = {
    host: exports.args["mail-host"],
    pass: exports.args["mail-pass"],
    port: exports.args["mail-port"],
    user: exports.args["mail-user"]
};
exports.options = {
    timezone: exports.args.timezone,
    recipients: exports.args.recipient,
    subject: exports.args.subject,
    token: exports.args.token,
    fleetId: exports.args["fleet-id"]
};
//# sourceMappingURL=fleetrun-overdue-email-report.js.map