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
exports.options = exports.wialon = exports.securepath = exports.database = exports.mail = exports.args = void 0;
const minimist_1 = __importDefault(require("minimist"));
const yup = __importStar(require("yup"));
const validator = yup
    .object()
    .shape({
    h: yup.boolean().default(false),
    help: yup.boolean().default(false),
    recipients: yup
        .array(yup.string().required())
        .notRequired()
        .transform((v, ogV) => {
        return ogV.split(",");
    }),
    timezone: yup.string(),
    "db-name": yup.string().required(),
    "db-user": yup.string().required(),
    "db-pass": yup.string().required(),
    "db-host": yup.string().required(),
    "sp-user": yup.string().required(),
    "sp-password": yup.string().required(),
    "wialon-token": yup.string().required(),
    threshold: yup.number().required().default(7),
    "mail-host": yup.string(),
    "mail-user": yup.string(),
    "mail-pass": yup.string(),
    "mail-port": yup.number(),
    columns: yup
        .array(yup.number().required())
        .notRequired()
        .transform((v, ogV) => {
        return ogV.split(",").map((string) => parseInt(string));
    }),
    cc: yup
        .array(yup.string().required())
        .notRequired()
        .transform((v, ogV) => {
        return ogV.split(",");
    }),
    clients: yup
        .array(yup.string().required())
        .notRequired()
        .transform((v, ogV) => {
        return ogV.split(",");
    })
})
    .required();
const parsedArgs = minimist_1.default(process.argv);
validator.validateSync(parsedArgs);
exports.args = validator.cast(parsedArgs);
exports.mail = null;
if (exports.args["mail-host"] &&
    exports.args["mail-pass"] &&
    exports.args["mail-port"] &&
    exports.args["mail-user"]) {
    exports.mail = {
        host: exports.args["mail-host"],
        pass: exports.args["mail-pass"],
        port: exports.args["mail-port"],
        user: exports.args["mail-user"]
    };
}
exports.database = {
    name: exports.args["db-name"],
    host: exports.args["db-host"],
    pass: exports.args["db-pass"],
    user: exports.args["db-user"]
};
exports.securepath = {
    user: exports.args["sp-user"],
    pass: exports.args["sp-password"]
};
exports.wialon = {
    token: exports.args["wialon-token"]
};
exports.options = {
    threshold: exports.args.threshold,
    timezone: exports.args.timezone,
    recipients: exports.args.recipients,
    columns: exports.args.columns,
    cc: exports.args.cc,
    clients: exports.args.clients
};
//# sourceMappingURL=non-reporting-trackers-report.js.map