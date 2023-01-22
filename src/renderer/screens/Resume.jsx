import React, { useState } from "react";
import { Box, Link, Typography } from "@mui/joy";
import MyDialog from "../components/Dialog";
import UserInformation from "../components/UserInformation";

const Resume = () => {
	const [open, setOpen] = useState(
		localStorage.showResumeDialog === undefined ||
			localStorage.showResumeDialog === "true"
	);
	return (
		<Box>
			<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
				Common Questions
			</Typography>
			<Typography sx={{ mb: 2 }} textColor="text.secondary" level="body1">
				All of your answers are saved on your computer. We do not collect any of
				your answers.
			</Typography>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr",
					gridGap: "20px",
				}}
			>
				<UserInformation />
			</Box>
			<MyDialog
				open={open}
				message={
					<>
						<Typography level="body1">
							Make sure to upload your resume on the respective platforms!
						</Typography>
						<Typography level="body2">
							For LinkedIn,
							<Link
								sx={{ ml: 1 }}
								href="https://www.linkedin.com/jobs/application-settings/"
							>
								Click here
							</Link>
							<Box>
								For Indeed,
								<Link
									sx={{ ml: 1 }}
									href="https://profile.indeed.com/?hl=en_US&co=US"
								>
									Click here
								</Link>
							</Box>
						</Typography>
					</>
				}
				onDontShowAgain={() => {
					localStorage.showResumeDialog = false;
				}}
				onClose={() => setOpen(false)}
				title="Update your resume"
			/>
		</Box>
	);
};
export default Resume;
