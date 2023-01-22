import React, { useState } from "react";
import { Box, Button, Link, Typography } from "@mui/joy";
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
						<Typography level="body2">
							For LinkedIn,
							<Button
								sx={{ ml: 1 }}
								onClick={() =>
									window.electron.ipcRenderer.send(
										"open-url",
										"https://www.linkedin.com/jobs/application-settings/"
									)
								}
							>
								Click here
							</Button>
							<Box>
								For Indeed,
								<Button
									sx={{ ml: 1 }}
									onClick={() =>
										window.electron.ipcRenderer.send(
											"open-url",
											"https://profile.indeed.com/"
										)
									}
								>
									Click here
								</Button>
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
