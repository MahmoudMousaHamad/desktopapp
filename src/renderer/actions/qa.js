import { SET_QUESTION } from "./types";

export const setQuestion = (question) => ({
  type: SET_QUESTION,
  payload: question,
});
