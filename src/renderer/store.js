import { applyMiddleware, compose } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import reducer from "./reducers";
const middleware = [thunk];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default configureStore(
  {reducer},
  composeEnhancers(
      applyMiddleware(...middleware)
  )
);