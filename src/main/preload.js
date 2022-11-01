const { contextBridge, ipcRenderer } = require("electron");
const { Status } = require("./sites");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

contextBridge.exposeInMainWorld("electron", {
	NODE_ENV: process.env.NODE_ENV,
	DriverStatus: Status,
	ipcRenderer: {
		send(channel, ...args) {
			ipcRenderer.send(channel, ...args);
		},
		sendSync(channel, ...args) {
			ipcRenderer.sendSync(channel, ...args);
		},
		invoke(channel, ...args) {
			ipcRenderer.invoke(channel, ...args);
		},
		on(channel, func) {
			const subscription = (_event, ...args) => func(...args);
			ipcRenderer.on(channel, subscription);

			return () => ipcRenderer.removeListener(channel, subscription);
		},
		once(channel, func) {
			ipcRenderer.once(channel, (_event, ...args) => func(...args));
		},
		removeAllListeners(channel) {
			ipcRenderer.removeAllListeners(channel);
		},
		eventNames() {
			return ipcRenderer.eventNames();
		},
	},
});
