/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// Icons import
import LogoutSharpIcon from "@mui/icons-material/LogoutSharp";
import {
	DashboardRounded,
	InsertDriveFileRounded,
	LayersRounded,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";

import { logout } from "../actions/auth";
import Socket from "../Socket";

export default function Nav() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const navItems = [
		{ name: "Dashboard", to: "/", icon: DashboardRounded },
		{ name: "Edit Resume", to: "/resume", icon: InsertDriveFileRounded },
		{ name: "Applied Jobs", to: "/jobs", icon: LayersRounded },
		{
			name: "Logout",
			to: null,
			icon: LogoutSharpIcon,
			onClick: () => {
				Socket.disconnect();
				dispatch(logout());
				navigate("/login");
			},
		},
	];

	return (
		<List size="sm" sx={{ "--List-item-radius": "8px" }}>
			<ListItem nested sx={{ p: 0 }}>
				<List
					aria-labelledby="nav-list-browse"
					sx={{
						"& .JoyListItemButton-root": { p: "8px" },
						a: { textDecoration: "none" },
					}}
				>
					{navItems.map((item, index) => (
						<ListItem
							key={index}
							{...(item.to
								? { component: RouterLink, to: item.to }
								: { onClick: item.onClick })}
						>
							<ListItemButton sx={{ fontSize: "18px" }}>
								<ListItemDecorator sx={{ color: "inherit" }}>
									{item.icon && <item.icon fontSize="medium" color="primary" />}
								</ListItemDecorator>
								{item.name}
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</ListItem>
		</List>
	);
}
