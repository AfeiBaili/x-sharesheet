import CellRange from "../core/cell_range.js";
import getOrCreateSocket from "./socket.js";
import helper from "../core/helper.js";
import {canPaste, copyPaste, cutPaste, setStyleBorder} from "../core/data_proxy.js";
import {xy2expr} from "../core/alphabet.js";

export class MessageDataProxy {
	constructor(sheet) {
		this.sheet = sheet;

		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 2) return
			this.setMerge(data.data.bool, data.data.range)
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 3) return
			this.setStyleBorders(data.data.mode, data.data.style, data.data.color, data.data.range, data.data.styles);
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 4) return
			this.setStyle(data.data.property, data.data.value, data.data.range, data.data.styles);
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 5) return
			const {range, value, ri, ci, rn, cn, multiple} = data.data
			this.setFormula(range, value, ri, ci, rn, cn, multiple)
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 6) return
			const {srcRange, dstRange, what} = data.data
			this.setAutoFill(srcRange, dstRange, what)
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 7) return
			this.copy(data.data)
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 8) return
			this.cut(data.data)
		})
		getOrCreateSocket().addOnMessage((data) => {
			if (data.code !== 12) return
			this.pasteFromClipboard(data.data)
		})

	}

	pasteFromClipboard(data) {
		const contentToPaste = data.contentToPaste
		let startRow = data.ri;
		contentToPaste.forEach((row) => {
			let startColumn = data.ci;
			row.forEach((cellContent) => {
				this.getData().setCellText(startRow, startColumn, cellContent, 'input');
				startColumn += 1;
			});
			startRow += 1;
		});
		this.sheet.table.render()
	}

	getData() {
		return this.sheet.data
	}

	setMerge(bool, range) {
		const {sri, sci, eri, eci} = range
		range = new CellRange(sri, sci, eri, eci)
		if (!(eri - sri > 0 || eci - sci > 0)) return
		const rows = this.getData().rows;
		if (bool) {
			// merge
			const [rn, cn] = [eri - sri + 1, eci - sci + 1,]
			if (rn > 1 || cn > 1) {
				this.getData().changeData(() => {
					const cell = rows.getCellOrNew(sri, sci);
					cell.merge = [rn - 1, cn - 1];
					this.getData().merges.add(range)
					// console.log(this.getData().merges)
					rows.deleteCells(range)
					rows.setCell(sri, sci, cell);
				})
			}
		} else {
			// unmerge
			this.getData().changeData(() => {
				rows.deleteCell(sri, sci, "merge");
				this.getData().merges.deleteWithin(range)
			})
		}

		this.sheet.table.render()
	}

	setStyleBorders(mode, style, color, range, styles) {
		const {sri, sci, eri, eci} = range
		range = new CellRange(sri, sci, eri, eci)
		const {rows} = this.getData()

		const multiple = (eri - sri > 0 || eci - sci > 0)
		if (!multiple) {
			if (mode === 'inside' || mode === 'horizontal' || mode === 'vertical') {
				return;
			}
		}
		if (mode === 'outside' && !multiple) {
			setStyleBorder.call(this.getData(), sri, sci, {
				top: [style, color], bottom: [style, color], left: [style, color], right: [style, color],
			});
		} else if (mode === 'none') {
			range.each((ri, ci) => {
				const cell = rows.getCell(ri, ci);
				if (cell && cell.style !== undefined) {
					const ns = helper.cloneDeep(styles[cell.style]);
					delete ns.border;
					// ['bottom', 'top', 'left', 'right'].forEach((prop) => {
					//   if (ns[prop]) delete ns[prop];
					// });
					cell.style = this.getData().addStyle(ns);
				}
			});
		} else if (mode === 'all' || mode === 'inside' || mode === 'outside' || mode === 'horizontal' || mode === 'vertical') {
			const merges = [];
			for (let ri = sri; ri <= eri; ri += 1) {
				for (let ci = sci; ci <= eci; ci += 1) {
					// jump merges -- start
					const mergeIndexes = [];
					for (let ii = 0; ii < merges.length; ii += 1) {
						const [mri, mci, rn, cn] = merges[ii];
						if (ri === mri + rn + 1) mergeIndexes.push(ii);
						if (mri <= ri && ri <= mri + rn) {
							if (ci === mci) {
								ci += cn + 1;
								break;
							}
						}
					}
					mergeIndexes.forEach(it => merges.splice(it, 1));
					if (ci > eci) break;
					// jump merges -- end
					const cell = rows.getCell(ri, ci);
					let [rn, cn] = [0, 0];
					if (cell && cell.merge) {
						[rn, cn] = cell.merge;
						merges.push([ri, ci, rn, cn]);
					}
					const mrl = rn > 0 && ri + rn === eri;
					const mcl = cn > 0 && ci + cn === eci;
					let bss = {};
					if (mode === 'all') {
						bss = {
							bottom: [style, color], top: [style, color], left: [style, color], right: [style, color],
						};
					} else if (mode === 'inside') {
						if (!mcl && ci < eci) bss.right = [style, color];
						if (!mrl && ri < eri) bss.bottom = [style, color];
					} else if (mode === 'horizontal') {
						if (!mrl && ri < eri) bss.bottom = [style, color];
					} else if (mode === 'vertical') {
						if (!mcl && ci < eci) bss.right = [style, color];
					} else if (mode === 'outside' && multiple) {
						if (sri === ri) bss.top = [style, color];
						if (mrl || eri === ri) bss.bottom = [style, color];
						if (sci === ci) bss.left = [style, color];
						if (mcl || eci === ci) bss.right = [style, color];
					}
					if (Object.keys(bss).length > 0) {
						setStyleBorder.call(this.getData(), ri, ci, bss);
					}
					ci += cn;
				}
			}
		} else if (mode === 'top' || mode === 'bottom') {
			for (let ci = sci; ci <= eci; ci += 1) {
				if (mode === 'top') {
					setStyleBorder.call(this.getData(), sri, ci, {top: [style, color]});
					ci += rows.getCellMerge(sri, ci)[1];
				}
				if (mode === 'bottom') {
					setStyleBorder.call(this.getData(), eri, ci, {bottom: [style, color]});
					ci += rows.getCellMerge(eri, ci)[1];
				}
			}
		} else if (mode === 'left' || mode === 'right') {
			for (let ri = sri; ri <= eri; ri += 1) {
				if (mode === 'left') {
					setStyleBorder.call(this.getData(), ri, sci, {left: [style, color]});
					ri += rows.getCellMerge(ri, sci)[0];
				}
				if (mode === 'right') {
					setStyleBorder.call(this.getData(), ri, eci, {right: [style, color]});
					ri += rows.getCellMerge(ri, eci)[0];
				}
			}
		}
		this.sheet.table.render()
	}

	setStyle(property, value, range, styles) {
		const {sri, sci, eri, eci} = range
		range = new CellRange(sri, sci, eri, eci)
		const rows = this.getData().rows

		range.each((ri, ci) => {
			const cell = rows.getCellOrNew(ri, ci);
			let cstyle = {};
			if (cell.style !== undefined) {
				cstyle = helper.cloneDeep(styles[cell.style]);
			}
			if (property === 'format') {
				cstyle.format = value;
				cell.style = this.getData().addStyle(cstyle);
			} else if (property === 'font-bold' || property === 'font-italic' || property === 'font-name' || property === 'font-size') {
				const nfont = {};
				nfont[property.split('-')[1]] = value;
				cstyle.font = Object.assign(cstyle.font || {}, nfont);
				cell.style = this.getData().addStyle(cstyle);
			} else if (property === 'strike' || property === 'textwrap' || property === 'underline' || property === 'align' || property === 'valign' || property === 'color' || property === 'bgcolor') {
				cstyle[property] = value;
				cell.style = this.getData().addStyle(cstyle);
			} else {
				cell[property] = value;
			}
		});
		this.sheet.table.render()
	}

	setFormula(range, value, ri, ci, rn, cn, multiple) {
		const rows = this.getData().rows;
		const {sri, sci, eri, eci} = range
		range = new CellRange(sri, sci, eri, eci)
		if (multiple) {
			if (rn > 1) {
				for (let i = sci; i <= eci; i += 1) {
					const cell = rows.getCellOrNew(eri + 1, i);
					cell.text = `=${value}(${xy2expr(i, sri)}:${xy2expr(i, eri)})`;
				}
			} else if (cn > 1) {
				const cell = rows.getCellOrNew(ri, eci + 1);
				cell.text = `=${value}(${xy2expr(sci, ri)}:${xy2expr(eci, ri)})`;
			}
		} else {
			const cell = rows.getCellOrNew(ri, ci);
			cell.text = `=${value}()`;
		}
		this.sheet.table.render()
	}

	setAutoFill(srcRange, dstRange, what, error = () => {
	}) {
		const {sri, sci, eri, eci} = srcRange
		srcRange = new CellRange(sri, sci, eri, eci)
		dstRange = new CellRange(dstRange.sri, dstRange.sci, dstRange.eri, dstRange.eci)

		if (!canPaste.call(this.getData(), srcRange, dstRange, error)) return false;
		this.getData().changeData(() => {
			copyPaste.call(this.getData(), srcRange, dstRange, what, true);
		});
		this.sheet.table.render()
	}

	copy({srcRange, dstRange, what}) {
		const {sri, sci, eri, eci} = srcRange
		srcRange = new CellRange(sri, sci, eri, eci)
		dstRange = new CellRange(dstRange.sri, dstRange.sci, dstRange.eri, dstRange.eci)
		copyPaste.call(this.getData(), srcRange, dstRange, what);
		this.sheet.table.render()
	}

	cut({srcRange, dstRange}) {
		const {sri, sci, eri, eci} = srcRange
		srcRange = new CellRange(sri, sci, eri, eci)
		dstRange = new CellRange(dstRange.sri, dstRange.sci, dstRange.eri, dstRange.eci)
		cutPaste.call(this.getData(), srcRange, dstRange);
		this.sheet.table.render()
	}

	undo() {

	}

	redo() {

	}
}