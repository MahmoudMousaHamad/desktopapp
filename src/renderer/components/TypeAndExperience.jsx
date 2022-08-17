/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from "react";
import { Box, Radio, Sheet, Typography } from "@mui/joy";

export default () => {
	const [type, setType] = useState(
		JSON.parse(localStorage.getItem("job-type"))
	);

	const [experienceLevel, setExperienceLevel] = useState(
		JSON.parse(localStorage.getItem("experience-level"))
	);

	useEffect(() => {
		localStorage.setItem("job-type", JSON.stringify(type));
		localStorage.setItem("experience-level", JSON.stringify(experienceLevel));
	}, [type, experienceLevel]);

	return (
		<>
			<Sheet
				sx={{ p: 5, borderRadius: 15, mb: 5 }}
				color="primary"
				variant="outlined"
			>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h4">
					Job Type
				</Typography>
				<Box sx={{ mb: 3 }}>
					{[
						{ label: "Full-time", value: "fulltime" },
						{ label: "Part-time", value: "parttime" },
						{ label: "Contract", value: "contract" },
						{ label: "Temporary", value: "temporary" },
						{ label: "Internship", value: "internship" },
					].map((option) => (
						<Radio
							key={option.value}
							onChange={(e) => setType(e.target.value)}
							checked={option.value === type}
							value={option.value}
							label={option.label}
							sx={{ fontSize: 20, p: 1 }}
						/>
					))}
				</Box>

				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h4">
					Experience Level
				</Typography>
				<Box sx={{ mb: 1 }}>
					{[
						{ label: "Entry level", value: "ENTRY_LEVEL" },
						{ label: "Mid level", value: "MID_LEVEL" },
						{ label: "Senior level", value: "SENIOR_LEVEL" },
					].map((option) => (
						<Radio
							key={option.value}
							onChange={(e) => setExperienceLevel(e.target.value)}
							checked={option.value === experienceLevel}
							value={option.value}
							label={option.label}
							sx={{ fontSize: 20, p: 1 }}
						/>
					))}
				</Box>
			</Sheet>
		</>
	);
};
