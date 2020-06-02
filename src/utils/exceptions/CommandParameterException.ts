export class CommandParameterException extends Error {
	constructor() {
		super("An command line error has occurred.");
	}

	private errors: string[] = [];

	public add = (message: string) => {
		this.errors.push(message);
	};

	public printErrors = () => {
		for (const error of this.errors) {
			console.log(error);
		}
	};

	public exit = (code = 1) => {
		if (this.errors.length) {
			process.exit(code);
		}
	};

	public throwOnErrors = () => {
		if (this.errors) {
			throw this;
		}
	};
}
