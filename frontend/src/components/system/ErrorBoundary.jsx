import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { APP_NAME } from "../../branding";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary:", error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            px: 2,
          }}
        >
          <Container maxWidth="sm">
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 56, color: "error.main", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {APP_NAME} hit an unexpected error. You can try reloading the page. If this keeps happening,
                contact your administrator.
              </Typography>
              <Button variant="contained" onClick={this.handleReload} sx={{ textTransform: "none", fontWeight: 700 }}>
                Reload page
              </Button>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
