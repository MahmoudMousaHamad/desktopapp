import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { questionAnswered } from "./actions/qa";
import { gotData } from "./actions/socket";

import { SOCKET_GOT_DATA, SOCKET_SEND_DATA } from "./actions/types";
import reducer from "./reducers";
import Socket from "./Socket";

const SocketMiddleware = (store) => (next) => (action) => {
	switch (action.type) {
		case SOCKET_SEND_DATA:
			if (Socket.socket) {
				if (action.channel && action.payload) {
					Socket.socket.emit(action.channel, action.payload);
				} else {
					Socket.socket.emit(action.channel);
				}
			} else {
				console.error("Socket is null");
			}
			break;
		case SOCKET_GOT_DATA:
			if (action.name === "answer") {
				store.dispatch(questionAnswered());
			}
			window.electron.ipcRenderer.send(action.name, {
				[action.name]: action[action.name],
			});
			break;
		default:
			break;
	}

	return next(action);
};

// const middleware = [thunk, SocketMiddleware];
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, applyMiddleware(SocketMiddleware, thunk));

export default store;
