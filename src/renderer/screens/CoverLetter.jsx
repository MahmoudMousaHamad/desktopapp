import { Box, Typography } from "@mui/joy";

import CoverLetter from "../components/CoverLetter";
import Layout from "../components/Layout";

export default () => {
	return (
		<>
			<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
				Cover Letter
			</Typography>
			<Typography sx={{ mb: 2 }} textColor="text.primary" level="body1">
				Please type your cover letter below. Changes are saved to your computer
				automatically.
			</Typography>
			<CoverLetter />
		</>
	);
};
