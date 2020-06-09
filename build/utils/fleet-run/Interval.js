"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = void 0;
var Interval = /** @class */ (function () {
    function Interval(api, data) {
        this.api = api;
        this.data = data;
    }
    Interval.getAll = function (api, fleet) {
        return api
            .runApi("/fleets/" + (typeof fleet === "number" ? fleet : fleet.data.id) + "/intervals", "GET")
            .then(function (res) { return res.intervals.map(function (interval) { return new Interval(api, interval); }); });
    };
    return Interval;
}());
exports.Interval = Interval;
//# sourceMappingURL=Interval.js.map