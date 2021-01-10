"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.ServiceStatus = void 0;
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
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
class Service {
    constructor(api, data) {
        this.api = api;
        this.data = data;
        this.serviceStatus = [];
        this.serviceStatus = Service.getServiceStatus(data.f);
    }
    get serviceName() {
        return this.data.n;
    }
    get isInProgress() {
        return this.serviceStatus.includes(ServiceStatus.IN_PROGRESS);
    }
    get isMileageOverdue() {
        return (this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
            this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_MILEAGE));
    }
    get isEngineHoursOverdue() {
        return (this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
            this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_ENGINE_HOURS));
    }
    get isDaysOverdue() {
        return (this.serviceStatus.includes(ServiceStatus.OVERDUE) &&
            this.serviceStatus.includes(ServiceStatus.OVERDUE_BY_DAYS));
    }
    get mileage() {
        return this.data.cnm;
    }
    get engineHours() {
        return this.data.cneh;
    }
    getDate(timezone) {
        const date = [this.data.sdt, "YYYY-MM-DD"];
        const time = [this.data.stm, "HH:mm:ss"];
        try {
            const parsedDate = date_fns_1.parse(date[0] + time[0], date[1] + time[1], new Date());
            if (timezone) {
                return date_fns_tz_1.utcToZonedTime(parsedDate, timezone);
            }
            return parsedDate;
        }
        catch (e) {
            return null;
        }
    }
}
exports.Service = Service;
/** The values of ServiceStatus enum stored in an array. */
Service.POSSIBLE_FLAG_VALUES = Object.keys(ServiceStatus)
    .map((k) => ServiceStatus[k])
    .map((v) => v)
    .filter((ss) => ss in ServiceStatus)
    .sort(numberSorter)
    .reverse();
Service.getAll = (api, fleet) => api
    .runApi(`/fleets/${typeof fleet === "number" ? fleet : fleet.data.id}/services`, "GET")
    .then((res) => res.services.map((service) => new Service(api, service)));
Service.getServiceStatus = (flags) => {
    let flagRemaining = flags;
    const status = [];
    for (const value of Service.POSSIBLE_FLAG_VALUES) {
        if (flagRemaining >= value) {
            status.push(value);
            flagRemaining -= value;
        }
    }
    return status.sort(numberSorter);
};
//# sourceMappingURL=Service.js.map