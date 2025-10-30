import axios from "axios";
import Message from "./message.js";


const ip = "https://sheet.yfose.cn:8080"
// const ip = "http://127.0.0.1:8080"
const socketIp = "wss://sheet.yfose.cn:8080"
// const socketIp = "ws://127.0.0.1:8080"

let socket = null;
let initMessage = null;

/**
 *
 * @returns {Socket} socket实现
 */
export default function getOrCreateSocket(name) {
	if (socket == null) socket = new Socket(name);
	return socket;
}

function setSocket(name) {
	if (socket == null) socket = new Socket(name);
	if (socket.socket !== undefined) socket.socket.close()

	socket = new Socket(name);
	return socket;
}

export {setSocket, ip, socketIp}

let networkEl = null

class Socket {
	constructor(username) {
		const name = `spreadsheet-${username}`;
		const url = `${ip}/channel/get?name=${name}`
		const self = this

		axios.get(url).then(function (response) {
			self.uuid = response.data
			self.name = name
			//这两行执行顺序重要
			initMessage = new Message(self.uuid, self.name, "/init")
			self.socket = new WebSocketImpl(socketIp);
		}).catch(function (error) {
			//todo 编写错误逻辑
			console.error("连接服务器错误：" + error);
		})
	}

	setNetworkEl(network) {
		networkEl = network;
	}

	addOnMessage(fun) {
		messageSet.add(fun)
	}

	sendMessage(obj) {
		const message = new Message(this.uuid, this.name, obj);
		try {
			this.socket.socket.send(JSON.stringify(message));
		} catch (e) {
			console.log(e)
		}
	}
}

/** set函数集 */
const messageSet = new Set();
let reconnectTimeout = setTimeout(() => {
})

class WebSocketImpl {
	constructor(url) {
		const socket = new WebSocket(url);
		socket.onopen = this.initSocket.bind(this);
		socket.onmessage = this.message.bind(this);
		socket.onclose = this.close.bind(this);
		socket.onerror = this.close.bind(this);
		this.socket = socket;
	}

	message(event) {
		const messageObj = JSON.parse(event.data);
		if (messageObj === "/init") {
			console.log("/init")
			return
		}
		messageSet.forEach(it => it.call(this, messageObj))
	}

	initSocket() {
		const networkDiv = networkEl.el.el.lastElementChild.lastElementChild;
		networkDiv.classList.remove("network-error");
		networkDiv.classList.add("network-connect");
		this.socket.send(JSON.stringify(initMessage))
		const reconnectEl = document.getElementById("reconnect");
		reconnectEl.style.display = "none";
	}

	close(error) {
		const networkDiv = networkEl.el.el.lastElementChild.lastElementChild;
		networkDiv.classList.remove("network-connect");
		networkDiv.classList.add("network-error");
		console.error("服务器断开连接：" + error);
		const reconnectEl = document.getElementById("reconnect");
		reconnectEl.style.display = "block";

		clearTimeout(reconnectTimeout);
		reconnectTimeout = setTimeout(() => {
			this.socket = new WebSocket(socketIp)
			this.socket.onopen = this.initSocket.bind(this);
			this.socket.onmessage = this.message.bind(this);
			this.socket.onclose = this.close.bind(this);
			this.socket.onerror = this.close.bind(this);
		}, 1000)
	}
}