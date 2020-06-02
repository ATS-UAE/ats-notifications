import minimist from "minimist";

interface FleetrunCommandLineArgs {
	h?: boolean;
	help?: boolean;
	token?: string;
	recipient?: string | string[];
	subject?: string;
	timezone?: string;
	"fleet-id"?: string;
	"mail-pass"?: string;
	"mail-user"?: string;
	"mail-host"?: string;
}

interface FleetrunConfig {
	recipients: string[];
	fleetId: number;
	token: string;
	subject: string;
	mail: {
		user: string;
		password: string;
		host: string;
		port: number;
	};
	timezone?: string;
}

const args = minimist<FleetrunCommandLineArgs>(process.argv);

const getConfig = (): FleetrunConfig => {
	const recipients =
		(args.recipient &&
			(Array.isArray(args.recipient) ? args.recipient : [args.recipient])) ||
		undefined;

	const token = args.token || process.env.FLEETRUN_TOKEN;
	const fleetId = (args["fleet-id"] && parseInt(args["fleet-id"])) || undefined;
	const subject = args.subject;
	const mailUser = args["mail-user"] || process.env.MAIL_USER;
	const mailPass = args["mail-pass"] || process.env.MAIL_USER;
	const mailHost = args["mail-host"] || process.env.MAIL_HOST;
	const mailPort = args.port || process.env.MAIL_PORT || 465;

	// TODO: provide a better validation where it outputs which exactly is missing from the parameters.
	// Check if all parameters exist.
	if (
		token &&
		recipients &&
		fleetId &&
		subject &&
		mailUser &&
		mailPass &&
		mailHost &&
		mailPort
	) {
		const config: FleetrunConfig = {
			token,
			recipients,
			fleetId,
			subject,
			mail: {
				user: mailUser,
				password: mailPass,
				host: mailHost,
				port: mailPort
			}
		};
		return config;
	}

	throw new Error("Missing arguments.");
};

export default getConfig();
