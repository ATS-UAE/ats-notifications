"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fleet = void 0;
class Fleet {
    constructor(api, data) {
        this.api = api;
        this.data = data;
    }
}
exports.Fleet = Fleet;
Fleet.getAll = async (api) => api
    .runApi("/fleets", "GET")
    .then(res => res.fleets.map(fleet => new Fleet(api, fleet)));
//# sourceMappingURL=Fleet.js.map