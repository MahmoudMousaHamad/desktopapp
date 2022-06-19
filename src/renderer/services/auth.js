import axios from "axios";

import config from '../../config';

const register = (email, password) => {
  return axios.post(config.AUTH_API_URL + "signup", {
    email,
    password,
  });
};
const login = (email, password) => {
  return axios
    .post(config.AUTH_API_URL + "signin", {
      email,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
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