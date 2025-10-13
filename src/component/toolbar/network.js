import IconItem from "./icon_item.js";
import {tf} from "../../locale/locale.js";

export default class Network extends IconItem {
	constructor() {
		super("network-error");
		this.tip = tf(`toolbar.network`);
	}
}