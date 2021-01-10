"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandParameterException = void 0;
class CommandParameterException extends Error {
    constructor() {
        super("An command line error has occurred.");
        this.errors = [];
        this.add = (message) => {
            this.errors.push(message);
        };
        this.printErrors = () => {
            for (const error of this.errors) {
                console.log(error);
            }
        };
        this.exit = (code = 1) => {
            if (this.errors.length) {
                process.exit(code);
            }
        };
        this.throwOnErrors = () => {
            if (this.errors) {
                throw this;
            }
        };
    }
}
exports.CommandParameterException = CommandParameterException;
//# sourceMappingURL=CommandParameterException.js.map