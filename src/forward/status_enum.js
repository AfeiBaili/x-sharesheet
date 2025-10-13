class Status {
	constructor(code) {
		this.code = code;
	}

	setData(data) {
		this.data = data;
		return this;
	}
}

const EDIT = new Status(0);
const DELETE = new Status(1);
const MERGE = new Status(2);
const STYLE_BORD = new Status(3);
const STYLES = new Status(4);
const FORMULA = new Status(5);
const AUTO_FILL = new Status(6);
const COPY = new Status(7);
const CUT = new Status(8);
const CLEAR_TABLE = new Status(9);
const DELETE_USER = new Status(10);
const RESET_TABLE = new Status(11);
const PASTE_FROM_CLIPBOARD = new Status(12);

export {
	EDIT,
	DELETE,
	MERGE,
	STYLE_BORD,
	STYLES,
	FORMULA,
	AUTO_FILL,
	COPY,
	CUT,
	CLEAR_TABLE,
	DELETE_USER,
	RESET_TABLE,
	PASTE_FROM_CLIPBOARD
};