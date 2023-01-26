import { combineReducers } from "redux";

import {
	JOB_SUBMITTED,
	SET_APPLIER_STATE,
	START_SESSION,
	STOP_SESSION,
} from "../actions/types";
import auth from "./auth";
import message from "./message";
import qa from "./qa";
import application from "./application";
import socket from "./socket";

export default combineReducers({
	auth,
	message,
	qa,
	application,
	socket,
	applier: (state = { sessionJobCount: 0 }, { type, payload }) => {
		switch (type) {
			case START_SESSION:
				return {
					...state,
					sessionInProgress: true,
					site: payload.site,
					sessionJobCount: 0,
				};
			case STOP_SESSION:
				return {
					...state,
					sessionInProgress: false,
					sessionJobCount: 0,
				};
			case JOB_SUBMITTED:
				return {
					...state,
					sessionJobCount: state.sessionJobCount + 1,
				};
			case SET_APPLIER_STATE:
				return {
					...state,
					applierState: payload,
				};
			default:
				return state;
		}
	},
});
