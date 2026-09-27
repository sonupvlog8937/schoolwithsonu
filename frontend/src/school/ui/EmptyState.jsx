import React from "react";
import { Box, Button, Typography } from "@mui/material";

export default function EmptyState({ title = "No data", subtitle, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          variant="outlined"
          sx={{ mt: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 800 }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Box>
  );
}

