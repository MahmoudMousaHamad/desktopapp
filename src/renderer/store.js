import { applyMiddleware, compose, createStore } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import socketIOClient from "socket.io-client";

import * as Actions from "./actions/socket";
import config from "./config";
import reducer from "./reducers";
import {
  LOGIN_SUCCESS,
  LOGOUT,
  SOCKET_GOT_DATA,
  SOCKET_SEND_DATA,
} from "./actions/types";
import Socket from "./Socket";
import { getCounts } from "./actions/application";

let socket;

function setupStartup(store) {
  console.log("Starting up...");
  console.log("Setting up socket...");
  socket = Socket.connect(
    config.endpoints(window.electron.NODE_ENV).SERVER_ENDPOINT,
    store
  );
  console.log("Getting updates from server...");
  store.dispatch(getCounts(store.getState().auth.user.id));
}

const SocketMiddleware = (store) => (next) => (action) => {
  console.log(action);
  switch (action.type) {
    case SOCKET_SEND_DATA:
      if (socket) {
        console.log(
          "Sending data over socket channel.",
          "Channel:",
          action.channel,
          "Payload:",
          action.payload
        );
        if (action.channel && action.payload) {
          socket.emit(action.channel, action.payload);
        } else {
          console.error("Action channel and/or payload are missing:", action);
        }
      } else {
        console.log("Socket is null");
      }
      break;
    case SOCKET_GOT_DATA:
      window.electron.ipcRenderer.send(action.name, {
        [action.name]: action[action.name],
      });
      break;
    case LOGIN_SUCCESS:
      setupStartup(store);
      break;
    case LOGOUT:
      console.log("Socket is disconnecting");
      if (socket) {
        socket.disconnect();
      }
      break;
    default:
      break;
  }

  return next(action);
};

const middleware = [thunk, SocketMiddleware];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, applyMiddleware(SocketMiddleware, thunk));

if (store.getState().auth.isLoggedIn) {
  // Set up socket
  setupStartup(store);
}

export default store;
