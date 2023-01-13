function endpoints(NODE_ENV) {
	let serverEndpoint;
	switch (NODE_ENV) {
		case "production":
			serverEndpoint = "http://167.172.133.156/";
			break;

		case "staging":
			serverEndpoint = "http://167.172.133.156/";
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
		? "http://useapplier.com"
		: "http://localhost:3000";

export default {
	endpoints,
};
