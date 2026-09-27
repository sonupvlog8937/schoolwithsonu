import React from "react";
import { Paper } from "@mui/material";

export default function SectionCard({ children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

