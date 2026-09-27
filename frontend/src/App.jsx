/* eslint-disable react/no-children-prop khl*/
import("./css/button.css");
import("./css/text.css");

import "./App.css";
import { BrowserRouter } from "react-router-dom";

import { AuthContext, AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import darkTheme from "./basic utility components/darkTheme";
import lightTheme from "./basic utility components/lightTheme";
// import ThemeToggleButton from "./basic utility components/ThemeToggleButton";
import ScrollToTop from "./components/system/ScrollToTop";
import { useContext } from "react";
import AppRoutes from "./AppRoutes";

function App() {
  const { themeDark } = useContext(AuthContext);

  return (
    <ThemeProvider theme={themeDark ? darkTheme : lightTheme}>
      <CssBaseline enableColorScheme />
      {/* <ThemeToggleButton /> */}
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
