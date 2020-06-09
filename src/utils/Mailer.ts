import nodemailer from "nodemailer";
import { mail } from "../config";
import Mail from "nodemailer/lib/mailer";

export interface MailSendOptions {
	to: string[];
	subject: string;
	body: string;
	nickname: string;
}

export class Mailer {
	private mailer: Mail;
	private static instance: Mailer;

	private constructor() {
		this.mailer = nodemailer.createTransport({
			auth: {
				user: mail.user,
				pass: mail.pass
			},
			port: mail.port,
			secure: true,
			host: mail.host
		});
	}

	public static getInstance = () => {
		if (!Mailer.instance) {
			Mailer.instance = new Mailer();
		}
		return Mailer.instance;
	};

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
