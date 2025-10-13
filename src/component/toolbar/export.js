import IconItem from "./icon_item.js";
import * as XLSX from "xlsx";

export default class Export extends IconItem {
	constructor(sheet) {
		super("export");
		this.el.on("click", (e) => {
			this.exportSheet(sheet.data.getData());
		})
	}

	exportSheet(sheetData) {
		const rows = sheetData.rows || {};
		const merges = sheetData.merges || [];

		// 解析为二维数组
		const aoa = [];

		Object.keys(rows).forEach((rKey) => {
			if (rKey === "len") return;
			const row = rows[rKey];
			const cells = row.cells || {};
			const arr = [];

			Object.keys(cells).forEach((cKey) => {
				const cell = cells[cKey];
				arr[cKey] = cell.text || "";
			});

			aoa[rKey] = arr;
		});

		// 转换为 SheetJS 工作表
		const worksheet = XLSX.utils.aoa_to_sheet(aoa);

		// 处理合并单元格
		if (merges.length > 0) {
			worksheet["!merges"] = merges.map((mergeStr) => {
				// mergeStr 例如 "D1:G1"
				return XLSX.utils.decode_range(mergeStr);
			});
		}

		// 创建工作簿并添加工作表
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet");

		// 导出为 Excel 文件
		XLSX.writeFile(workbook, "导出的电子表格.xlsx");
	}

	getData() {
		return sheet.data.getData();
	}
}