import { format } from "date-fns";

export abstract class DateUtils {
	public static getDateString = () => {
		return format(new Date(), "yyyy-MM-dd");
	};
}
