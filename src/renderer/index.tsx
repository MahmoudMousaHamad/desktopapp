import { StyledEngineProvider } from "@mui/system";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { render } from "react-dom";
import React from "react";

import App from "./App";
import store from "./store";

const root = document.getElementById("root");
render(
	<React.StrictMode>
		<Provider store={store}>
			<StyledEngineProvider injectFirst>
				<SnackbarProvider maxSnack={3}>
					<App />
				</SnackbarProvider>
			</StyledEngineProvider>
		</Provider>
	</React.StrictMode>,
	root
);
