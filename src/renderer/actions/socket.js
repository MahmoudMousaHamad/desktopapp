import { SOCKET_GOT_DATA, SOCKET_SEND_DATA } from "./types";

export const gotData = (data, name) => ({
  type: SOCKET_GOT_DATA,
  [name]: data,
  name,
});

export const sendData = (channel, data) => ({
  type: SOCKET_SEND_DATA,
  payload: data,
  channel,
});
