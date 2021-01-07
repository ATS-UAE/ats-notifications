"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownToHtml = void 0;
var showdown_1 = __importDefault(require("showdown"));
var markdownProcessor = new showdown_1.default.Converter({
    tables: true
});
markdownProcessor.setFlavor("ghost");
var MarkdownToHtml = /** @class */ (function () {
    function MarkdownToHtml(markdown) {
        var _this = this;
        this.markdown = markdown;
        this.getHtml = function () {
            return markdownProcessor.makeHtml(_this.markdown);
        };
    }
    return MarkdownToHtml;
}());
exports.MarkdownToHtml = MarkdownToHtml;
//# sourceMappingURL=MarkdownToHtml.js.map