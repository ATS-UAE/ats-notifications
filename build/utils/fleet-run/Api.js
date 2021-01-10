"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const https_1 = __importDefault(require("https"));
class Api {
    constructor(token) {
        this.token = token;
        this.runApi = (path, method) => new Promise((resolve, reject) => {
            const BASE_URL = "https://fleetrun.wialon.com/api";
            let data = "";
            const request = https_1.default.request(BASE_URL + path, {
                method,
                headers: {
                    Authorization: "Token " + this.token,
                    accept: "application/json"
                }
            }, res => {
                res.on("data", (chunk) => {
                    data += chunk.toString("utf8");
                });
                res.on("end", () => {
                    resolve(JSON.parse(data));
                });
                res.on("error", error => {
                    reject(error);
                });
            });
            request.on("error", error => {
                reject(error);
            });
            request.end();
        });
    }
}
exports.Api = Api;
//# sourceMappingURL=Api.js.map