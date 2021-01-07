"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
var date_fns_1 = require("date-fns");
var DateUtils = /** @class */ (function () {
    function DateUtils() {
    }
    DateUtils.getDateString = function () {
        return date_fns_1.format(new Date(), "yyyy-MM-dd");
    };
    return DateUtils;
}());
exports.DateUtils = DateUtils;
//# sourceMappingURL=DateUtils.js.map