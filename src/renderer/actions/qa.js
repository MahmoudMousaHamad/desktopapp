import {
	QUESTIONS_ENDED,
	QUESTION_ANSWERED,
	SET_QUESTION,
	SET_QUESTIONS,
} from "./types";

export const setQuestion = (question) => ({
	type: SET_QUESTION,
	payload: question,
});

export const setQuestions = (questions) => ({
	type: SET_QUESTIONS,
	payload: questions,
});

export const endQuestions = () => ({
	type: QUESTIONS_ENDED,
});

export const questionAnswered = () => ({
	type: QUESTION_ANSWERED,
});
