// Target the module containing the `ProcessEnv` interface
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
declare namespace NodeJS {
	// Merge the existing `ProcessEnv` definition with ours
	// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces
	export interface ProcessEnv {
		MAIL_HOST: string;
		MAIL_USER: string;
		MAIL_PASS: string;
		MAIL_PORT: string;
	}
}
