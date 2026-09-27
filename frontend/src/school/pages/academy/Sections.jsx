import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, Card, CardContent, CircularProgress, Grid, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Chip, Fade } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { createSection, deleteSection, fetchSections, saveSectionPositions, updateSection } from "../../../state/sectionSlice";

// A small rotating accent palette so rows don't all look identical — keeps
// the table lively without any single color dominating the page.
const ACCENTS = ["#6366f1", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

export default function Sections() {
	const dispatch = useDispatch();
	const { records, loading, error } = useSelector((state) => state.sections);
	const [form, setForm] = useState({ name: "", position: 0 });
	const [editing, setEditing] = useState(null);
	const [showInactive, setShowInactive] = useState(false);

	useEffect(() => {
		dispatch(fetchSections());
	}, [dispatch]);

	const submit = (event) => {
		event.preventDefault();
		if (!form.name.trim()) return;
		if (editing) {
			dispatch(updateSection({ id: editing, updates: form }));
		} else {
			dispatch(createSection(form));
		}
		setForm({ name: "", position: 0 });
		setEditing(null);
	};

	const edit = (row) => {
		setEditing(row._id);
		setForm({ name: row.name, position: row.position });
	};

	const handleSavePositions = () => {
		const positions = records.map((row) => ({ id: row._id, position: row.position }));
		dispatch(saveSectionPositions(positions));
	};

	const filteredRecords = showInactive ? records : records.filter((row) => row.active);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: "linear-gradient(160deg,#f5f7ff 0%,#f8fafc 45%,#f0fdfa 100%)",
				p: { xs: 2, md: 3 },
			}}
		>
			<style>{`
				@keyframes fadeSlideUp {
					from { opacity: 0; transform: translateY(8px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes popIn {
					from { opacity: 0; transform: scale(0.96); }
					to { opacity: 1; transform: scale(1); }
				}
			`}</style>

			<Grid container spacing={2.5} sx={{ maxWidth: 1280, mx: "auto" }}>
				<Grid item xs={12} md={3}>
					<Card
						sx={{
							borderRadius: 3,
							boxShadow: "0 4px 20px rgba(99,102,241,0.08)",
							border: "1px solid #eef0fb",
							animation: "popIn 0.35s ease",
							transition: "box-shadow 0.25s ease, transform 0.25s ease",
							"&:hover": { boxShadow: "0 8px 28px rgba(99,102,241,0.14)" },
						}}
					>
						<CardContent sx={{ p: 2.5 }}>
							<Typography
								sx={{
									background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									fontWeight: 800,
									fontSize: 13,
									letterSpacing: 0.3,
									mb: 2.5,
								}}
							>
								Section
							</Typography>
							<Box component="form" onSubmit={submit}>
								<TextField
									required
									fullWidth
									size="small"
									label="Section"
									value={form.name}
									onChange={(event) => setForm({ ...form, name: event.target.value })}
									sx={{
										mb: 2.5,
										"& .MuiInputBase-input": { fontSize: 12.5 },
										"& .MuiInputLabel-root": { fontSize: 12.5 },
										"& .MuiOutlinedInput-root": {
											borderRadius: 2,
											transition: "box-shadow 0.2s ease",
											"&.Mui-focused": { boxShadow: "0 0 0 3px rgba(99,102,241,0.15)" },
										},
									}}
								/>
								<TextField
									fullWidth
									size="small"
									type="number"
									label="Position (sort order)"
									value={form.position}
									onChange={(event) => setForm({ ...form, position: event.target.value })}
									sx={{
										mb: 4,
										"& .MuiInputBase-input": { fontSize: 12.5 },
										"& .MuiInputLabel-root": { fontSize: 12.5 },
										"& .MuiOutlinedInput-root": {
											borderRadius: 2,
											transition: "box-shadow 0.2s ease",
											"&.Mui-focused": { boxShadow: "0 0 0 3px rgba(20,184,166,0.15)" },
										},
									}}
								/>
								<Box sx={{ borderTop: "1px solid #eef0f4", pt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
									<Button
										type="submit"
										variant="contained"
										size="small"
										sx={{
											background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
											textTransform: "none",
											fontSize: 12.5,
											borderRadius: 2,
											boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
											transition: "transform 0.15s ease, box-shadow 0.15s ease",
											"&:hover": {
												boxShadow: "0 5px 16px rgba(99,102,241,0.45)",
												transform: "translateY(-1px)",
											},
											"&:active": { transform: "translateY(0)" },
										}}
									>
										{editing ? "Update" : "Submit"}
									</Button>
									{editing && (
										<Button
											size="small"
											onClick={() => {
												setEditing(null);
												setForm({ name: "", position: 0 });
											}}
											sx={{ textTransform: "none", fontSize: 12.5, color: "#64748b" }}
										>
											Cancel
										</Button>
									)}
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={9}>
					<Card
						sx={{
							borderRadius: 3,
							boxShadow: "0 4px 20px rgba(20,184,166,0.08)",
							border: "1px solid #eafaf6",
							animation: "popIn 0.4s ease",
						}}
					>
						<CardContent sx={{ p: 2.5 }}>
							<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
								<Typography
									sx={{
										background: "linear-gradient(90deg,#14b8a6,#06b6d4)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										fontWeight: 800,
										fontSize: 13,
										letterSpacing: 0.3,
									}}
								>
									Section list
								</Typography>
								<Box sx={{ display: "flex", gap: 1 }}>
									<Button
										size="small"
										startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
										onClick={handleSavePositions}
										variant="contained"
										sx={{
											background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
											textTransform: "none",
											fontSize: 12,
											borderRadius: 2,
											boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
											transition: "transform 0.15s ease, box-shadow 0.15s ease",
											"&:hover": { transform: "translateY(-1px)", boxShadow: "0 5px 14px rgba(99,102,241,0.4)" },
										}}
									>
										Save positions
									</Button>
									<Button
										size="small"
										variant="contained"
										onClick={() => setShowInactive(!showInactive)}
										startIcon={
											showInactive ? (
												<VisibilityOffIcon sx={{ fontSize: 16 }} />
											) : (
												<VisibilityIcon sx={{ fontSize: 16 }} />
											)
										}
										sx={{
											background: showInactive
												? "linear-gradient(90deg,#10b981,#14b8a6)"
												: "linear-gradient(90deg,#f59e0b,#f97316)",
											textTransform: "none",
											fontSize: 12,
											borderRadius: 2,
											boxShadow: showInactive
												? "0 3px 10px rgba(16,185,129,0.3)"
												: "0 3px 10px rgba(245,158,11,0.3)",
											transition: "all 0.2s ease",
											"&:hover": { transform: "translateY(-1px)" },
										}}
									>
										{showInactive ? "Hide inactive" : "Show inactive"}
									</Button>
								</Box>
							</Box>

							{error && (
								<Typography color="error" sx={{ mb: 1, fontSize: 12 }}>
									{error}
								</Typography>
							)}

							{loading ? (
								<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
									<CircularProgress size={26} sx={{ color: "#8b5cf6" }} />
								</Box>
							) : (
								<Box sx={{ overflowX: "auto" }}>
									<Table size="small">
										<TableHead>
											<TableRow>
												{["Section name", "Position", "Status", "Action"].map((head) => (
													<TableCell
														key={head}
														sx={{
															bgcolor: "#f4f5fb",
															fontSize: 10.5,
															fontWeight: 700,
															color: "#4c4f6b",
															letterSpacing: 0.4,
															borderBottom: "2px solid #e6e8f5",
														}}
													>
														{head}
													</TableCell>
												))}
											</TableRow>
										</TableHead>
										<TableBody>
											{filteredRecords.length ? (
												filteredRecords.map((row, index) => (
													<TableRow
														key={row._id}
														sx={{
															animation: "fadeSlideUp 0.35s ease both",
															animationDelay: `${Math.min(index * 0.04, 0.4)}s`,
															transition: "background-color 0.2s ease",
															"&:hover": { bgcolor: "#f8f9ff" },
														}}
													>
														<TableCell sx={{ fontSize: 12 }}>
															<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
																<Box
																	sx={{
																		width: 8,
																		height: 8,
																		borderRadius: "50%",
																		bgcolor: ACCENTS[index % ACCENTS.length],
																		flexShrink: 0,
																	}}
																/>
																{row.name}
															</Box>
														</TableCell>
														<TableCell>
															<TextField
																size="small"
																type="number"
																value={row.position}
																onChange={(event) =>
																	dispatch(
																		updateSection({
																			id: row._id,
																			updates: { position: event.target.value },
																		})
																	)
																}
																sx={{
																	width: 58,
																	"& .MuiOutlinedInput-root": { borderRadius: 1.5 },
																}}
																inputProps={{ style: { padding: "4px 8px", fontSize: 11.5 } }}
															/>
														</TableCell>
														<TableCell>
															<Chip
																size="small"
																label={row.active ? "Active" : "Inactive"}
																sx={{
																	height: 20,
																	fontSize: 10.5,
																	fontWeight: 700,
																	bgcolor: row.active ? "#e6faf3" : "#fdeeee",
																	color: row.active ? "#0d9488" : "#e11d48",
																	mr: 1,
																}}
															/>
															<Switch
																size="small"
																checked={row.active}
																onChange={(event) =>
																	dispatch(
																		updateSection({
																			id: row._id,
																			updates: { active: event.target.checked },
																		})
																	)
																}
																sx={{
																	"& .MuiSwitch-switchBase.Mui-checked": { color: "#14b8a6" },
																	"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
																		bgcolor: "#14b8a6",
																	},
																}}
															/>
														</TableCell>
														<TableCell>
															<Button
																size="small"
																onClick={() => edit(row)}
																sx={{
																	color: "#4f46e5",
																	textTransform: "none",
																	minWidth: 0,
																	fontSize: 11.5,
																	borderRadius: 1.5,
																	transition: "background-color 0.15s ease",
																	"&:hover": { bgcolor: "#eef0fd" },
																}}
															>
																Edit
															</Button>
															<Button
																size="small"
																startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
																onClick={() => dispatch(deleteSection(row._id))}
																sx={{
																	color: "#e11d48",
																	textTransform: "none",
																	fontSize: 11.5,
																	borderRadius: 1.5,
																	transition: "background-color 0.15s ease",
																	"&:hover": { bgcolor: "#fdeeee" },
																}}
															>
																Remove
															</Button>
														</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell colSpan={4} align="center" sx={{ py: 6 }}>
														<Fade in>
															<Typography sx={{ color: "#a0aec0", fontSize: 12.5 }}>
																No data
															</Typography>
														</Fade>
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</Box>
							)}
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
}