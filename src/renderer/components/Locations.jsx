/* eslint-disable react/no-array-index-key */
import { Box, Checkbox, List, ListItem, Sheet, Typography } from "@mui/joy";
import React, { useEffect, useState } from "react";

import locationOptions from "../locations";
import ListTextBox from "./ListTextBox";

const options = locationOptions.locations.map((l) => ({ label: l, value: l }));

export default () => {
	const [locations, setLocations] = useState(
		JSON.parse(localStorage.getItem("default-locations")) || []
	);
	const [allSelected, setAllSelected] = useState(
		locations.length === options.length
	);

	useEffect(() => {
		localStorage.setItem("default-locations", JSON.stringify(locations));
		localStorage.setItem(
			"locations",
			JSON.stringify([
				...new Set([
					...JSON.parse(localStorage.getItem("user-added-locations")),
					...locations,
				]),
			])
		);
		setAllSelected(locations.length === options.length);
	}, [locations]);

	return (
		<>
			<Sheet
				sx={{ p: 5, borderRadius: 15, mb: 5 }}
				color="primary"
				variant="outlined"
			>
				<Typography sx={{ mb: 2 }} textColor="text.primary" level="h4">
					Locations
				</Typography>
				<Box sx={{ mb: 1 }}>
					<Box role="group" aria-labelledby="topping">
						<List
							row
							sx={{
								"--List-gap": "0px",
								"--List-item-radius": "20px",
								flexWrap: "wrap",
								gap: 1,
							}}
						>
							<ListItem>
								<Checkbox
									label="Select/deselect all"
									checked={allSelected}
									variant="soft"
									disableIcon
									overlay
									onChange={(e) => {
										if (e.target.checked) {
											setLocations([...locationOptions.locations]);
										} else {
											setLocations([]);
										}
									}}
								/>
							</ListItem>
							{options
								.map((o) => o.value)
								.map((location, index) => (
									<ListItem key={index}>
										<Checkbox
											checked={locations.includes(location)}
											label={location}
											variant="soft"
											disableIcon
											overlay
											onChange={(e) => {
												if (e.target.checked) {
													setLocations([...locations, location]);
												} else {
													locations.splice(locations.indexOf(location), 1);
													setLocations([...locations]);
												}
											}}
										/>
									</ListItem>
								))}
						</List>
					</Box>
				</Box>
				<ListTextBox
					placeholder="Type other locations here"
					name="user-added-locations"
				/>
			</Sheet>
		</>
	);
};
