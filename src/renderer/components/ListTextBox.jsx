/* eslint-disable react/prop-types */
import RemoveCircleOutlineSharpIcon from "@mui/icons-material/RemoveCircleOutlineSharp";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import { Box, Input, Sheet, Typography } from "@mui/joy";
import IconButton from "@mui/joy/IconButton";

import { useEffect, useState } from "react";

const ListTextBox = ({ title, name, placeholder }) => {
	const [currentValue, setCurrentValue] = useState();

	const [values, setValues] = useState(
		JSON.parse(localStorage.getItem(name)) || []
	);

	useEffect(() => {
		localStorage.setItem(name, JSON.stringify(values));
	}, [name, values]);

	const addValue = () => {
		if (currentValue) {
			setValues([currentValue.trim(), ...values]);
			setCurrentValue("");
		}
	};

	return (
		<Sheet
			sx={{ p: 5, borderRadius: 15, mb: 5 }}
			variant="outlined"
			color="primary"
		>
			<>
				{title && (
					<Typography sx={{ mb: 2 }} textColor="text.primary" level="h4">
						{title}
					</Typography>
				)}
				<Box sx={{ mb: 1 }}>
					<Input
						onChange={(e) => setCurrentValue(e.target.value)}
						onKeyDown={({ key }) => {
							if (key === "Enter") {
								addValue();
							}
						}}
						value={currentValue}
						placeholder={placeholder}
						endDecorator={
							<IconButton
								variant="soft"
								size="sm"
								color="primary"
								sx={{ borderRadius: "50%" }}
								onClick={addValue}
							>
								<AddCircleOutlineSharpIcon />
							</IconButton>
						}
					/>
				</Box>
				<>
					{values.map((v, i) => (
						<Box sx={{ mb: 1, ml: 2 }} key={v}>
							<Input
								value={values[i]}
								onChange={(e) => {
									values[i] = e.target.value;
									setValues([...values]);
								}}
								endDecorator={
									<IconButton
										variant="soft"
										size="sm"
										color="danger"
										sx={{ borderRadius: "50%" }}
										onClick={() => {
											values.splice(i, 1);
											setValues([...values]);
										}}
									>
										<RemoveCircleOutlineSharpIcon />
									</IconButton>
								}
							/>
						</Box>
					))}
				</>
			</>
		</Sheet>
	);
};

export default ListTextBox;
