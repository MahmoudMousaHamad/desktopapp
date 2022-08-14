import {
	QUESTION_ANSWERED,
	QUESTIONS_ENDED,
	SET_QUESTIONS,
	SET_QUESTION,
} from "../actions/types";

const initialState = {};
export default (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case SET_QUESTION:
			return { ...state, question: payload, answered: false };
		case SET_QUESTIONS:
			return { ...state, questions: payload, answered: false };
		case QUESTIONS_ENDED:
			return { ...state, question: null };
		case QUESTION_ANSWERED:
			return { ...state, question: null, answered: true, questions: null };
		default:
			return state;
	}
};
