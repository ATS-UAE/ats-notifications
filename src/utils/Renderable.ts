export interface IRenderable {
	render: () => string;
	table: Array<string | number>[];
}
