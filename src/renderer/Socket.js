import { connect } from "socket.io-client";

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

    this.socket = connect(SERVER_ENDPOINT, {
      reconnection: true,
      reconnectionDelay: 5000,
      reconnectionAttempts: Infinity,
    });

    this.socket.on("connect", async () => {
      this.isConnected = true;

      console.log("User: ", store.getState().auth);

      store.dispatch(
        Actions.sendData("authentication", {
          user: store.getState().auth.user,
          source: "desktop",
        })
      );

      // this.socket.on('authenticated', function() {});

      ["answer"].forEach((channel) => {
        this.socket.on(channel, (data) => {
          store.dispatch(Actions.gotData(data, channel));
        });
      });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
    });

    return this.socket;
  },
};
