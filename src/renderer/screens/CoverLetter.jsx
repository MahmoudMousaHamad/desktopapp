import React, { useState } from "react";
import { Box, Input, Sheet, Typography } from "@mui/joy";
import { TextField } from "@mui/material";

const CoverLetter = () => {
	const [coverLetter, setCoverLetter] = useState(
		localStorage.getItem("cover-letter") || ""
	);

	return (
		<>
			<Box sx={{ p: 3 }}>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
					Cover Letter
				</Typography>
				<Sheet
					sx={{ p: 5, borderRadius: 15, mb: 5 }}
					color="primary"
					variant="outlined"
				>
					<Box sx={{ mb: 1 }}>
						<TextField
							value={coverLetter}
							onChange={(e) => setCoverLetter(e.target.value)}
							multiline
							rows={50}
							fullWidth
						/>
					</Box>
				</Sheet>
			</Box>
		</>
	);
};
export default CoverLetter;
