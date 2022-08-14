import io from "socket.io-client";

import * as Actions from "./actions/socket";

export default {
	isConnected: false,
	socket: null,
	interval: null,
	connect(SERVER_ENDPOINT, store) {
		if (this.socket) {
			this.socket.destroy();
			delete this.socket;
			this.socket = null;
		}

		this.socket = io(SERVER_ENDPOINT, {
			reconnectionAttempts: Infinity,
			reconnectionDelay: 5000,
			reconnection: true,
			autoConnect: false,
		});

		this.socket.auth = {
			user: store.getState().auth.user,
			source: "desktop",
		};

		this.socket.onAny((event, ...args) => {
			console.log(event, args);
		});

		this.socket.on("connect_error", (err) => {
			console.log("Connection to server failed", err);
		});

		this.socket.connect();

		this.socket.on("connect", async () => {
			this.isConnected = true;

			console.log("User: ", store.getState().auth.user);

			store.dispatch(
				Actions.sendData("authentication", {
					user: store.getState().auth.user,
					source: "desktop",
				})
			);

			["answer", "bot-status-change", "application-counts", "answers"].forEach(
				(channel) => {
					this.socket.on(channel, (data) => {
						console.log(
							"Got data from server on channel:",
							channel,
							", and data:",
							data
						);
						store.dispatch(Actions.gotData(data, channel));
					});
				}
			);
		});

		this.socket.on("disconnect", () => {
			console.log("Socket disconnected");
			this.isConnected = false;
		});

		this.socket.on("connect_error", () => {
			store.dispatch(Actions.gotData("Server error", "server-error"));
			this.disconnect();
		});

		return this.socket;
	},
	disconnect() {
		this.socket?.disconnect();
		this.socket?.destroy();
		this.socket = null;
	},
};
