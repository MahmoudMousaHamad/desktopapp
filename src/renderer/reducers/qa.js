import { SET_QUESTION, QUESTIONS_ENDED } from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_QUESTION:
      return { ...state, question: payload };
    case QUESTIONS_ENDED:
      return { ...state, question: null };
    default:
      return state;
  }
};
