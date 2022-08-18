import { experimental_extendTheme as extendMuiTheme } from "@mui/material/styles";
import { extendTheme } from "@mui/joy/styles";
import { colors } from "@mui/material";

export const muiTheme = extendMuiTheme({
	// This is required to point to `var(--joy-*)` because we are using `CssVarsProvider` from Joy UI.
	cssVarPrefix: "joy",
	colorSchemes: {
		light: {
			palette: {
				primary: {
					main: colors.blue[900],
				},
				grey: colors.grey,
				error: {
					main: colors.red[500],
				},
				info: {
					main: colors.purple[500],
				},
				success: {
					main: colors.green[500],
				},
				warning: {
					main: colors.yellow[200],
				},
				common: {
					white: "#FFF",
					black: "#09090D",
				},
				divider: colors.grey[200],
				text: {
					primary: colors.grey[800],
					secondary: colors.grey[600],
				},
			},
		},
		dark: {
			palette: {
				primary: {
					main: colors.blue[600],
				},
				grey: colors.grey,
				error: {
					main: colors.red[600],
				},
				info: {
					main: colors.purple[600],
				},
				success: {
					main: colors.green[600],
				},
				warning: {
					main: colors.yellow[300],
				},
				common: {
					white: "#FFF",
					black: "#09090D",
				},
				divider: colors.grey[800],
				text: {
					primary: colors.grey[100],
					secondary: colors.grey[300],
				},
			},
		},
	},
});

export const joyTheme = extendTheme({
	typography: {
		label: {
			fontSize: "var(--joy-fontSize-sm)",
			fontWeight: "var(--joy-fontWeight-lg)",
			lineHeight: "var(--joy-lineHeight-lg)",
			marginBottom: "3px",
		},
	},
	colorSchemes: {
		light: {
			backgrounds: {
				main: "linear-gradient(to bottom, transparent, white 50%), radial-gradient(lightgray 1px, transparent 0)",
			},
			palette: {
				progress: {
					trail: "#f7cf59",
					path: "#5981f7",
				},
				background: {
					body: "var(--joy-palette-neutral-50)",
					componentBg: "var(--joy-palette-common-white)",
				},
				divider: colors.grey[400],
			},
		},
		dark: {
			backgrounds: {
				main: "linear-gradient(to bottom, transparent, #2d2d49 50%), radial-gradient(#4c568f 1px, transparent 0)",
			},
			palette: {
				progress: {
					trail: "#f7cf59",
					path: "#5981f7",
				},
				background: {
					componentBg: "#2e2e48",
					body: "#2d2d49",
				},
				divider: colors.grey[700],
			},
		},
	},
	fontFamily: {
		// display: "'Roboto Flex', var(--joy-fontFamily-fallback)",
		// body: "'Roboto Flex', var(--joy-fontFamily-fallback)",
	},
});
