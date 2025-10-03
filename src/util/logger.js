const map = new Map();
map.set("console", (level, message) => {
	switch (level.code) {
		case 1:
			console.info(message);
			break
		case 2:
			console.warn(message);
			break
		case 3:
			console.error(message);
			break
		case 4:
			console.debug(message);
			break
	}
});
map.set("alert", (level, message) => {
	alert(level.name + ": " + message);
});


class LevelEnum {
	/** @type {number} */
	code
	/** @type {string} */
	name

	/**
	 * 创建枚举对象
	 * @param code 代码
	 * @param level 描述值
	 */
	constructor(code, level) {
		this.code = code;
		this.name = level;
	}
}

const INFO = new LevelEnum(1, "INFO");
const WARING = new LevelEnum(2, "WARNING");
const ERROR = new LevelEnum(3, "ERROR");
const DEBUG = new LevelEnum(4, "DEBUG");

class Logger {
	hideInfo = false
	hideWarn = false
	hideError = false
	hideDebug = false

	type = "alert"

	constructor(type) {
		this.type = type;
	}

	info(string) {
		if (!this.hideInfo) map.get(this.type)(INFO, string)
	}

	warn(string) {
		if (!this.hideWarn) map.get(this.type)(WARING, string)
	}

	error(string) {
		if (!this.hideError) map.get(this.type)(ERROR, string)
	}

	debug(string) {
		if (!this.hideDebug) map.get(this.type)(DEBUG, string)
	}
}

let logger = new Logger("console");
export default logger