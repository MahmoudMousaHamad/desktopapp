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
				sx={{ p: 5, borderRadius: 15, width: "auto", height: "fit-content" }}
				color="primary"
				variant="outlined"
			>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h4">
					Job Type
				</Typography>
				<Box sx={{ mb: 3 }}>
					{[
						{ label: "Full-time", value: "INDEED:fulltime,LINKEDIN:F" },
						{ label: "Part-time", value: "INDEED:parttime,LINKEDIN:P" },
						{ label: "Contract", value: "INDEED:contract,LINKEDIN:C" },
						{ label: "Temporary", value: "INDEED:temporary,LINKEDIN:T" },
						{ label: "Internship", value: "INDEED:internship,LINKEDIN:I" },
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
						{ label: "Entry level", value: "INDEED:ENTRY_LEVEL,LINKEDIN:2" },
						{ label: "Mid level", value: "INDEED:MID_LEVEL,LINKEDIN:4" },
						{ label: "Senior level", value: "INDEED:SENIOR_LEVEL,LINKEDIN:4" },
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
