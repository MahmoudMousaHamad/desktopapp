import axios from "axios";

import config from "../config";

const register = (email, password, firstName, lastName) => {
	return axios.post(
		`${config.endpoints(window.electron.NODE_ENV).AUTH_API_URL}signup`,
		{
			email,
			password,
			firstName,
			lastName,
		}
	);
};
const login = (email, password) => {
	return axios
		.post(`${config.endpoints(window.electron.NODE_ENV).AUTH_API_URL}signin`, {
			email,
			password,
		})
		.then((response) => {
			if (response.data.token) {
				localStorage.setItem("user", JSON.stringify(response.data));
			}
			return response.data;
		});
};
const logout = () => {
	localStorage.removeItem("user");
};
export default {
	register,
	login,
	logout,
};
