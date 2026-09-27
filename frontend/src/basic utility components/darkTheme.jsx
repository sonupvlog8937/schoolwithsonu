import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#60a5fa",
      light: "#93c5fd",
      dark: "#3b82f6",
      contrastText: "#0b1220",
    },
    secondary: {
      main: "#c4b5fd",
      light: "#ddd6fe",
      dark: "#8b5cf6",
      contrastText: "#0b1220",
    },
    background: {
      default: "#0b0f14",
      paper: "#121a24",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
      disabled: "#64748b",
    },
    divider: "rgba(148, 163, 184, 0.14)",
    success: { main: "#34d399" },
    warning: { main: "#fbbf24" },
    error: { main: "#f87171" },
    info: { main: "#38bdf8" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Plus Jakarta Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 800, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#334155 #0f172a",
          "&::-webkit-scrollbar": { width: 10, height: 10 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#334155",
            borderRadius: 8,
            border: "2px solid #0f172a",
          },
          "&::-webkit-scrollbar-track": { backgroundColor: "#0f172a" },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default darkTheme;
