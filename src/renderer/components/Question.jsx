/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */

import { Box, Checkbox, Input, Radio, Typography } from "@mui/joy";
import { FormControl, InputLabel, Select } from "@mui/material";

const questionTypeInput = {
	text: {
		element: (handleChange, value = "", onKeyDown) => (
			<Input
				onChange={(e) => handleChange(e.target.value)}
				placeholder="Your answer..."
				onKeyDown={onKeyDown}
				type="text"
				value={value}
			/>
		),
	},
	textarea: {
		element: (handleChange, value = "") => (
			<Input
				onChange={(e) => handleChange(e.target.value)}
				placeholder="Your answer..."
				value={value}
			/>
		),
	},
	number: {
		element: (handleChange, value = "", onKeyDown) => (
			<Input
				onChange={(e) => handleChange(e.target.value)}
				placeholder="Your answer..."
				onKeyDown={onKeyDown}
				type="number"
				value={value}
			/>
		),
	},
	date: {
		element: (handleChange, value = "") => (
			<Input
				onChange={(e) => handleChange(e.target.value)}
				placeholder="yyyy-MM-dd"
				type="date"
				value={value}
			/>
		),
	},
	radio: {
		element: (options, handleChange, value) => (
			<div>
				{options.map((option, index) => (
					<Box sx={{ mb: 1 }} key={index}>
						<Radio
							onChange={(e) => handleChange(Number(e.target.value))}
							checked={index === value}
							value={index}
							label={option}
							sx={{ fontSize: 20, p: 1 }}
						/>
					</Box>
				))}
			</div>
		),
	},
	select: {
		element: (options, handleChange, value = "") => {
			return (
				<FormControl fullWidth>
					<InputLabel id="select-label">Select an option</InputLabel>
					<Select
						labelId="select-label"
						fullWidth
						onChange={(e) => handleChange(Number(e.target.value))}
						placeholder="Select an option"
						label="Select an option"
						value={value}
						displayEmpty
						native
					>
						{options.map((option, index) => (
							<option key={index} value={index}>
								{option}
							</option>
						))}
					</Select>
				</FormControl>
			);
		},
	},
	checkbox: {
		element: (options, handleChange, checked = []) => (
			<div>
				{options.map((option, index) => (
					<Box sx={{ mb: 1 }} key={index}>
						<Checkbox
							checked={checked.includes(index)}
							onChange={() => {
								if (checked.includes(index)) {
									checked.splice(checked.indexOf(index));
								} else {
									checked.push(index);
								}
								// checked[index] = !checked[index];
								handleChange([...checked]);
							}}
							label={option}
						/>
					</Box>
				))}
			</div>
		),
	},
};

function constructInput(
	type,
	options,
	handleChange,
	answer,
	onKeyDown,
	...args
) {
	if (options?.length === 0)
		throw Error(`Options array is empty. Question info: ${type} ${options}`);
	if (options) {
		return questionTypeInput[type].element(
			options,
			handleChange,
			answer,
			...args
		);
	}
	return questionTypeInput[type].element(
		handleChange,
		answer,
		onKeyDown,
		...args
	);
}

export default ({ question, handleChange, answer, onKeyDown, ...params }) => {
	const { text, type, options } = question;

	if (!type) throw Error("Question type is not defined");

	const input = constructInput(type, options, handleChange, answer, onKeyDown);

	return (
		<Box
			sx={{
				p: 2,
				mb: 1,
			}}
		>
			<Typography level="h3">{text}</Typography>
			<Box sx={{ mt: 5 }}>{input}</Box>
		</Box>
	);
};
