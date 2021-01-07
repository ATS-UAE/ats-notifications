"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
var nodemailer_1 = __importDefault(require("nodemailer"));
var Mailer = /** @class */ (function () {
    function Mailer(config) {
        var _this = this;
        this.config = config;
        this.sendMail = function (options) {
            return new Promise(function (resolve, reject) {
                _this.mailer.sendMail({
                    from: options.nickname + " <" + _this.config.user + ">",
                    to: options.to,
                    subject: options.subject,
                    html: options.body,
                    cc: options.cc
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
                user: config.user,
                pass: config.pass
            },
            port: config.port,
            secure: true,
            host: config.host
        });
    }
    return Mailer;
}());
exports.Mailer = Mailer;
//# sourceMappingURL=Mailer.js.map