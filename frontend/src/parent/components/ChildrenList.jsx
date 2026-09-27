import { Avatar, Box, Card, CardContent, Chip, Grid, Paper, Skeleton, Typography, Stack } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../environment";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import SchoolIcon from "@mui/icons-material/School";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

export default function ChildrenList() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${baseUrl}/parent/details`)
      .then((r) => {
        const parent = r.data.data;
        if (parent?.children) {
          setChildren(parent.children);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ px: { xs: 1.5, md: 3 }, py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>My Children</Typography>
        <Grid container spacing={2}>
          {[1, 2].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="70%" height={24} />
                      <Skeleton width="40%" height={18} />
                    </Box>
                  </Box>
                  <Skeleton variant="rounded" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (!children || children.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Box sx={{ textAlign: "center" }}>
          <ChildCareIcon sx={{ fontSize: 64, color: "#CBD5E1", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#94A3B8", mb: 1 }}>No Children Found</Typography>
          <Typography variant="body2" color="text.secondary">No children are linked to your account yet.</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 }, background: "#F9FAFB", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1F2937", mb: 0.5 }}>My Children</Typography>
          <Typography variant="body2" color="text.secondary">View information about your children</Typography>
        </Box>

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {children.map((child) => {
            const initials = child.name ? child.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "ST";
            
            return (
              <Grid item xs={12} sm={6} md={4} key={child._id}>
                <Card elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 3, transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transform: "translateY(-2px)" } }}>
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56, fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#3B82F6,#8B5CF6)" }}>
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {child.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5}>
                          <Chip label={child.roll_number || "N/A"} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, background: "#DBEAFE", color: "#1E40AF" }} />
                          {child.status && (
                            <Chip 
                              label={child.status} 
                              size="small" 
                              sx={{ 
                                height: 20, 
                                fontSize: 10, 
                                fontWeight: 700, 
                                background: child.status === "Active" ? "#D1FAE5" : "#FEE2E2", 
                                color: child.status === "Active" ? "#065F46" : "#991B1B" 
                              }} 
                            />
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    {/* Info */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {child.student_class && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <SchoolIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                          <Typography variant="body2" sx={{ fontSize: 13, color: "#6B7280" }}>
                            Class: <strong>{child.student_class.class_name || "N/A"}</strong>
                          </Typography>
                        </Box>
                      )}
                      {child.email && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                          <Typography variant="body2" sx={{ fontSize: 13, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {child.email}
                          </Typography>
                        </Box>
                      )}
                      {child.phone && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                          <Typography variant="body2" sx={{ fontSize: 13, color: "#6B7280" }}>
                            {child.phone}
                          </Typography>
                        </Box>
                      )}
                      {child.admission_number && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BadgeIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                          <Typography variant="body2" sx={{ fontSize: 13, color: "#6B7280" }}>
                            Admission: <strong>{child.admission_number}</strong>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
