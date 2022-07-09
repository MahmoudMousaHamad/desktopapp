import { SOCKET_GOT_DATA } from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
  const { type, name } = action;
  switch (type) {
    case SOCKET_GOT_DATA:
      return { ...state, [name]: action[name] };
    default:
      return state;
  }
};
