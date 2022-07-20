/* eslint-disable react/no-array-index-key */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { Box, Input, Radio, Typography } from "@mui/joy";
import { useState } from "react";

const keywords = {
	sponsorship: [
		"visa",
		"sponsorship",
		"future",
		"require",
		"status",
		"will",
		"employment",
		"H-1B",
		"eg",
		"work",
	],
	experience: ["many", "how", "year", "experience"],
	relocate: ["reliably", "commute", "able", "job", "will", "relocate"],
	relocateYesNo: [
		"willingness",
		"open",
		"requirement",
		"relocate",
		"united",
		"state",
		"nationwide",
	],
	workAuthorization: ["authorized", "work"],
	citizen: ["citizen"],
	clearance: ["clearance", "security"],
	salary: ["approximately", "offer", "kyr", "salary", "position", "amount"],
	gpa: ["average", "grade", "scale", "point", "university", "gpa"],
	degree: ["education", "degree", "highest", "level"],
	phone: ["phone", "number"],
	country: ["country"],
	address: ["address", "street"],
	email: ["email"],
	gender: ["gender"],
	ethnicity: ["ethnicity"],
	disability: ["disability", "status"],
};

let categoriesQuestions = {
	sponsorship: {
		question: {
			type: "radio",
			text: "Do you require sponsorship?",
			options: ["Yes", "No"],
		},
	},
	experience: {
		question: {
			type: "text",
			text: "On average, how many years of experience do you have in your field?",
		},
	},
	relocate: {
		question: {
			type: "radio",
			text: "Are you willing to relocate?",
			options: ["Yes", "No"],
		},
	},
	workAuthorization: {
		question: {
			type: "radio",
			text: "Do you have any work authorization?",
			options: ["Yes", "No"],
		},
	},
	citizen: {
		question: {
			type: "radio",
			text: "Are you a U.S. citizen?",
			options: ["Yes", "No"],
		},
	},
	clearance: {
		question: {
			type: "radio",
			text: "Do you have a security clearance?",
			options: ["Yes", "No"],
		},
	},
	salary: {
		question: {
			type: "text",
			text: "What is your salary expectation?",
		},
	},
	gpa: {
		question: {
			type: "text",
			text: "What is your GPA?",
		},
	},
	degree: {
		question: {
			type: "radio",
			text: "What is the highest level of education you have completed?",
			options: [
				"Other",
				"High school or equivalent",
				"Associate",
				"Bachelor's",
				"Master's",
				"Doctorate",
			],
		},
	},
	phone: {
		question: {
			type: "text",
			text: "What is your phone number?",
		},
	},
	country: {
		question: {
			type: "text",
			text: "In which country do you reside?",
		},
	},
	address: {
		question: {
			type: "text",
			text: "What is your current physical address?",
		},
	},
	email: {
		question: {
			type: "text",
			text: "What is your email?",
		},
	},
	gender: {
		question: {
			type: "radio",
			text: "What is your gender?",
			options: ["Male", "Female", "Other", "Prefere not to answer"],
		},
	},
	ethnicity: {
		question: {
			type: "radio",
			text: "What is your ethnicity?",
			options: [
				"American Indian or Alaska Native",
				"Asian",
				"Black or African American",
				"Hispanic or Latino",
				"Native Hawaiian or Other Pacific Islander",
				"White",
			],
		},
	},
	disability: {
		question: {
			type: "radio",
			text: "Disability status",
			options: [
				"Yes, I have a disability",
				"No, I don't have a disability",
				"I don't wish to answer",
			],
		},
	},
};

const getQuestionsByType = (type) => {
	return Object.fromEntries(
		Object.entries(categoriesQuestions).filter(
			([, value]) => value.question.type === type
		)
	);
};

const textQuestions = getQuestionsByType("text");
const radioQuestions = getQuestionsByType("radio");
categoriesQuestions = { ...radioQuestions, ...textQuestions };

export default () => {
	const [answers, setAnswers] = useState(
		JSON.parse(localStorage.getItem("user-answers")) || {}
	);

	const questions = [];

	const handleChange = (value, category) => {
		const userAnswers = JSON.parse(localStorage.getItem("user-answers"));
		localStorage.setItem(
			"user-answers",
			JSON.stringify({
				...userAnswers,
				[category]: { answer: value, keywords: keywords[category] },
			})
		);
		setAnswers({
			...answers,
			[category]: { answer: value, keywords: keywords[category] },
		});
	};

	for (const category in categoriesQuestions) {
		const { question } = categoriesQuestions[category];
		const text = (
			<Typography sx={{ mb: 1 }} textColor="text.secondary" level="h5">
				{question.text}
			</Typography>
		);

		if (question.type === "text") {
			questions.push(
				<>
					{text}
					<Input
						name={category}
						type="text"
						placeholder="Your answer..."
						onChange={(e) => handleChange(e.target.value, category)}
						value={answers[category]?.answer || ""}
					/>
				</>
			);
		} else {
			questions.push(
				<>
					{text}
					{question.options.map((option, index) => (
						<div key={index}>
							<Radio
								sx={{ mb: 1 }}
								checked={answers[category]?.answer === option}
								onChange={(e) => handleChange(e.target.value, category)}
								value={option}
								label={
									<Typography textColor="text.tertiary" level="body1">
										{option}
									</Typography>
								}
							/>
						</div>
					))}
				</>
			);
		}
	}

	return (
		<>
			<Typography sx={{ mb: 2 }} textColor="text.primary" level="h3">
				Common Questions
			</Typography>
			<Typography sx={{ mb: 2 }} textColor="text.secondary" level="body1">
				All of your answers are saved on your computer. We do not collect any of
				your application-related information.
			</Typography>
			{questions.map((q, index) => (
				<Box key={index} sx={{ mb: 2 }}>
					{q}
				</Box>
			))}
		</>
	);
};
