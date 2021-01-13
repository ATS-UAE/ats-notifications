"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextTable = void 0;
class TextTable {
    constructor() {
        /** An array columns in an array of rows. */
        this.table = [];
        /** @param row An array of columns. */
        this.addRow = (row) => {
            this.table.push(row);
        };
        this.renderMarkdownRow = (row) => {
            return `| ${row
                .map((cell) => String(cell).split("|").join("-"))
                .join(" | ")} |\n`;
        };
        this.renderMarkdownHeaderSeparator = (columns) => {
            return `| ${new Array(columns).join("--- | ---")} |\n`;
        };
        this.getMarkdown = () => {
            return this.table.reduce((acc, row, index) => {
                if (index === 0) {
                    acc += this.renderMarkdownRow(row);
                    acc += this.renderMarkdownHeaderSeparator(row.length);
                }
                else {
                    acc += this.renderMarkdownRow(row);
                }
                return acc;
            }, "");
        };
        /** @returns A table with rows separated in \n and columns
         * separated in \t.
         */
        this.render = () => {
            // Transform each row into a single line of string.
            return this.table.reduce((tableString, row) => {
                // Reduce row into a single line of string.
                tableString += row.reduce((rowString, col, index, array) => {
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
}
exports.TextTable = TextTable;
//# sourceMappingURL=TextTable.js.map