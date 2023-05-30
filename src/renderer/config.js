function endpoints(NODE_ENV) {
	let serverEndpoint;
	switch (NODE_ENV) {
		case "production":
			serverEndpoint = "http://64.227.6.165:3000/";
			break;

		case "staging":
			serverEndpoint = "http://64.227.6.165:3000/";
			break;

		default:
			serverEndpoint = "http://localhost:3000/";
			break;
	}

	return {
		SERVER_ENDPOINT: serverEndpoint,
		AUTH_API_URL: `${serverEndpoint}api/auth/`,
		APPLICATIONS_API_URL: `${serverEndpoint}api/applications/`,
	};
}

export const SERVER_URL =
	window.electron.NODE_ENV === "production"
		? "http://64.227.6.165:3000"
		: "http://localhost:3000";

export default {
	endpoints,
};
