import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./state/store.js";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/system/ErrorBoundary.jsx";
import { setupAxios } from "./api/setupAxios.js";

setupAxios();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </Provider>
  </StrictMode>
);
