/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/prefer-default-export */
/* eslint-disable promise/no-return-wrap */

import { SET_MESSAGE, COUNT_UPDATE_SUCCESS, COUNT_UPDATE_FAIL } from "./types";

import ApplicationService from "../services/application";

export const getCounts = (userId) => (dispatch) => {
  return ApplicationService.getCounts(userId).then(
    (res) => {
      dispatch({
        type: COUNT_UPDATE_SUCCESS,
        payload: res.data,
      });
      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      dispatch({
        type: COUNT_UPDATE_FAIL,
      });
      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });
      return Promise.reject();
    }
  );
};

export const updateCount = (userId) => (dispatch) => {
  return ApplicationService.updateCount(userId).then(
    (res) => {
      dispatch({
        type: COUNT_UPDATE_SUCCESS,
        payload: res.data,
      });
      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      dispatch({
        type: COUNT_UPDATE_FAIL,
      });
      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });
      return Promise.reject();
    }
  );
};
