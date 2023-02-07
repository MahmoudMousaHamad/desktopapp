import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/joy";
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
				Your answers are saved on your computer. We do not collect any of your
				answers.
			</Typography>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr 1fr 1fr",
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
						<Button
							variant="soft"
							sx={{ mb: 1 }}
							onClick={() =>
								window.electron.ipcRenderer.send(
									"open-url",
									"https://www.linkedin.com/jobs/application-settings/"
								)
							}
						>
							Click here for LinkedIn
						</Button>
						<Button
							variant="soft"
							sx={{ ml: 1 }}
							onClick={() =>
								window.electron.ipcRenderer.send(
									"open-url",
									"https://profile.indeed.com/"
								)
							}
						>
							Click here for Indeed
						</Button>
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