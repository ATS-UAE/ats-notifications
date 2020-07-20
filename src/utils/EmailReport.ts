import { IRenderable } from "./Renderable";
import { MailSendOptions, Mailer } from "./Mailer";
import { MailConfig } from "../config/types";

export class EmailReport {
	constructor(private config: MailConfig) {}
	private body: string = "";

	public appendBody = (data: IRenderable | string): void => {
		if (typeof data === "string") {
			this.body += data;
		} else {
			this.body += data.render();
		}
	};

	public send = (options: Omit<MailSendOptions, "body">) => {
		const mailer = new Mailer(this.config);
		return mailer.sendMail({
			...options,
			body: this.body
		});
	};
}
