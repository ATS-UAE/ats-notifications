"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailReport = void 0;
var Mailer_1 = require("./Mailer");
var EmailReport = /** @class */ (function () {
    function EmailReport(config) {
        var _this = this;
        this.config = config;
        this.body = "";
        this.appendBody = function (data) {
            if (typeof data === "string") {
                _this.body += data;
            }
            else {
                _this.body += data.render();
            }
        };
        this.send = function (options) {
            var mailer = new Mailer_1.Mailer(_this.config);
            return mailer.sendMail(__assign(__assign({}, options), { body: _this.body }));
        };
    }
    return EmailReport;
}());
exports.EmailReport = EmailReport;
//# sourceMappingURL=EmailReport.js.map