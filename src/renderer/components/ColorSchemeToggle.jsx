import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import IconButton from "@mui/joy/IconButton";
import { useEffect, useState } from "react";
import { useColorScheme } from "@mui/joy";

const ColorSchemeToggle = () => {
	const { mode, setMode } = useColorScheme("dark");
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) {
		return <IconButton size="sm" variant="outlined" color="primary" />;
	}
	return (
		<IconButton
			size="sm"
			variant="outlined"
			color="primary"
			onClick={() => {
				if (mode === "light") {
					setMode("dark");
				} else {
					setMode("light");
				}
			}}
		>
			{mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
		</IconButton>
	);
};

export default ColorSchemeToggle;
