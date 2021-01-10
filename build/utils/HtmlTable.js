"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlTable = void 0;
class HtmlTable {
    constructor(columns) {
        this.columns = columns;
        this.table = [];
        this.addRow = (values) => {
            this.table.push(values);
        };
        this.renderHeaderRowHtml = () => {
            const headersHtml = "<tr>" +
                this.columns
                    .map((c) => `<th style="${this.getRowStyle()}">${c}</th>`)
                    .join("") +
                "</tr>";
            return headersHtml;
        };
        this.renderRowsHtml = () => {
            const rowsHtml = this.table
                .map((r) => `<tr>${r
                .map((r) => `<td style="${this.getRowStyle()}">${r}</td>`)
                .join("")}</tr>`)
                .join("");
            return rowsHtml;
        };
        this.getRowStyle = () => {
            return `
			border: 1px solid black;
			padding: 5px 10px 5px 10px;
		`;
        };
        this.getTableStyle = () => {
            return `
			border: 1px solid black;
		`;
        };
        this.render = () => {
            const html = `<table style="${this.getTableStyle()}">` +
                this.renderHeaderRowHtml() +
                this.renderRowsHtml() +
                "</table>";
            return html;
        };
    }
}
exports.HtmlTable = HtmlTable;
//# sourceMappingURL=HtmlTable.js.map