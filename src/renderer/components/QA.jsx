/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-no-bind */
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Typography } from "@mui/joy";
import { useEffect, useState } from "react";

import { questionAnswered } from "../actions/qa";
import Question from "./Question";

export default function QA() {
	const { questions } = useSelector((state) => state.qa);
	const [answers, setAnswers] = useState(
		Array(questions?.length).fill(undefined)
	);
	const [errors, setErrors] = useState();
	const dispatch = useDispatch();

	useEffect(() => {
		setAnswers(Array(questions?.length).fill(undefined));
		setErrors();
	}, [questions]);

	function handleSubmit() {
		const err = answers
			? answers?.map((answer) => !(answer || answer === 0))
			: Array(questions?.length).fill(true);
		if (err?.every((error) => !error)) {
			setErrors(err);
			console.log("Sending answers to main...", answers);
			window.electron.ipcRenderer.send("answers", {
				questions,
				answers,
			});
			setAnswers(null);
			dispatch(questionAnswered());
		}
	}

	function handleChange(value, index) {
		answers[index] = value;
		setAnswers([...answers]);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			handleSubmit();
		}
	}

	return (
		<Box sx={{ margin: "auto", width: "fit-content" }}>
			{questions ? (
				<>
					{questions?.map((question, index) => (
						<Box key={index}>
							<Box>
								<Question
									handleChange={(value) => handleChange(value, index)}
									answer={answers?.[index]}
									onKeyDown={handleKeyDown}
									question={question}
								/>
							</Box>
							{errors?.[index] && (
								<Typography textColor="red" level="body3">
									Please answer the question
								</Typography>
							)}
						</Box>
					))}
					<Box sx={{ paddingRight: 5, marginTop: 5, mb: 5, float: "right" }}>
						<Button
							size="lg"
							variant="solid"
							color="primary"
							onClick={handleSubmit}
							sx={{ borderRadius: "5px" }}
						>
							Submit
						</Button>
					</Box>
				</>
			) : (
				<Typography textColor="text.tertiary" level="body2">
					If a question needs your attention, it will show up here.
				</Typography>
			)}
		</Box>
	);
}
