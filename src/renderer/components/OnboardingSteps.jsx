import { Box, Checkbox } from "@mui/joy";

import TypeAndExperience from "./TypeAndExperience";
import UserInformation from "./UserInformation";
import CoverLetter from "./CoverLetter";
import ListTextBox from "./ListTextBox";
import Locations from "./Locations";

const steps = [
	{
		title: "Welcome to JobApplier! 👋",
		description:
			"Before you start applying to jobs like a ninja, we need to do a few things first.",
	},
	// {
	// 	title: "How does JobApplier work?",
	// 	description: `The idea behind JobApplier is new and was never done before, as far as we know.
	// 		We realized that applying to jobs involves a lot of the same repetitive tasks: filling out
	// 		the same information, clicking the same buttons, searching, and attaching the same stuff.
	// 		You get the idea. We also know that the more job applications you send out, the better your chances
	// 		are at getting a job.
	// 		Well, computers are great at automating boring tasks, such as applying to jobs. And
	// 		if we can automate applying to jobs, it means that we can apply to more and more jobs with little
	// 		to no effort. Sounds too good to be true. But it is true. That is why we created JobApplier!
	// 		We created a "bot", which is just a computer program that applies for jobs on your behalf.
	// 		It does all the boring tasks for you and it even learns about you and answers job application questions
	// 		on your behalf. Cool, right? Okay, so, how does it work?
	// 		It's quite simple actually. All you need is a computer, a phone and an internet connection.

	// 		The bot will try to answer questions on your behalf, but if it isn't sure about a certain question,
	// 		it will ask you to answer the question. The bot will send this question to your mobile where you can
	// 		answer it there and the bot will get your answer and it will answer the question on the job application.
	// 		You can also answer the question in the Desktop application if you want.
	// 		`,
	// 	body: (
	// 		<ol>
	// 			<li>
	// 				Download and install the JobApplier Desktop application on your
	// 				Computer. Register, login and fill out your information.
	// 			</li>
	// 			<li>
	// 				Ensure your Indeed account is ready. Upload and setup your resume. If
	// 				you&apos;re new to Indeed, apply to a job to see how it works.
	// 			</li>
	// 			<li>Download the JobApplier mobile application and login.</li>
	// 			<li>
	// 				Open the JobApplier Desktop application, hit the &quot;Start&quot;
	// 				button to start the bot. The bot is going to open a new Google Chrome
	// 				window that it controls.
	// 			</li>
	// 			<li>Log into Indeed in the new window and let the bot do its thing.</li>
	// 		</ol>
	// 	),
	// },
	{
		title: "Basic questions",
		description: "Answer these common questions:",
		body: <UserInformation />,
	},
	{
		title: "Job titles",
		body: (
			<ListTextBox
				placeholder="Type a job title here"
				title="Titles"
				name="titles"
			/>
		),
	},
	{
		title: "Job locations",
		description: "",
		body: <Locations />,
	},
	{
		title: "Job type and experience",
		description:
			"What is the job type and experience level that you're looking for?",
		body: <TypeAndExperience />,
	},
	{
		title: "Cover letter",
		description: "Let's type that cover letter down here",
		body: <CoverLetter />,
	},
	// {
	// 	title: "Setting up your Indeed account",
	// 	description: "Okay, we're almost there... Setup your Indeed account:",
	// 	body: (
	// 		<Box>
	// 			<Checkbox label="Create an account if you have not already" />
	// 			<br />
	// 			<Checkbox label="Setup your account basic information" />
	// 			<br />
	// 			<Checkbox label="Upload your resume and make sure everything looks good" />
	// 			<br />
	// 			<Checkbox label="If you have never applied to a job on Indeed, submit one manually" />
	// 		</Box>
	// 	),
	// },
	{
		title: "Download the JobApplier mobile app",
		description: `Go to the Play or Apple store and search for "JobApplier".
			Download the app and login.`,
	},
];

export default steps;
