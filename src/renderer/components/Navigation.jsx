/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-array-index-key */
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import { Link as RouterLink, useNavigate } from "react-router-dom";

// Icons import
import AccountCircleSharpIcon from "@mui/icons-material/AccountCircleSharp";
import LogoutSharpIcon from "@mui/icons-material/LogoutSharp";
import { DashboardRounded, LoginSharp } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../actions/auth";

export default function Nav() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navItems = isLoggedIn
    ? [
        { name: "Dashboard", to: "/", icon: DashboardRounded },
        { name: "Profile", to: "/profile", icon: AccountCircleSharpIcon },
        {
          name: "Logout",
          to: null,
          icon: LogoutSharpIcon,
          onClick: () => {
            navigate("/login");
            dispatch(logout());
          },
        },
      ]
    : [
        { name: "Login", to: "/login", icon: LoginSharp },
        { name: "Register", to: "/register", icon: null },
      ];

  return (
    <List size="sm" sx={{ "--List-item-radius": "8px" }}>
      <ListItem nested sx={{ p: 0 }}>
        <List
          aria-labelledby="nav-list-browse"
          sx={{
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {navItems.map((item, index) => (
            <ListItem
              key={index}
              {...(item.to
                ? { component: RouterLink, to: item.to }
                : { onClick: item.onClick })}
            >
              <ListItemButton>
                <ListItemDecorator sx={{ color: "inherit" }}>
                  {item.icon && <item.icon fontSize="small" />}
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
