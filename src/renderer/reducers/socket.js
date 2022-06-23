import {
  SOCKET_SET_SOCKET,
  SOCKET_SEND_USER,
  SOCKET_SEND_QUESTION,
} from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SOCKET_SET_SOCKET:
      return { socket: payload };
    default:
      return state;
  }
};
