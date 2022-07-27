import ArrowBackwardIosIcon from "@mui/icons-material/ArrowBackIosRounded";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Box, Typography } from "@mui/material";
import IconButton from "@mui/joy/IconButton";
import Modal from "@mui/material/Modal";
import { Button } from "@mui/joy";
import { useState } from "react";

import steps from "./OnboardingSteps";

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
							{`Step ${currentStep + 1}: ${step?.title}`}
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
