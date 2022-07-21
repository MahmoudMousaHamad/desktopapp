import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackwardIosIcon from "@mui/icons-material/ArrowBackIosRounded";
import { Box, Typography } from "@mui/material";
import IconButton from "@mui/joy/IconButton";
import Modal from "@mui/material/Modal";
import { Button, Checkbox } from "@mui/joy";
import { useState } from "react";

import TypeAndExperience from "./TypeAndExperience";
import UserInformation from "./UserInformation";
import CoverLetter from "./CoverLetter";
import JobTitles from "./JobTitles";
import Locations from "./Locations";

const style = {
	display: "grid",
	alignContent: "space-between",
	justifyContent: "center",
	overflow: "auto",
	position: "absolute",
	width: "100%",
	height: "100%",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
};

const steps = [
	{
		title: "Welcome to JobApplier! 👋",
		description:
			"Before you start applying to jobs like a ninja, we need to do a few things first.",
	},
	{
		title: "Step 1: Answering basic questions",
		description:
			"We need to know a few things about you to help us apply for jobs on your behalf.",
		body: <UserInformation />,
	},
	{
		title: "Step 2: Job titles",
		description:
			"Tell us what job titles you would like to apply for (enter at least 5).",
		body: <JobTitles />,
	},
	{
		title: "Step 2: Job locations",
		description: "Tell us where would like your job to be (enter at least 5).",
		body: <Locations />,
	},
	{
		title: "Step 4: Job type and experience",
		description:
			"What is the job type and experience level that you're looking for?",
		body: <TypeAndExperience />,
	},
	{
		title: "Step 5: Cover letter",
		description: "Let's type that cover letter down here",
		body: <CoverLetter />,
	},
	{
		title: "Step 6: Setting up your Indeed account",
		description:
			"Okay, we're almost there... The last step is to setup your Indeed account, which includes the following things that you need to do:",
		body: (
			<Box>
				<Checkbox label="Create an account if you have not already" />
				<br />
				<Checkbox label="Setup your account basic information" />
				<br />
				<Checkbox label="Upload your resume and make sure everything looks good" />
				<br />
				<Checkbox label="If you have never applied to a job on Ineed, submit one manually" />
			</Box>
		),
	},
];

export default () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [open, setOpen] = useState(true);

	const handleClose = () => {
		localStorage.setItem("onboard-done", true);
		setOpen(false);
	};

	const step = steps[currentStep];

	return (
		<Modal
			open={open}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<>
				<Box
					sx={{
						position: "fixed",
						zIndex: 10,
						right: "10%",
						bottom: "10%",
						mt: 2,
						width: "fit-content",
						display: "grid",
						gridAutoFlow: "column",
						gridColumnGap: "50px",
					}}
				>
					{currentStep !== 0 && (
						<IconButton
							size="lg"
							variant="solid"
							color="primary"
							sx={{ borderRadius: "50%" }}
							onClick={() => setCurrentStep(currentStep - 1)}
						>
							<ArrowBackwardIosIcon />
						</IconButton>
					)}
					{currentStep < steps.length - 1 && (
						<IconButton
							size="lg"
							variant="solid"
							color="primary"
							sx={{ borderRadius: "50%" }}
							onClick={() => setCurrentStep(currentStep + 1)}
						>
							<ArrowForwardIosIcon />
						</IconButton>
					)}
					{currentStep === steps.length - 1 && (
						<Button onClick={handleClose}>Done</Button>
					)}
				</Box>
				<Box sx={style}>
					<Box sx={{ p: "50px", width: 700 }}>
						<Typography id="modal-modal-title" variant="h2" component="h2">
							{step?.title}
						</Typography>
						<Typography id="modal-modal-description" sx={{ mt: 2 }}>
							{step?.description}
						</Typography>
						<Box sx={{ mt: 2 }}>{step?.body}</Box>
					</Box>
				</Box>
			</>
		</Modal>
	);
};
