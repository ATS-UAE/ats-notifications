"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var CommandParameterException = /** @class */ (function (_super) {
    __extends(CommandParameterException, _super);
    function CommandParameterException() {
        var _this = _super.call(this, "An command line error has occurred.") || this;
        _this.errors = [];
        _this.add = function (message) {
            _this.errors.push(message);
        };
        _this.printErrors = function () {
            for (var _i = 0, _a = _this.errors; _i < _a.length; _i++) {
                var error = _a[_i];
                console.log(error);
            }
        };
        _this.exit = function (code) {
            if (code === void 0) { code = 1; }
            if (_this.errors.length) {
                process.exit(code);
            }
        };
        _this.throwOnErrors = function () {
            if (_this.errors) {
                throw _this;
            }
        };
        return _this;
    }
    return CommandParameterException;
}(Error));
exports.CommandParameterException = CommandParameterException;
//# sourceMappingURL=CommandParameterException.js.map