import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/joy";
import { TextField } from "@mui/material";

const CoverLetter = () => {
	const [coverLetter, setCoverLetter] = useState(
		localStorage.getItem("cover-letter") ||
			`[Your Name]

[Street Address] | [City, ST ZIP Code] | [Phone] | [Email]

[Date]

[Recipient Name]

[Title]

[Company]

[Address]

[City, ST ZIP Code]

Dear [Recipient]:

[If you’re ready to write, just select this tip text and start typing to replace it with your own. Don’t include space to the right or left of the characters in your selection.]

[Apply any text formatting you see in this letter with just a click from the Home tab, in the Styles group.]

[Wondering what to include in your cover letter? It’s a good idea to include key points about why you’re a great fit for the company and the best choice for the specific job. Of course, don’t forget to ask for the interview—but keep it brief! A cover letter shouldn’t read like a novel, no matter how great a plot you’ve got.]

Sincerely,

[Your Name]

Rights reserved to Microsoft: https://templates.office.com/en-us/simple-cover-letter-tm00002108
			`
	);

	useEffect(() => {
		localStorage.setItem("cover-letter", coverLetter);
	}, [coverLetter]);

	return (
		<>
			<Box sx={{ p: 3 }}>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
					Cover Letter
				</Typography>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="body1">
					Please type your cover letter below. Changes are saved to your
					computer automatically.
				</Typography>
				<Box sx={{ mb: 1 }}>
					<TextField
						value={coverLetter}
						onChange={(e) => setCoverLetter(e.target.value)}
						multiline
						rows={50}
						fullWidth
					/>
				</Box>
			</Box>
		</>
	);
};
export default CoverLetter;
