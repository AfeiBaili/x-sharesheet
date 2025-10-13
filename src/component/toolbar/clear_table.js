import IconItem from "./icon_item.js";
import {$languages} from "../../locale/locale.js";
import getOrCreateSocket from "../../forward/socket.js";
import {CLEAR_TABLE} from "../../forward/status_enum.js";

export default class ClearTable extends IconItem {
	constructor(sheet) {
		super("clear-table");
		this.el.on("click", e => {
			const bool = $languages[0] === "en";
			if (confirm(bool ? "Are you sure you want to delete it?" : "你确定要删除吗？")) {
				getOrCreateSocket().sendMessage(CLEAR_TABLE.setData("*-/@!$$@@#ax231clear@!23a1s31dd@!#"));
				sheet.data.clearAllData()
				document.querySelector("textarea").value = ""
				sheet.editor.inputText = ""
				sheet.table.render()
			}
		})

		getOrCreateSocket().addOnMessage((data) => {
			if (data.code === 9) {
				sheet.data.clearAllData()
				sheet.table.render()
			}
		})
	}
}