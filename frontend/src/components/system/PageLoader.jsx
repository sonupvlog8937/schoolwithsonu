import { Box, CircularProgress, Typography } from "@mui/material";
import { APP_NAME } from "../../branding";

export default function PageLoader({ message = "Loading…" }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {message}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {APP_NAME}
      </Typography>
    </Box>
  );
}
