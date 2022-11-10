import {
	QUESTIONS_ANSWERED,
	QUESTIONS_ENDED,
	CLEAR_QUESTIONS,
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
		case CLEAR_QUESTIONS:
			return { ...state, questions: null, answered: false };
		case QUESTIONS_ENDED:
			return { ...state, questions: null };
		case QUESTIONS_ANSWERED:
			return { ...state, questions: null, answered: true };
		default:
			return state;
	}
};
