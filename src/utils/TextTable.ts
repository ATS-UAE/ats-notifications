import { IRenderable } from "./Renderable";

export class TextTable implements IRenderable {
	/** An array columns in an array of rows. */
	public table: (string | number)[][] = [];

	/** @param row An array of columns. */
	public addRow = (row: (string | number)[]) => {
		this.table.push(row);
	};

	/** @returns A table with rows separated in \n and columns
	 * separated in \t.
	 */
	public render = () => {
		// Transform each row into a single line of string.
		return this.table.reduce<string>((tableString, row) => {
			// Reduce row into a single line of string.
			tableString += row.reduce<string>((rowString, col, index, array) => {
				rowString += col;
				// If last item in row, insert new line character.
				// Otherwise add \t.
				if (index === array.length - 1) {
					rowString += "\n";
				} else {
					rowString += "\t";
				}
				return rowString;
			}, "");
			return tableString;
		}, "");
	};
}
