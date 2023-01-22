import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
} from "../actions/types";

let user = JSON.parse(localStorage.user || null);
const tokens = JSON.parse(localStorage.tokens || null);
console.log(tokens);
if (!tokens?.access_token || Date.now() >= tokens?.expiry_date) {
	console.log("User is gonna be null");
	user = null;
}
const initialState = user
	? { isLoggedIn: true, user }
	: { isLoggedIn: false, user: null };

export default (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case REGISTER_SUCCESS:
			return {
				...state,
				isLoggedIn: false,
			};
		case REGISTER_FAIL:
			return {
				...state,
				isLoggedIn: false,
			};
		case LOGIN_SUCCESS:
			return {
				...state,
				isLoggedIn: true,
				user: payload.user,
			};
		case LOGIN_FAIL:
			return {
				...state,
				isLoggedIn: false,
				user: null,
			};
		case LOGOUT:
			return {
				...state,
				isLoggedIn: false,
				user: null,
			};
		default:
			return state;
	}
};
