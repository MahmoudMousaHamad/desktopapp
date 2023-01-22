import { Star } from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/joy";
import {
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import { useSelector } from "react-redux";

const premiumPlanPoints = [
	"Lifetime Access",
	"Linkedin automation",
	"Indeed automation",
	"Daily limit - 750 Job Applications",
	"Up to - 5 Resumes / CV's",
	"Day wise analytics",
	"CV Improvement Tips",
	"Single User",
];

export default () => {
	const auth = useSelector((s) => s.auth);
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
					<List
						sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
						dense
					>
						{premiumPlanPoints.map((p) => (
							<ListItem key={p}>
								<ListItemAvatar>
									<Avatar>
										<Star />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary={p} />
							</ListItem>
						))}
					</List>
					<Button
						size="lg"
						onClick={() =>
							window.electron.ipcRenderer.send("open-stripe", {
								email: auth.user.email,
								userId: auth.user.id,
							})
						}
					>
						PURCHASE PLAN
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
