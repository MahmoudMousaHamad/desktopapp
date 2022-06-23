import { SOCKET_SET_SOCKET } from "./types";

export const setSocket = (socket) => ({
  type: SOCKET_SET_SOCKET,
  payload: socket,
});
