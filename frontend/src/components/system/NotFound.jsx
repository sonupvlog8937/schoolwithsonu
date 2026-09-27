import { Box, Button, Container, Typography } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Link as RouterLink } from "react-router-dom";
import { APP_NAME } from "../../branding";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center" }}>
          <SearchOffIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em", mb: 1 }}>
            Page not found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The page you are looking for does not exist or you do not have access.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            startIcon={<HomeOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Back to {APP_NAME}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
