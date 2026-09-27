import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7c3aed",
      light: "#a78bfa",
      dark: "#5b21b6",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f6fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      disabled: "#94a3b8",
    },
    divider: "rgba(15, 23, 42, 0.08)",
    success: { main: "#059669" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    info: { main: "#0284c7" },
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
          scrollbarColor: "#cbd5e1 #f1f5f9",
          "&::-webkit-scrollbar": { width: 10, height: 10 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 8,
            border: "2px solid #f1f5f9",
          },
          "&::-webkit-scrollbar-track": { backgroundColor: "#f1f5f9" },
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

export default lightTheme;
