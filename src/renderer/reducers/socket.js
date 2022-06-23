import { SOCKET_GOT_DATA } from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
  const { type, name } = action;
  switch (type) {
    case SOCKET_GOT_DATA:
      return { [name]: action[name], ...state };
    default:
      return state;
  }
};
