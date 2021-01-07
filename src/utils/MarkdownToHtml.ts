import showdown from "showdown";

const markdownProcessor = new showdown.Converter({
	tables: true
});

markdownProcessor.setFlavor("ghost");

export class MarkdownToHtml {
	constructor(public markdown: string) {}

	public getHtml = () => {
		return markdownProcessor.makeHtml(this.markdown);
	};
}
