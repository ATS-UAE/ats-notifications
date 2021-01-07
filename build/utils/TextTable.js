"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextTable = void 0;
var TextTable = /** @class */ (function () {
    function TextTable() {
        var _this = this;
        /** An array columns in an array of rows. */
        this.table = [];
        /** @param row An array of columns. */
        this.addRow = function (row) {
            _this.table.push(row);
        };
        this.renderMarkdownRow = function (row) {
            return "| " + row
                .map(function (cell) { return String(cell).replace("|", "-"); })
                .join(" | ") + " |\n";
        };
        this.renderMarkdownHeaderSeparator = function (columns) {
            return "| " + new Array(columns).join("--- | ---") + " |\n";
        };
        this.getMarkdown = function () {
            return _this.table.reduce(function (acc, row, index) {
                if (index === 0) {
                    acc += _this.renderMarkdownRow(row);
                    acc += _this.renderMarkdownHeaderSeparator(row.length);
                }
                else {
                    acc += _this.renderMarkdownRow(row);
                }
                return acc;
            }, "");
        };
        /** @returns A table with rows separated in \n and columns
         * separated in \t.
         */
        this.render = function () {
            // Transform each row into a single line of string.
            return _this.table.reduce(function (tableString, row) {
                // Reduce row into a single line of string.
                tableString += row.reduce(function (rowString, col, index, array) {
                    rowString += col;
                    // If last item in row, insert new line character.
                    // Otherwise add \t.
                    if (index === array.length - 1) {
                        rowString += "\n";
                    }
                    else {
                        rowString += "\t";
                    }
                    return rowString;
                }, "");
                return tableString;
            }, "");
        };
    }
    return TextTable;
}());
exports.TextTable = TextTable;
//# sourceMappingURL=TextTable.js.map