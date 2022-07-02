import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import { Link as RouterLink } from "react-router-dom";
import JoyLink from "@mui/joy/Link";

// Icons import
import OutboxRoundedIcon from "@mui/icons-material/OutboxRounded";
import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import AssistantPhotoRoundedIcon from "@mui/icons-material/AssistantPhotoRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";
import LogoutSharpIcon from "@mui/icons-material/LogoutSharp";
import { DashboardRounded } from "@mui/icons-material";

export default function Nav() {
  return (
    <List size="sm" sx={{ "--List-item-radius": "8px" }}>
      <ListItem nested sx={{ p: 0 }}>
        <List
          aria-labelledby="nav-list-browse"
          sx={{
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          <ListItem component={RouterLink} to="/">
            <ListItemButton>
              <ListItemDecorator sx={{ color: "inherit" }}>
                <DashboardRounded fontSize="small" />
              </ListItemDecorator>
              Dashboard
            </ListItemButton>
          </ListItem>
          <ListItem component={RouterLink} to="/profile">
            <ListItemButton>
              <ListItemDecorator sx={{ color: "inherit" }}>
                <AccountCircleSharpIcon fontSize="small" />
              </ListItemDecorator>
              Profile
            </ListItemButton>
          </ListItem>
          <ListItem component={RouterLink} to="/login">
            <ListItemButton>
              <ListItemDecorator sx={{ color: "red" }}>
                <LogoutSharpIcon fontSize="small" />
              </ListItemDecorator>
              Logout
            </ListItemButton>
          </ListItem>
        </List>
      </ListItem>
    </List>
  );
}
