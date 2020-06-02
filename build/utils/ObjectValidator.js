"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exceptions_1 = require("./exceptions");
var ObjectValidator = /** @class */ (function () {
    function ObjectValidator(initialValues, validator) {
        var _this = this;
        this.initialValues = initialValues;
        this.validator = validator;
        this.getErrorMessages = function (recursionErrors) {
            var errors = recursionErrors || _this.validator(_this.initialValues);
            var messages = [];
            for (var key in errors) {
                var message = errors[key];
                if (message && typeof message === "object") {
                    messages.push.apply(messages, _this.getErrorMessages(message));
                }
                else if (message) {
                    messages.push(message);
                }
            }
            return messages;
        };
        this.throwErrors = function (code) {
            if (code === void 0) { code = 1; }
            var errors = new exceptions_1.CommandParameterException();
            for (var _i = 0, _a = _this.getErrorMessages(); _i < _a.length; _i++) {
                var message = _a[_i];
                errors.add(message);
            }
            errors.printErrors();
            errors.exit(code);
        };
        this.cast = function () {
            _this.throwErrors();
            return _this.initialValues;
        };
    }
    return ObjectValidator;
}());
exports.ObjectValidator = ObjectValidator;
//# sourceMappingURL=ObjectValidator.js.map