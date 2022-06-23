import { combineReducers } from "redux";
import auth from "./auth";
import message from "./message";
import qa from "./qa";

export default combineReducers({
  auth,
  message,
  qa,
});
