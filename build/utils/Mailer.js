"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
var nodemailer_1 = __importDefault(require("nodemailer"));
var config_1 = require("../config");
var Mailer = /** @class */ (function () {
    function Mailer() {
        var _this = this;
        this.sendMail = function (options) {
            return new Promise(function (resolve, reject) {
                _this.mailer.sendMail({
                    from: "FleetRun Notifications <no-reply@atsuae.net>",
                    to: options.to,
                    subject: options.subject,
                    html: options.body
                }, function (err, info) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(info);
                    }
                });
            });
        };
        this.mailer = nodemailer_1.default.createTransport({
            auth: {
                user: config_1.mail.user,
                pass: config_1.mail.pass
            },
            port: config_1.mail.port,
            secure: true,
            host: config_1.mail.host
        });
    }
    Mailer.getInstance = function () {
        if (!Mailer.instance) {
            Mailer.instance = new Mailer();
        }
        return Mailer.instance;
    };
    return Mailer;
}());
exports.Mailer = Mailer;
//# sourceMappingURL=Mailer.js.map