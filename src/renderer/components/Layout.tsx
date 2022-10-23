/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import { Box, BoxProps, useTheme } from "@mui/joy";

const Root = (props: BoxProps) => (
	<Box
		{...props}
		sx={[
			{
				"grid-template-rows": "0.5fr 1.5fr 1fr 1.4fr 0.6fr",
				"grid-template-columns": "0.8fr 1.2fr 1fr 1fr",
				bgcolor: "background.body",
				display: "grid",
				gridTemplateAreas: `
					"header header header header"
					"side main main main"
					"side main main main"
					"side main main main"
					"controls controls controls controls"
				`,
				height: "100vh",
			},
		]}
	/>
);

const Header = (props: BoxProps) => (
	<Box
		component="header"
		className="Header"
		{...props}
		sx={[
			{
				"grid-area": "header",
				p: 2,
				gap: 2,
				bgcolor: "background.componentBg",
				display: "flex",
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				gridColumn: "1 / -1",
				borderBottom: "1px solid",
				borderColor: "divider",
				position: "sticky",
				top: 0,
				zIndex: 1100,
			},
			...(Array.isArray(props.sx) ? props.sx : [props.sx]),
		]}
	/>
);

const SideNav = (props: BoxProps) => (
	<Box
		component="nav"
		className="Navigation"
		{...props}
		sx={[
			{
				"grid-area": "side",
				p: 2,
				bgcolor: "background.componentBg",
				borderRight: "1px solid",
				borderColor: "divider",
				display: {
					xs: "none",
					sm: "initial",
				},
			},
		]}
	/>
);

const SidePane = (props: BoxProps) => (
	<Box
		{...props}
		sx={[
			{
				flexDirection: "column",
				display: "flex",
				height: "100%",
			},
		]}
	/>
);

const Main = (props: BoxProps) => (
	<Box
		component="main"
		className="Main"
		{...props}
		sx={{
			backgroundImage: useTheme().backgrounds.main,
			backgroundPosition: "0px 0px, -19px -19px",
			backgroundSize: "contain, 10px 10px",
			bgcolor: "background.body",
			"grid-area": "main",
			overflowY: "scroll",
			padding: 3,
		}}
	/>
);

const Controls = (props: BoxProps) => (
	<Box
		{...props}
		sx={{
			backgroundColor: "background.componentBg",
			justifyContent: "center",
			"grid-area": "controls",
			borderTop: "1px solid",
			alignItems: "center",
			flexDirection: "row",
			borderColor: "divider",
			display: "flex",
			zIndex: 10,
		}}
	/>
);

export default {
	SidePane,
	Controls,
	SideNav,
	Header,
	Root,
	Main,
};
