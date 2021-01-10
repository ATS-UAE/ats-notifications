"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class Mailer {
    constructor(config) {
        this.config = config;
        this.sendMail = (options) => {
            return new Promise((resolve, reject) => {
                this.mailer.sendMail({
                    from: `${options.nickname} <${this.config.user}>`,
                    to: options.to,
                    subject: options.subject,
                    html: options.body,
                    cc: options.cc
                }, (err, info) => {
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
}
exports.Mailer = Mailer;
//# sourceMappingURL=Mailer.js.map