import { applyMiddleware, compose, createStore } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import socketIOClient from "socket.io-client";

import * as Actions from "./actions/socket";
import config from "../config";
import reducer from "./reducers";
import { SOCKET_SEND_DATA } from "./actions/types";

let socket;

const SocketMiddleware = (store) => (next) => (action) => {
  console.log(action);
  if (socket) {
    switch (action.type) {
      case SOCKET_SEND_DATA:
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
        break;
      default:
        break;
    }
  } else {
    console.log("Socket is null");
  }

  return next(action);
};

const StartSocket = (store) => {
  socket = socketIOClient(config.SERVER_ENDPOINT);

  socket.emit("source", "desktop");
  store.dispatch(Actions.sendData("user", store.getState().auth.user));

  ["answer"].forEach((channel) => {
    socket.on(channel, (data) => {
      store.dispatch(Actions.gotData(data, channel));
    });
  });
};

const middleware = [thunk, SocketMiddleware];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, applyMiddleware(SocketMiddleware, thunk));

// Set up socket
StartSocket(store);

export default store;
