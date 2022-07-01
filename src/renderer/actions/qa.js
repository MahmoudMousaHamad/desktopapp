import { QUESTIONS_ENDED, QUESTION_ANSWERED, SET_QUESTION } from "./types";

export const setQuestion = (question) => ({
  type: SET_QUESTION,
  payload: question,
});

export const endQuestions = () => ({
  type: QUESTIONS_ENDED,
});

export const questionAnswered = () => ({
  type: QUESTION_ANSWERED,
});
