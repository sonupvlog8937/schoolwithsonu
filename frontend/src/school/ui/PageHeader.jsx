import React from "react";
import { Box, Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) {
  return (
    <Stack spacing={0.75} sx={{ mb: 2 }}>
      {breadcrumbs?.length ? (
        <Breadcrumbs sx={{ color: "text.secondary" }}>
          {breadcrumbs.map((b, idx) =>
            b?.to ? (
              <Link
                key={`${b.label}-${idx}`}
                component={RouterLink}
                to={b.to}
                underline="hover"
                color="inherit"
                sx={{ fontWeight: 700, fontSize: "0.85rem" }}
              >
                {b.label}
              </Link>
            ) : (
              <Typography
                key={`${b.label}-${idx}`}
                color="text.secondary"
                sx={{ fontWeight: 700, fontSize: "0.85rem" }}
              >
                {b.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ minWidth: 0, flex: "1 1 240px" }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {actions ? (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
            {actions}
          </Box>
        ) : null}
      </Box>
    </Stack>
  );
}

