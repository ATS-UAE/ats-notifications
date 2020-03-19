import { IRenderableHtml } from "./RenderableHtml";
import { MailSendOptions, Mailer } from "./Mailer";

export class EmailReport {
	private body: string = "";

	public appendBody = (data: IRenderableHtml | string): void => {
		if (typeof data === "string") {
			this.body += data;
		} else {
			this.body += data.render();
		}
	};

	public send = (options: Omit<MailSendOptions, "body">) => {
		const mailer = Mailer.getInstance();
		return mailer.sendMail({
			...options,
			body: this.body
		});
	};
}
