"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtils = void 0;
const date_fns_1 = require("date-fns");
class DateUtils {
}
exports.DateUtils = DateUtils;
DateUtils.getDateString = () => {
    return date_fns_1.format(new Date(), "yyyy-MM-dd");
};
//# sourceMappingURL=DateUtils.js.map