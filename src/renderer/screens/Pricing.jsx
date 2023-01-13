import { Star } from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/joy";
import {
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
} from "@mui/material";

const premiumPlanPoints = [
	"Lifetime Access",
	"Linkedin automation",
	"Indeed automation",
	"Ziprecruiter automation",
	"Daily limit - 750 Job Applications",
	"Up to - 5 Resumes / CV's",
	"Day wise analytics",
	"CV Improvement Tips",
	"Single User",
];

export default () => {
	return (
		<Box
			sx={{
				justifyContent: "center",
				flexDirection: "column",
				alignItems: "center",
				display: "flex",
			}}
		>
			<Box
				style={{
					display: "flex",
					width: "100%",
					// backgroundColor: "#f8f9fd",
					borderRadius: "20px",
					margin: "10px",
					padding: "10px",
					justifyContent: "center",
				}}
			>
				<Box
					style={{
						textAlign: "center",
						borderRadius: "20px",
						backgroundColor: "white",
						boxShadow: "0px 2px 4px 2px #efefef, 0px 2px 4px 2px #efefef",
						position: "relative",
						margin: "10px",
						padding: "20px",
					}}
				>
					<Typography fontSize="20px">PREMIUM PLAN</Typography>
					<Typography fontSize="40px">$99</Typography>
					<List>
						{premiumPlanPoints.map((p) => (
							<ListItem>
								<ListItemAvatar>
									<Avatar>
										<Star />
									</Avatar>
								</ListItemAvatar>
								<ListItemButton>
									<ListItemText primary={p} />
								</ListItemButton>
							</ListItem>
						))}
					</List>
					<Button size="lg">PURCHASE PLAN</Button>
				</Box>
			</Box>
		</Box>
	);
};
