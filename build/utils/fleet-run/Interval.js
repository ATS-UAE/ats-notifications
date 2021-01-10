"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = void 0;
class Interval {
    constructor(api, data) {
        this.api = api;
        this.data = data;
    }
    get daysFrequency() {
        const { dd } = this.data;
        if (dd) {
            return parseInt(dd.replace("d", ""));
        }
        return null;
    }
    get mileageFrequency() {
        const { cnmd } = this.data;
        return cnmd;
    }
    get engineHoursFrequency() {
        const { cnehd } = this.data;
        return cnehd;
    }
}
exports.Interval = Interval;
Interval.getAll = (api, fleet) => api
    .runApi(`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/intervals`, "GET")
    .then((res) => res.intervals.map((interval) => new Interval(api, interval)));
//# sourceMappingURL=Interval.js.map