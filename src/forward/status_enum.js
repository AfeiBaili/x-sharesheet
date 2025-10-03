class Status {
	constructor(code) {
		this.code = code;
	}

	setData(data) {
		this.data = data;
		return this;
	}
}

const SET_OFFSET = new Status(0);

export {SET_OFFSET}