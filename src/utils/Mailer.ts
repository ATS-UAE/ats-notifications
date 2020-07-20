import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { MailConfig } from "../config/types";

export interface MailSendOptions {
	to: string[];
	subject: string;
	body: string;
	nickname: string;
}

export class Mailer {
	private mailer: Mail;
	private static instance: Mailer;

	constructor(config: MailConfig) {
		this.mailer = nodemailer.createTransport({
			auth: {
				user: config.user,
				pass: config.pass
			},
			port: config.port,
			secure: true,
			host: config.host
		});
	}

	public sendMail = (options: MailSendOptions) => {
		return new Promise((resolve, reject) => {
			this.mailer.sendMail(
				{
					from: `${options.nickname} <no-reply@atsuae.net>`,
					to: options.to,
					subject: options.subject,
					html: options.body
				},
				(err, info) => {
					if (err) {
						reject(err);
					} else {
						resolve(info);
					}
				}
			);
		});
	};
}
