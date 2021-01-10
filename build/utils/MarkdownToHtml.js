"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownToHtml = void 0;
const showdown_1 = __importDefault(require("showdown"));
const markdownProcessor = new showdown_1.default.Converter({
    tables: true
});
markdownProcessor.setFlavor("ghost");
class MarkdownToHtml {
    constructor(markdown) {
        this.markdown = markdown;
        this.getHtml = () => {
            return markdownProcessor.makeHtml(this.markdown);
        };
    }
}
exports.MarkdownToHtml = MarkdownToHtml;
//# sourceMappingURL=MarkdownToHtml.js.map