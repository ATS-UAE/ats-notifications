export interface LineItem {
	/** Cost */
	c: number;
	/** Line item ID. */
	id: number;
	/** Line item name. */
	n: string;
	/** Line item number. */
	num: number;
	/** Types: 1 - task, 2 - part */
	t: 1 | 2;
}
