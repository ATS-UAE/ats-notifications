interface MailConfig {
	host: string;
	user: string;
	pass: string;
	port: number;
}

export const mail: MailConfig = {
	host: process.env.MAIL_HOST,
	user: process.env.MAIL_USER,
	pass: process.env.MAIL_PASS,
	port: parseInt(process.env.MAIL_PORT)
};
