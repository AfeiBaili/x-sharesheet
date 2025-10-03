import ToggleItem from "./toggle_item.js";

export default class Translation extends ToggleItem {
	constructor() {
		super("translation");
	}

	setClick(fun) {
		let oldClick = this.click;
		this.click = function () {
			oldClick.call(this);
			fun();
		}
	}
}

