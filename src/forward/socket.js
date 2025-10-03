import axios from "axios";
import Message from "./message.js";

const name = "spreadsheet";

const url = `http://127.0.0.1:8080/channel/get?name=${name}`
const webSocketUrl = "ws://127.0.0.1:8080/";
let socket = null;
let initMessage = null;

/**
 *
 * @returns {Socket} socket实现
 */
export default function getOrCreateSocket() {
	if (socket == null) socket = new Socket();
	return socket;
}

class Socket {
	constructor() {
		const self = this
		axios.get(url).then(function (response) {
			self.uuid = response.data
			self.name = name
			//这两行执行顺序重要
			initMessage = new Message(self.uuid, self.name, "/init")
			self.socket = new WebSocketImpl(webSocketUrl);
		}).catch(function (error) {
			//todo 编写错误逻辑
			console.error("连接服务器错误：" + error);
		})
	}

	addOnMessage(fun) {
		messageSet.add(fun)
	}

	sendMessage(obj) {
		const message = new Message(this.uuid, this.name, obj);
		this.socket.socket.send(JSON.stringify(message));
	}
}

/** set函数集 */
const messageSet = new Set();

class WebSocketImpl {
	constructor(url) {
		const socket = new WebSocket(url);
		socket.onopen = () => {
			this.socket.send(JSON.stringify(initMessage))
		}
		socket.onmessage = this.message
		socket.onclose = this.close
		socket.onerror = this.error
		this.socket = socket;
	}

	message(event) {
		messageSet.forEach(it => it.call(this, event.data))
	}

	close(event) {
	}

	error(error) {
		console.error("连接ws服务器错误：" + error);
	}
}