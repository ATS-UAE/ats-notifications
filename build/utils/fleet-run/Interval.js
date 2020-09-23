"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = void 0;
var Interval = /** @class */ (function () {
    function Interval(api, data) {
        this.api = api;
        this.data = data;
    }
    Object.defineProperty(Interval.prototype, "daysFrequency", {
        get: function () {
            var dd = this.data.dd;
            if (dd) {
                return parseInt(dd.replace("d", ""));
            }
            return null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "mileageFrequency", {
        get: function () {
            var cnmd = this.data.cnmd;
            return cnmd;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Interval.prototype, "engineHoursFrequency", {
        get: function () {
            var cnehd = this.data.cnehd;
            return cnehd;
        },
        enumerable: false,
        configurable: true
    });
    Interval.getAll = function (api, fleet) {
        return api
            .runApi("/fleets/" + (typeof fleet === "number" ? fleet : fleet.data.id) + "/intervals", "GET")
            .then(function (res) { return res.intervals.map(function (interval) { return new Interval(api, interval); }); });
    };
    return Interval;
}());
exports.Interval = Interval;
//# sourceMappingURL=Interval.js.map