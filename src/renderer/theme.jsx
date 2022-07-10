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
          main: colors.blue[500],
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
      palette: {
        background: {
          bodyEmail: "var(--joy-palette-neutral-50)",
          componentBg: "var(--joy-palette-common-white)",
        },
      },
    },
    dark: {
      palette: {
        background: {
          bodyEmail: "var(--joy-palette-common-black)",
          componentBg: "var(--joy-palette-background-level1)",
        },
      },
    },
  },
  fontFamily: {
    // display: "'Roboto Flex', var(--joy-fontFamily-fallback)",
    // body: "'Roboto Flex', var(--joy-fontFamily-fallback)",
  },
});
