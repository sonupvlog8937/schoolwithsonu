import React from "react";
import { Box, Skeleton } from "@mui/material";

export default function LoadingBlock({ rows = 6 }) {
  return (
    <Box>
      <Skeleton height={36} width="35%" />
      <Skeleton height={18} width="55%" sx={{ mb: 1.5 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={42} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}

