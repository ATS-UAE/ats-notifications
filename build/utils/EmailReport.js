"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailReport = void 0;
const Mailer_1 = require("./Mailer");
class EmailReport {
    constructor(config) {
        this.config = config;
        this.body = "";
        this.appendBody = (data) => {
            if (typeof data === "string") {
                this.body += data;
            }
            else {
                this.body += data.render();
            }
        };
        this.send = (options) => {
            const mailer = new Mailer_1.Mailer(this.config);
            return mailer.sendMail({
                ...options,
                body: this.body
            });
        };
    }
}
exports.EmailReport = EmailReport;
//# sourceMappingURL=EmailReport.js.map