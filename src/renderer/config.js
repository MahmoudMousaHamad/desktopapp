function endpoints(NODE_ENV) {
	let serverEndpoint;
	switch (NODE_ENV) {
		case "production":
			serverEndpoint = "https://useapplier.com";
			break;

		case "staging":
			serverEndpoint = "https://useapplier.com";
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
		? "https://useapplier.com"
		: "http://localhost:3000";

export default {
	endpoints,
};
