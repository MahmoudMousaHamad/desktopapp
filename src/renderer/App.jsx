import { CssVarsProvider } from "@mui/joy/styles";
import { Box, Typography } from "@mui/joy";
import { GlobalStyles } from "@mui/system";
import { useSelector } from "react-redux";
import { deepmerge } from "@mui/utils";

import { joyTheme, muiTheme } from "./theme";
import Router from "./components/Router";

const App = () => {
	const { "server-error": serverError } = useSelector((state) => state.socket);
	return (
		<CssVarsProvider
			disableTransitionOnChange
			theme={deepmerge(muiTheme, joyTheme)}
		>
			<GlobalStyles
				styles={(_theme) => ({
					body: {
						margin: 0,
						fontFamily: _theme.vars.fontFamily.body,
					},
				})}
			/>
			{serverError ? (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						height: "100vh",
						flexDirection: "column",
					}}
				>
					<Typography sx={{ textAlign: "center" }}>
						Sorry, something went wrong on our end :(
					</Typography>
				</Box>
			) : (
				<Router />
			)}
		</CssVarsProvider>
	);
};

export default App;
