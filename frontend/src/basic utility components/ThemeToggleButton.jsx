/* eslint-disable react/prop-types */
import { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { alpha, useTheme } from "@mui/material/styles";
import { AuthContext } from "../context/AuthContext";

const ThemeToggleButton = () => {
  const { themeDark, themeChange } = useContext(AuthContext);
  const theme = useTheme();
  const label = themeDark ? "Light mode" : "Dark mode";

  return (
    <Tooltip title={label} placement="left" arrow>
      <IconButton
        onClick={themeChange}
        color="inherit"
        aria-label={label}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 1250,
          backgroundColor: alpha(theme.palette.primary.main, 0.14),
          color: theme.palette.primary.main,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
          backdropFilter: "blur(10px)",
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.22),
          },
        }}
      >
        {themeDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggleButton;
