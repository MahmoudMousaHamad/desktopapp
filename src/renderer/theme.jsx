import { extendTheme } from "@mui/joy/styles";

export default extendTheme({
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
