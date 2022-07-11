import { COUNT_UPDATE_FAIL, COUNT_UPDATE_SUCCESS } from "../actions/types";

const initialState = {};

export default (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case COUNT_UPDATE_SUCCESS:
      console.log("Count update success:", type, payload);
      return {
        ...state,
        countLimit: payload.countLimit,
        count: payload.count,
        canSubmit: payload.count < payload.countLimit,
      };
    case COUNT_UPDATE_FAIL:
      return { ...state, canSubmit: false, countUpdateFail: true };
    default:
      return state;
  }
};
