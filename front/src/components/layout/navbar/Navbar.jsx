import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";

import { Link, useNavigate, Outlet } from "react-router-dom";
import "./Navbar.css";
import { useContext, useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { menuItems } from "../../../router/navigation";
import { logout } from "../../../fireBaseConfig";
import { AuthContext } from "../../../context/AuthContext";
// import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import { CartContext } from "../../../context/CartContext";
import { Badge } from "@mui/material";
import { Login } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

//import Img from "../../../assets/logo/football-sin-fondo.png";
import logo from "../../../assets/logo/india6.webp";

const drawerWidth = 200;

function Navbar(props) {
  const rolAdmin = import.meta.env.VITE_ROLADMIN;
  const { user, isLogged } = useContext(AuthContext);

  const { getTotalItems } = useContext(CartContext);
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const customBlack = alpha("#000", 0.8); //color negro especial

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />

      <List>
        {menuItems.map(({ id, path, title, Icon }) => {
          return (
            <Link key={id} to={path}>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <Icon sx={{ color: "whitesmoke" }} />
                  </ListItemIcon>
                  <ListItemText primary={title} sx={{ color: "whitesmoke" }} />
                </ListItemButton>
              </ListItem>
            </Link>
          );
        })}

        {isLogged && (
          <>
            <Link to="/data-user">
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <LocalGroceryStoreIcon sx={{ color: "whitesmoke" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={"Mis datos"}
                    sx={{ color: "whitesmoke" }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>

            <Link to="/user-orders">
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <LocalGroceryStoreIcon sx={{ color: "whitesmoke" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={"Mis compras"}
                    sx={{ color: "whitesmoke" }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
            {user.rol === rolAdmin && (
              <Link to="/dashboard">
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <DashboardIcon sx={{ color: "whitesmoke" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={"Dashboard"}
                      sx={{ color: "whitesmoke" }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            )}

            <ListItem disablePadding>
              <ListItemButton component={Link} to="/logout">
                <ListItemIcon>
                  <LogoutIcon sx={{ color: "whitesmoke" }} />
                </ListItemIcon>
                <ListItemText
                  primary={"Cerrar sesion"}
                  sx={{ color: "whitesmoke" }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {/* si no hay logueados muestro esto tambien */}
        {!isLogged && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login">
              <ListItemIcon>
                <Login sx={{ color: "whitesmoke" }} />
              </ListItemIcon>
              <ListItemText
                primary={"Iniciar sesion"}
                sx={{ color: "whitesmoke" }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          backgroundColor: customBlack,
        }}
      >
        <Toolbar
          sx={{
            gap: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link to="/" style={{ color: "whitesmoke" }}>
            {/* logo */}
            <img
              src={logo}
              alt="India Cueros"
              style={{
                height: "57px",
                display: "flex",
                //  filter: " invert(0)",
              }}
            />
          </Link>

          <Box
            sx={{
              gap: "40px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link key="cart" to="/cart">
              <IconButton>
                <Badge badgeContent={getTotalItems()} color="info">
                  <LocalGroceryStoreIcon sx={{ color: "whitesmoke" }} />
                </Badge>
              </IconButton>
            </Link>

            <IconButton
              // color="secondary.primary"
              sx={{ color: "whitesmoke" }}
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon sx={{ color: "whitesmoke" }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" aria-label="mailbox folders">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          anchor={"right"}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: customBlack,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          width: "100%",
          minHeight: "100vh",
          px: 2,
        }}
      >
        <Toolbar />

        <Outlet />
      </Box>
    </Box>
  );
}

export default Navbar;
