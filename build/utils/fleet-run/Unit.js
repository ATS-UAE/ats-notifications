"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
var Unit = /** @class */ (function () {
    function Unit(api, data) {
        this.api = api;
        this.data = data;
    }
    Object.defineProperty(Unit.prototype, "mileage", {
        get: function () {
            return this.data.cnm;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "engineHours", {
        get: function () {
            return this.data.cneh;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Unit.prototype, "unitName", {
        get: function () {
            return this.data.n;
        },
        enumerable: false,
        configurable: true
    });
    Unit.getAll = function (api, fleet) {
        return api
            .runApi("/fleets/" + (typeof fleet === "number" ? fleet : fleet.data.id) + "/units", "GET")
            .then(function (res) { return res.units.map(function (unit) { return new Unit(api, unit); }); });
    };
    return Unit;
}());
exports.Unit = Unit;
//# sourceMappingURL=Unit.js.map