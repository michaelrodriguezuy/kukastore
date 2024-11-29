import { Box, Toolbar, Tooltip } from "@mui/material";
import { Link } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Outlet } from "react-router-dom";
import { alpha } from "@mui/material/styles";

const Footer = () => {
  const customBlack = alpha("#000", 0.8); //color negro especial

  return (
    <>
      <Outlet />
      <Box
        component="footer"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "whitesmoke",
          color: "black",
          padding: "5px",
          width: "100%",
          position: "fixed",
          bottom: "0",
          left: 0,
        }}
      >
        <p>© 2023 KukaStore. Todos los derechos reservados.</p>

        <Toolbar
          sx={{
            gap: "20px",
            display: "flex",
            flexDirection: "row",
            alignContent: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "40px",
              justifyContent: "space-between",
            }}
          >
            <Link
              href="https://api.whatsapp.com/send?phone=59899429817"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "black", textDecoration: "none" }}
            >
              <Tooltip title="Enviame un whatsapp">
                <WhatsAppIcon sx={{ color: "black" }} />
              </Tooltip>
            </Link>
            <Link
              href="https://www.instagram.com/kuka_uy/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "whitesmoke", textDecoration: "none" }}
            >
              <Tooltip title="Contactame por instagram">
                <InstagramIcon sx={{ color: "black" }} />
              </Tooltip>
            </Link>
          </Box>
        </Toolbar>
      </Box>
    </>
  );
};

export default Footer;
