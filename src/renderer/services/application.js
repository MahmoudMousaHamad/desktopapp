/* eslint-disable import/prefer-default-export */

import axios from "axios";

import config from "../config";

const getCounts = (userId) => {
	return axios.get(
		`${
			config.endpoints(window.electron.NODE_ENV).APPLICATIONS_API_URL
		}getCounts`,
		{ params: { userId } }
	);
};

const updateCount = (userId) => {
	return axios.post(
		`${
			config.endpoints(window.electron.NODE_ENV).APPLICATIONS_API_URL
		}updateCount`,
		{ userId }
	);
};

export default {
	updateCount,
	getCounts,
};
