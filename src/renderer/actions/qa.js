import { QUESTIONS_ENDED, SET_QUESTION } from "./types";

export const setQuestion = (question) => ({
  type: SET_QUESTION,
  payload: question,
});

export const endQuestions = () => ({
  type: QUESTIONS_ENDED,
});
