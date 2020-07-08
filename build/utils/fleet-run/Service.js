"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.ServiceStatus = void 0;
var moment_1 = __importDefault(require("moment"));
var ServiceStatus;
(function (ServiceStatus) {
    ServiceStatus[ServiceStatus["NEW"] = 0] = "NEW";
    ServiceStatus[ServiceStatus["UPCOMING"] = 1] = "UPCOMING";
    ServiceStatus[ServiceStatus["IN_PROGRESS"] = 2] = "IN_PROGRESS";
    ServiceStatus[ServiceStatus["OVERDUE"] = 4] = "OVERDUE";
    ServiceStatus[ServiceStatus["CLOSED"] = 8] = "CLOSED";
    ServiceStatus[ServiceStatus["REJECTED"] = 16] = "REJECTED";
    ServiceStatus[ServiceStatus["MANUALLY_CREATED"] = 128] = "MANUALLY_CREATED";
    ServiceStatus[ServiceStatus["OVERDUE_BY_MILEAGE"] = 256] = "OVERDUE_BY_MILEAGE";
    ServiceStatus[ServiceStatus["OVERDUE_BY_ENGINE_HOURS"] = 512] = "OVERDUE_BY_ENGINE_HOURS";
    ServiceStatus[ServiceStatus["OVERDUE_BY_DAYS"] = 1024] = "OVERDUE_BY_DAYS";
})(ServiceStatus = exports.ServiceStatus || (exports.ServiceStatus = {}));
function numberSorter(num1, num2) {
    if (num1 > num2) {
        return 1;
    }
    else if (num1 < num2) {
        return -1;
    }
    return 0;
}
var Service = /** @class */ (function () {
    function Service(api, data) {
        this.api = api;
        this.data = data;
        this.serviceStatus = [];
        this.serviceStatus = Service.getServiceStatus(data.f);
    }
    Object.defineProperty(Service.prototype, "isInProgress", {
        get: function () {
            return this.serviceStatus.includes(ServiceStatus.IN_PROGRESS);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "isMileageOverdue", {
        get: function () {
            return (this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
                this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_MILEAGE));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "isEngineHoursOverdue", {
        get: function () {
            return (this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
                this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_ENGINE_HOURS));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "isDaysOverdue", {
        get: function () {
            return (this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
                this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_DAYS));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "mileage", {
        get: function () {
            return this.data.cnm;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Service.prototype, "engineHours", {
        get: function () {
            return this.data.cneh;
        },
        enumerable: false,
        configurable: true
    });
    Service.prototype.getDate = function (timeZone) {
        var date = [this.data.sdt, "YYYY-MM-DD"];
        var time = [this.data.stm, "HH:mm:ss"];
        var parsedDate = moment_1.default(date[0] + time[0], date[1] + time[1]);
        if (timeZone) {
            return parsedDate.utcOffset(timeZone);
        }
        if (!parsedDate.isValid) {
            return null;
        }
        return parsedDate;
    };
    /** The values of ServiceStatus enum stored in an array. */
    Service.POSSIBLE_FLAG_VALUES = Object.keys(ServiceStatus)
        .map(function (k) { return ServiceStatus[k]; })
        .map(function (v) { return v; })
        .filter(function (ss) { return ss in ServiceStatus; })
        .sort(numberSorter)
        .reverse();
    Service.getAll = function (api, fleet) {
        return api
            .runApi("/fleets/" + (typeof fleet === "number" ? fleet : fleet.data.id) + "/services", "GET")
            .then(function (res) { return res.services.map(function (service) { return new Service(api, service); }); });
    };
    Service.getServiceStatus = function (flags) {
        var flagRemaining = flags;
        var status = [];
        for (var _i = 0, _a = Service.POSSIBLE_FLAG_VALUES; _i < _a.length; _i++) {
            var value = _a[_i];
            if (flagRemaining >= value) {
                status.push(value);
                flagRemaining -= value;
            }
        }
        return status.sort(numberSorter);
    };
    return Service;
}());
exports.Service = Service;
//# sourceMappingURL=Service.js.map