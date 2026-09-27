import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

export default function ViewActiveTimetable() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: "#f3f5f9", minHeight: "calc(100vh - 64px)" }}>
      <Card sx={{ maxWidth: 1200, mx: "auto" }}>
        <CardContent>
          <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 2 }}>
            View Active Timetable
          </Typography>
          <Typography color="text.secondary">
            Active timetable summary and schedule details will appear here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
