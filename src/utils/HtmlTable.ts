import { IRenderableHtml } from "./RenderableHtml";

export class HtmlTable implements IRenderableHtml {
	public rows: (string | number)[][] = [];
	constructor(public columns: string[]) {}

	public addRow = (values: Array<string | number>) => {
		this.rows.push(values);
	};

	private renderHeaderRowHtml = () => {
		const headersHtml =
			"<tr>" +
			this.columns
				.map(c => `<th style="${this.getRowStyle()}">${c}</th>`)
				.join("") +
			"</tr>";
		return headersHtml;
	};

	private renderRowsHtml = () => {
		const rowsHtml = this.rows
			.map(
				r =>
					`<tr>${r
						.map(r => `<td style="${this.getRowStyle()}">${r}</td>`)
						.join("")}</tr>`
			)
			.join("");
		return rowsHtml;
	};

	private getRowStyle = () => {
		return `
			border: 1px solid black;
			padding: 5px 10px 5px 10px;
		`;
	};

	private getTableStyle = () => {
		return `
			border: 1px solid black;
		`;
	};

	public render = () => {
		const html =
			`<table style="${this.getTableStyle()}">` +
			this.renderHeaderRowHtml() +
			this.renderRowsHtml() +
			"</table>";

		return html;
	};
}
