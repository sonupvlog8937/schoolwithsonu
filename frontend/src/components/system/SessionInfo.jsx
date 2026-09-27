import { useState, useEffect } from "react";
import { Chip, Tooltip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getSessionInfo } from "../../utils/authUtils";

/**
 * Optional component to display session expiry info
 * Can be added to user profile or dashboard
 */
export default function SessionInfo() {
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    const info = getSessionInfo();
    setSessionInfo(info);

    // Update every hour
    const interval = setInterval(() => {
      const updatedInfo = getSessionInfo();
      setSessionInfo(updatedInfo);
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!sessionInfo || !sessionInfo.isValid) {
    return null;
  }

  const { remainingDays, expiryTime } = sessionInfo;

  const getColor = () => {
    if (remainingDays <= 3) return "error";
    if (remainingDays <= 7) return "warning";
    return "success";
  };

  return (
    <Tooltip
      title={`Session expires on ${expiryTime.toLocaleDateString()} at ${expiryTime.toLocaleTimeString()}`}
      arrow
    >
      <Chip
        icon={<AccessTimeIcon fontSize="small" />}
        label={`Session: ${remainingDays}d left`}
        color={getColor()}
        size="small"
        variant="outlined"
        sx={{ fontSize: "0.75rem" }}
      />
    </Tooltip>
  );
}
