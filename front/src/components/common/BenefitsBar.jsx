import { Box, Container, Typography } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const BenefitsBar = () => {
  const benefits = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: "Alta Calidad",
      description: "Fabricado con los mejores materiales",
    },
    /* {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Garantía',
      description: '6 meses de garantía'
    }, 
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Envío Gratis',
      description: 'En compras mayores a $ 2500'
    }, */
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: "Soporte 24/7",
      description: "Soporte dedicado",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "rgba(0, 0, 0, 0.03)",
        py: 3,
        mt: 2,
        mb: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              sx={{
                flex: "1",
                minWidth: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {benefit.icon}
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                {benefit.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {benefit.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default BenefitsBar;
