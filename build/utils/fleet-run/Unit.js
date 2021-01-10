"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
class Unit {
    constructor(api, data) {
        this.api = api;
        this.data = data;
    }
    get mileage() {
        return this.data.cnm;
    }
    get engineHours() {
        return this.data.cneh;
    }
    get unitName() {
        return this.data.n;
    }
}
exports.Unit = Unit;
Unit.getAll = (api, fleet) => api
    .runApi(`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/units`, "GET")
    .then((res) => res.units.map((unit) => new Unit(api, unit)));
//# sourceMappingURL=Unit.js.map