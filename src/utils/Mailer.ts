import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { MailConfig } from "../config/types";

export interface MailSendOptions {
	to: string[];
	cc?: string[];
	subject: string;
	body: string;
	nickname: string;
}

export class Mailer {
	private mailer: Mail;

	constructor(private config: MailConfig) {
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
					from: `${options.nickname} <${this.config.user}>`,
					to: options.to,
					subject: options.subject,
					html: options.body,
					cc: options.cc
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
