import * as React from "react";
import { useContext, useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import { Box, Stack } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { menuItems } from "../../../router/navigation";
import { logout } from "../../../config/firebase";
import { AuthContext } from "../../../context/AuthContext";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import LocalGroceryStoreOutlinedIcon from "@mui/icons-material/LocalGroceryStoreOutlined";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import SearchIcon from "@mui/icons-material/Search";
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { CartContext } from "../../../context/CartContext";
import { Badge } from "@mui/material";
import { Login } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import logo from "../../../assets/logo/logo.png";
import Cart from "../../../pages/cart/Cart";

const drawerWidth = 200;

const Navbar = () => {
  const rolAdmin = import.meta.env.VITE_ROLADMIN;
  const { user, isLogged } = useContext(AuthContext);
  const { getTotalItems } = useContext(CartContext);
  const [showMenuUser, setShowMenuUser] = useState(null);
  const customBlack = alpha("#000", 0.8);
  const navigate = useNavigate();
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const handleIconClick = (event) => {
    if (!isLogged) {
      navigate("/login");
    } else {
      setShowMenuUser(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setShowMenuUser(null);
  };

  const handleSearchClick = () => {
    setShowSearchBox((prev) => !prev);
    if (showSearchBox) {
      setSearchInput("");
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    if (event.key === 'Enter') {
      navigate(`/shop?search=${searchInput}`);
      setShowSearchBox(false);
      setSearchInput("");
    }
  };

  // Función para manejar clics fuera del buscador
  const handleClickOutside = () => {
    if (showSearchBox) {
      setShowSearchBox(false);
      setSearchInput("");
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  return (
    <>
      <AppBar 
        position="fixed"
        className="navbar-container"
        sx={{ 
          backgroundColor: 'white',
          boxShadow: 'none',        
          height: '60px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          '& .MuiToolbar-root': {
            minHeight: '60px',
            height: '60px',
            padding: 0
          }
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters className="navbar">
            {/* Logo */}
            <Link to="/" style={{ color: "black" }}>
              <img
                src={logo}
                alt="kuka store"
                style={{
                  height: "45px",
                  display: "flex",
                }}
              />
            </Link>

            {/* Botón menú móvil */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                ml: 'auto',
                display: {xs: 'block', sm: 'none' },
                color: 'black'
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Enlaces de navegación desktop */}
            <Box sx={{ 
              flex: 1, 
              display: { xs: 'none', sm: 'flex' }, 
              justifyContent: 'center' 
            }}>
              <Stack 
                direction="row" 
                spacing={4}
                sx={{
                  '& a': {
                    color: 'black',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <Link to="/">Inicio</Link>
                <Link to="/shop">Tienda</Link>
                <Link to="/about">Sobre nosotros</Link>
                <Link to="/contact">Contacto</Link>
              </Stack>
            </Box>

            {/* Iconos de la derecha */}
            <Box
              sx={{
                display: 'flex',
                gap: { xs: '20px', md: '40px' },
                alignItems: 'center'
              }}
            >
              {/* Usuario */}
              <Box>
                <IconButton onClick={handleIconClick}>
                  <Badge badgeContent={0} color="info">
                    <PermIdentityIcon sx={{ color: "black" }} />
                  </Badge>
                </IconButton>
                {/* Menú del usuario */}
                {isLogged && (
                  <Menu
                    anchorEl={showMenuUser}
                    open={Boolean(showMenuUser)}
                    onClose={() => setShowMenuUser(null)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem
                      component={Link}
                      to="/data-user"
                      onClick={handleMenuClose}
                    >
                      <ListItemIcon>
                        <SourceOutlinedIcon sx={{ color: "black" }} />
                      </ListItemIcon>
                      <ListItemText primary="Mis datos" />
                    </MenuItem>

                    <MenuItem
                      component={Link}
                      to="/user-orders"
                      onClick={handleMenuClose}
                    >
                      <ListItemIcon>
                        <ShoppingBagOutlinedIcon sx={{ color: "black" }} />
                      </ListItemIcon>
                      <ListItemText primary="Mis compras" />
                    </MenuItem>

                    {user.rol === rolAdmin && (
                      <MenuItem
                        component={Link}
                        to="/dashboard"
                        onClick={handleMenuClose}
                      >
                        <ListItemIcon>
                          <AdminPanelSettingsOutlinedIcon
                            sx={{ color: "black" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="Panel" />
                      </MenuItem>
                    )}

                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon sx={{ color: "black" }} />
                      </ListItemIcon>
                      <ListItemText primary="Cerrar sesión" />
                    </MenuItem>
                  </Menu>
                )}
              </Box>

              {/* Búsqueda */}
              <Box sx={{ position: "relative" }}>
                <IconButton onClick={handleSearchClick}>
                  <Badge color="info">
                    <SearchIcon sx={{ color: "black" }} />
                  </Badge>
                </IconButton>
                {/* Campo de búsqueda */}
                {showSearchBox && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "140%",
                      right: 0,
                      zIndex: 10,
                      backgroundColor: "white",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "10px",
                      borderRadius: "4px",
                      width: "390px"
                    }}
                  >
                    <TextField
                      placeholder="Busca por título, descripción o categoría"
                      variant="outlined"
                      size="small"
                      autoFocus
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      onKeyDown={handleSearchSubmit}
                      onBlur={handleClickOutside}
                      sx={{ width: "100%" }}
                      InputProps={{
                        endAdornment: (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.5rem',
                              opacity: 0.7,
                              textAlign: 'right',                              
                              marginLeft: '4px'
                            }}
                          >
                            Presiona Enter
                          </Typography>
                        ),
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Carrito */}
              <IconButton onClick={handleCartClick}>
                <Badge badgeContent={getTotalItems()} color="info">
                  <LocalGroceryStoreOutlinedIcon sx={{ color: "black" }} />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {/* Drawer para móvil */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móviles
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              backgroundColor: 'white'
            },
          }}
        >
          <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 2 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/" sx={{ textAlign: 'center' }}>
                  <ListItemText primary="Inicio" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/shop" sx={{ textAlign: 'center' }}>
                  <ListItemText primary="Tienda" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/about" sx={{ textAlign: 'center' }}>
                  <ListItemText primary="Sobre nosotros" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/contact" sx={{ textAlign: 'center' }}>
                  <ListItemText primary="Contacto" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </AppBar>

      {/* Drawer del carrito */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
};

export default Navbar;
