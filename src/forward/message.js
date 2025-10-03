export default class Message {
	constructor(uuid, name, messageObj) {
		this.uuid = uuid
		this.name = name
		this.message = JSON.stringify(messageObj)
	}
}