"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlTable = void 0;
var HtmlTable = /** @class */ (function () {
    function HtmlTable(columns) {
        var _this = this;
        this.columns = columns;
        this.table = [];
        this.addRow = function (values) {
            _this.table.push(values);
        };
        this.renderHeaderRowHtml = function () {
            var headersHtml = "<tr>" +
                _this.columns
                    .map(function (c) { return "<th style=\"" + _this.getRowStyle() + "\">" + c + "</th>"; })
                    .join("") +
                "</tr>";
            return headersHtml;
        };
        this.renderRowsHtml = function () {
            var rowsHtml = _this.table
                .map(function (r) {
                return "<tr>" + r
                    .map(function (r) { return "<td style=\"" + _this.getRowStyle() + "\">" + r + "</td>"; })
                    .join("") + "</tr>";
            })
                .join("");
            return rowsHtml;
        };
        this.getRowStyle = function () {
            return "\n\t\t\tborder: 1px solid black;\n\t\t\tpadding: 5px 10px 5px 10px;\n\t\t";
        };
        this.getTableStyle = function () {
            return "\n\t\t\tborder: 1px solid black;\n\t\t";
        };
        this.render = function () {
            var html = "<table style=\"" + _this.getTableStyle() + "\">" +
                _this.renderHeaderRowHtml() +
                _this.renderRowsHtml() +
                "</table>";
            return html;
        };
    }
    return HtmlTable;
}());
exports.HtmlTable = HtmlTable;
//# sourceMappingURL=HtmlTable.js.map