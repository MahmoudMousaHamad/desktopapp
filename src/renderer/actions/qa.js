import {
	QUESTIONS_ANSWERED,
	QUESTIONS_ENDED,
	CLEAR_QUESTIONS,
	SET_QUESTIONS,
} from "./types";

export const setQuestions = (questions) => ({
	type: SET_QUESTIONS,
	payload: questions,
});

export const clearQuestions = () => ({
	type: CLEAR_QUESTIONS,
});

export const endQuestions = () => ({
	type: QUESTIONS_ENDED,
});

export const questionsAnswered = () => ({
	type: QUESTIONS_ANSWERED,
});
