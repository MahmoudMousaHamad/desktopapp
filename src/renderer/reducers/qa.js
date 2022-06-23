import { SET_QUESTION } from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_QUESTION:
      return { question: payload };
    default:
      return state;
  }
};
