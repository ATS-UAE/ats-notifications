"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var https_1 = __importDefault(require("https"));
var Api = /** @class */ (function () {
    function Api(token) {
        var _this = this;
        this.token = token;
        this.runApi = function (path, method) {
            return new Promise(function (resolve, reject) {
                var BASE_URL = "https://fleetrun.wialon.com/api";
                var data = "";
                var request = https_1.default.request(BASE_URL + path, {
                    method: method,
                    headers: {
                        Authorization: "Token " + _this.token,
                        accept: "application/json"
                    }
                }, function (res) {
                    res.on("data", function (chunk) {
                        data += chunk.toString("utf8");
                    });
                    res.on("end", function () {
                        resolve(JSON.parse(data));
                    });
                    res.on("error", function (error) {
                        reject(error);
                    });
                });
                request.on("error", function (error) {
                    reject(error);
                });
                request.end();
            });
        };
    }
    return Api;
}());
exports.Api = Api;
//# sourceMappingURL=Api.js.map