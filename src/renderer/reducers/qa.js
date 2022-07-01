import {
  SET_QUESTION,
  QUESTIONS_ENDED,
  QUESTION_ANSWERED,
} from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_QUESTION:
      return { ...state, question: payload, answered: false };
    case QUESTIONS_ENDED:
      return { ...state, question: null };
    case QUESTION_ANSWERED:
      return { ...state, question: null, answered: true };
    default:
      return state;
  }
};
