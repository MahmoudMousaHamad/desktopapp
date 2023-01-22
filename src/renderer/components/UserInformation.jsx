/* eslint-disable react/no-array-index-key */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { Box, Input, Radio, Typography } from "@mui/joy";
import { MenuItem, Select } from "@mui/material";
import { useState } from "react";

import countries from "../constants/countries";

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
			text: "Do you require sponsorship?",
			options: ["Yes", "No"],
			defaultAnswer: "Yes",
			type: "radio",
		},
	},
	experience: {
		question: {
			type: "number",
			text: "On average, how many years of experience do you have in your field?",
		},
	},
	relocate: {
		question: {
			text: "Are you willing to relocate?",
			type: "radio",
			options: [
				"Yes, I can make the commute",
				"Yes, I am planning to relocate",
				"Yes, but I need relocation assitance",
				"No",
			],
			defaultAnswer: "No",
		},
	},
	workAuthorization: {
		question: {
			text: "Do you have any work authorization?",
			options: ["Yes", "No"],
			defaultAnswer: "Yes",
			type: "radio",
		},
	},
	citizen: {
		question: {
			text: "Are you a U.S. citizen?",
			options: ["Yes", "No"],
			type: "radio",
		},
	},
	clearance: {
		question: {
			text: "Do you have a security clearance?",
			options: ["Yes", "No"],
			defaultAnswer: "No",
			type: "radio",
		},
	},
	salary: {
		question: {
			text: "What is your salary expectation?",
			type: "number",
		},
	},
	gpa: {
		question: {
			text: "GPA",
			type: "number",
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
			defaultAnswer: "Bachelor's",
		},
	},
	phone: {
		question: {
			type: "tel",
			text: "What is your phone number?",
		},
	},
	country: {
		question: {
			text: "Country",
			defaultAnswer: "United States",
			options: countries,
			type: "select",
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
			defaultAnswer: localStorage.user
				? JSON.parse(localStorage.user).email
				: "",
			text: "What is your email?",
			type: "text",
		},
	},
	gender: {
		question: {
			options: ["Male", "Female", "Prefer not to answer"],
			defaultAnswer: "Prefer not to answer",
			text: "What is your gender?",
			type: "radio",
		},
	},
	ethnicity: {
		question: {
			type: "radio",
			text: "What is your ethnicity?",
			options: [
				"Native Hawaiian or Other Pacific Islander",
				"American Indian or Alaska Native",
				"Black or African American",
				"Hispanic or Latino",
				"White",
				"Asian",
			],
		},
	},
	disability: {
		question: {
			defaultAnswer: "I don't wish to answer",
			text: "Disability status",
			options: [
				"Yes, I have a disability",
				"No, I don't have a disability",
				"I don't wish to answer",
			],
			type: "radio",
		},
	},
};

categoriesQuestions = Object.fromEntries(
	Object.entries(categoriesQuestions).sort(([, a]) => {
		const { type } = a.question;
		if (type === "text" || type === "tel" || type === "number") return -1;
		if (type === "radio") return 1;
		return 0;
	})
);

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
				[category]: {
					answer: value,
					keywords: keywords[category],
					type: categoriesQuestions[category].question.type,
				},
			})
		);
		setAnswers({
			...answers,
			[category]: {
				answer: value,
				keywords: keywords[category],
				type: categoriesQuestions[category].question.type,
			},
		});
	};

	for (const category in categoriesQuestions) {
		const { question } = categoriesQuestions[category];
		const { type } = question;
		const text = (
			<Typography
				sx={{ mb: 1 }}
				textColor="text.primary"
				level="body1"
				fontWeight={500}
			>
				{question.text}
			</Typography>
		);

		if (question.defaultAnswer && !answers[category]?.answer)
			handleChange(question.defaultAnswer, category);

		if (["text", "number", "tel", "email"].includes(type)) {
			questions.push(
				<>
					{text}
					<Input
						name={category}
						type={question.type}
						placeholder="Your answer..."
						onChange={(e) => handleChange(e.target.value, category)}
						value={answers[category]?.answer || ""}
					/>
				</>
			);
		} else if (type === "select") {
			questions.push(
				<>
					{text}
					<Select
						onChange={(e) => handleChange(e.target.value, category)}
						value={answers[category]?.answer}
					>
						{question.options.map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
						))}
					</Select>
				</>
			);
		} else if (type === "radio") {
			questions.push(
				<>
					{text}
					{question.options.map((option) => (
						<div key={option}>
							<Radio
								checked={answers[category]?.answer === option}
								onChange={(e) => handleChange(e.target.value, category)}
								value={option}
								label={
									<Typography textColor="text.secondary" level="body1">
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
			{questions.map((q, index) => (
				<Box key={index}>{q}</Box>
			))}
		</>
	);
};
