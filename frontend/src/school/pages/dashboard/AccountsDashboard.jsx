import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Divider,
  LinearProgress,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  BarChart,
  Warning,
  CheckCircle,
  Percent,
} from "@mui/icons-material";

// Redux actions
import {
  fetchAccountsDashboard,
  fetchFeeCollectionTrends,
  fetchRecentTransactions,
  fetchBankBalances,
  fetchIncomeExpenseData,
} from "../../../state/accountsDashboardSlice";

/* ---------- Animations ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const grow = keyframes`
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
`;
const floaty = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;
const EASE = "cubic-bezier(.2,.8,.2,1)";

// staggered entrance: reveal(0), reveal(1) ...
const reveal = (i = 0) => ({
  animation: `${fadeUp} .6s ${EASE} both`,
  animationDelay: `${i * 70}ms`,
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
});

/* ---------- Design tokens ---------- */
const GRADIENTS = [
  ["#34d399", "#059669"],
  ["#60a5fa", "#4f46e5"],
  ["#a78bfa", "#db2777"],
  ["#fb7185", "#f97316"],
  ["#fbbf24", "#f59e0b"],
  ["#22d3ee", "#0284c7"],
];

const cardSx = {
  borderRadius: "18px",
  border: "1px solid rgba(148,163,184,.18)",
  boxShadow: "0 6px 20px rgba(15,23,42,.05)",
  transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 30px rgba(15,23,42,.10)" },
};

const PERIODS = [
  ["Today", "today"],
  ["Last 7 Days", "last7Days"],
  ["This Month", "thisMonth"],
  ["Last 6 Months", "last6Months"],
  ["This Session", "thisSession"],
];

/* ---------- Helpers ---------- */
const formatCurrency = (amount) => {
  const n = Number(amount) || 0;
  const a = Math.abs(n);
  if (a >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (a >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (a >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${Math.round(n)}`;
};

// Number that counts up smoothly
function AnimatedValue({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    let raf;
    let start;
    const step = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / 900, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{formatCurrency(n)}</>;
}

/**
 * Accounts Dashboard Component
 * Shows financial overview and fee management
 */
export default function AccountsDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const {
    todayCollection,
    thisWeekCollection,
    thisMonthCollection,
    totalPending,
    collectionSummary,
    bankBalances,
    feeCollectionTrends,
    recentTransactions,
    income,
    expense,
    balance,
    loading,
    trendsLoading,
    transactionsLoading,
    bankBalancesLoading,
    incomeExpenseLoading,
  } = useSelector((state) => state.accountsDashboard);

  useEffect(() => {
    // Fetch all dashboard data
    dispatch(fetchAccountsDashboard());
    dispatch(fetchFeeCollectionTrends(12));
    dispatch(fetchRecentTransactions(5));
    dispatch(fetchBankBalances());
    dispatch(fetchIncomeExpenseData());
  }, [dispatch]);

  const stats = [
    { icon: <CheckCircle />, label: "Today's Collection", value: todayCollection, g: GRADIENTS[0] },
    { icon: <TrendingUp />, label: "This Week", value: thisWeekCollection, g: GRADIENTS[1] },
    { icon: <BarChart />, label: "This Month", value: thisMonthCollection, g: GRADIENTS[2] },
    { icon: <Warning />, label: "Total Pending", value: totalPending, g: GRADIENTS[3] },
  ];

  const flows = [
    { title: "Income", icon: <TrendingUp />, data: income, color: "#10b981", bg: "linear-gradient(160deg,#ecfdf5,#d1fae5)" },
    { title: "Expense", icon: <TrendingDown />, data: expense, color: "#ef4444", bg: "linear-gradient(160deg,#fef2f2,#fee2e2)" },
    { title: "Balance", icon: <AccountBalance />, data: balance, color: "#f59e0b", bg: "linear-gradient(160deg,#fffbeb,#fef3c7)" },
  ];

  const quickActions = [
    { label: "Collect Fee", color: "#10b981", icon: <Receipt />, onClick: () => navigate("/school/fee-collection") },
    { label: "Fee Rebate Report", color: "#ef4444", icon: <Percent /> },
    { label: "Balance Report", color: "#f59e0b", icon: <AccountBalance /> },
    { label: "Term-wise Report", color: "#3b82f6", icon: <BarChart /> },
    { label: "Top Dues", color: "#f43f5e", icon: <Warning /> },
    { label: "Class-wise Fee", color: "#8b5cf6", icon: <TrendingUp /> },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },
        background:
          "radial-gradient(900px 420px at 0% 0%, rgba(99,102,241,.10), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(244,63,94,.08), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(16,185,129,.08), transparent 60%), #f8fafc",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "center",
          ...reveal(0),
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 20, md: 24 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg,#4f46e5,#db2777,#f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              width: "fit-content",
            }}
          >
            Accounts & Finance
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>
            Complete financial overview and fee management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Receipt sx={{ fontSize: 16 }} />}
            onClick={() => navigate("/school/fee-collection")}
            sx={{
              background: "linear-gradient(135deg,#10b981,#0d9488)",
              boxShadow: "0 6px 16px rgba(16,185,129,.35)",
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "10px",
              px: 2,
              transition: `transform .25s ${EASE}, box-shadow .25s ${EASE}`,
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(16,185,129,.45)" },
            }}
          >
            Collect Fee
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BarChart sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: "#f43f5e",
              color: "#f43f5e",
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "10px",
              px: 2,
              transition: `all .25s ${EASE}`,
              "&:hover": { borderColor: "#e11d48", bgcolor: "#fff1f2", transform: "translateY(-2px)" },
            }}
          >
            View Reports
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : (
        <>
          {/* Overview Stats */}
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            {stats.map((s, i) => (
              <Grid item xs={12} sm={6} md={3} key={s.label} sx={reveal(i + 1)}>
                <StatCard {...s} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5}>
            {/* Left Column */}
            <Grid item xs={12} md={8}>
              {/* Income / Expense / Balance */}
              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                {flows.map((f, i) => (
                  <Grid item xs={12} md={4} key={f.title} sx={reveal(i + 5)}>
                    <Card sx={{ ...cardSx, background: f.bg, height: "100%" }}>
                      <CardContent sx={{ p: 2.25 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.75 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "9px",
                              bgcolor: f.color,
                              color: "#fff",
                              display: "grid",
                              placeItems: "center",
                              "& svg": { fontSize: 16 },
                            }}
                          >
                            {f.icon}
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 13, color: f.color }}>{f.title}</Typography>
                        </Box>

                        {incomeExpenseLoading ? (
                          <CircularProgress size={22} sx={{ color: f.color }} />
                        ) : (
                          PERIODS.map(([label, key]) => (
                            <IncomeExpenseRow
                              key={key}
                              label={label}
                              cashAmount={f.data?.[key]?.cash}
                              bankAmount={f.data?.[key]?.bank}
                              total={f.data?.[key]?.total}
                            />
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Bank Balances */}
              <Card sx={{ ...cardSx, mb: 2.5, ...reveal(8) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Balance by Bank Head</Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "999px",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        background: "linear-gradient(135deg,#6366f1,#ec4899)",
                        boxShadow: "0 6px 14px rgba(99,102,241,.3)",
                      }}
                    >
                      Total Balance: {formatCurrency(bankBalances?.totalBalance)}
                    </Box>
                  </Box>

                  {bankBalancesLoading ? (
                    <CircularProgress size={26} sx={{ color: "#6366f1" }} />
                  ) : (
                    <>
                      {bankBalances?.pettyCash?.map((cash, idx) => (
                        <BalanceRow key={`c${idx}`} emoji="💵" title={cash.name} sub="Cash in hand" amount={cash.balance} g={GRADIENTS[idx % 6]} />
                      ))}

                      <Divider sx={{ my: 1.5 }} />

                      {bankBalances?.banks?.map((bank, idx) => (
                        <BalanceRow key={`b${idx}`} emoji="🏦" title={bank.name} sub={bank.accountNumber} amount={bank.balance} g={GRADIENTS[(idx + 1) % 6]} />
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Fee Collection Trend */}
              <Card sx={{ ...cardSx, ...reveal(9) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#1e293b" }}>Fee Collection Trend</Typography>
                  {trendsLoading ? (
                    <CircularProgress size={26} sx={{ color: "#6366f1" }} />
                  ) : Array.isArray(feeCollectionTrends) && feeCollectionTrends.length > 0 ? (
                    <TrendChart data={feeCollectionTrends} />
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                      <BarChart sx={{ fontSize: 40, mb: 1, opacity: 0.6, animation: `${floaty} 3s ease-in-out infinite` }} />
                      <Typography sx={{ fontSize: 12 }}>No trend data yet</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={4}>
              {/* Collection Summary */}
              <Card sx={{ ...cardSx, mb: 2.5, ...reveal(6) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2, color: "#1e293b" }}>Collection Summary</Typography>

                  <SummaryItem icon={<CheckCircle />} label="Quarterly Collection" value={formatCurrency(collectionSummary?.quarterlyCollection)} color="#10b981" />
                  <SummaryItem icon={<AccountBalance />} label="Yearly Collection" value={formatCurrency(collectionSummary?.yearlyCollection)} color="#3b82f6" />
                  <SummaryItem icon={<Warning />} label="Pending Fees" value={`${collectionSummary?.pendingStudents ?? 0} Students`} color="#f59e0b" />
                  <SummaryItem icon={<Percent />} label="Collection Rate" value={`${collectionSummary?.collectionRate ?? 0}%`} color="#8b5cf6" />

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(Number(collectionSummary?.collectionRate) || 0, 100)}
                    sx={{
                      mt: 0.5,
                      height: 7,
                      borderRadius: 4,
                      bgcolor: "#ede9fe",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        background: "linear-gradient(90deg,#8b5cf6,#ec4899,#f97316)",
                        transition: "transform 1.2s cubic-bezier(.2,.8,.2,1)",
                      },
                    }}
                  />
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card sx={{ ...cardSx, mb: 2.5, ...reveal(7) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Recent Transactions</Typography>
                    <Button size="small" sx={{ textTransform: "none", color: "#f43f5e", fontSize: 12, fontWeight: 600 }}>
                      View All →
                    </Button>
                  </Box>

                  {transactionsLoading ? (
                    <CircularProgress size={26} sx={{ color: "#6366f1" }} />
                  ) : recentTransactions?.length > 0 ? (
                    recentTransactions.map((txn, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          p: 1,
                          mx: -1,
                          borderRadius: "12px",
                          transition: "background .25s ease, transform .25s ease",
                          "&:hover": { bgcolor: "#f8fafc", transform: "translateX(3px)" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "11px",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            background: `linear-gradient(135deg,${GRADIENTS[idx % 6][0]},${GRADIENTS[idx % 6][1]})`,
                          }}
                        >
                          {(txn.studentName || "?").charAt(0).toUpperCase()}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 600, fontSize: 12.5, color: "#1e293b" }}>
                            {txn.studentName}
                          </Typography>
                          <Typography noWrap sx={{ fontSize: 11, color: "#64748b" }}>
                            {txn.feeType} • {new Date(txn.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#10b981" }}>
                          +₹{Number(txn.amount || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: 12, color: "#94a3b8", textAlign: "center", py: 3 }}>
                      No recent transactions
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card sx={{ ...cardSx, ...reveal(8) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#1e293b" }}>Quick Actions</Typography>
                  <Grid container spacing={1.5}>
                    {quickActions.map((a) => (
                      <Grid item xs={6} key={a.label}>
                        <QuickActionButton {...a} />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

/* ---------- Helper Components ---------- */
function StatCard({ icon, label, value, g }) {
  return (
    <Card
      sx={{
        ...cardSx,
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        border: "none",
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
        boxShadow: `0 10px 24px ${g[1]}40`,
        "&:hover": { transform: "translateY(-4px)", boxShadow: `0 16px 32px ${g[1]}59` },
      }}
    >
      {/* decorative bubbles */}
      <Box sx={{ position: "absolute", top: -26, right: -26, width: 90, height: 90, borderRadius: "50%", bgcolor: "rgba(255,255,255,.16)" }} />
      <Box sx={{ position: "absolute", bottom: -34, right: 24, width: 64, height: 64, borderRadius: "50%", bgcolor: "rgba(255,255,255,.10)" }} />
      <CardContent sx={{ p: 2.25, position: "relative" }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "11px",
            bgcolor: "rgba(255,255,255,.22)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            mb: 1.5,
            "& svg": { fontSize: 19 },
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          <AnimatedValue value={value} />
        </Typography>
        <Typography sx={{ fontSize: 11.5, fontWeight: 500, opacity: 0.9, mt: 0.5 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ icon, label, value, color }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.75 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "9px",
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: `${color}1A`,
            "& svg": { fontSize: 16 },
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{value}</Typography>
    </Box>
  );
}

function QuickActionButton({ label, color, icon, onClick }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      sx={{
        p: 1.5,
        textAlign: "center",
        borderRadius: "14px",
        cursor: "pointer",
        color,
        background: `linear-gradient(160deg,${color}14,${color}26)`,
        border: `1px solid ${color}22`,
        transition: `all .3s ${EASE}`,
        "& svg": { fontSize: 20, mb: 0.5, transition: `transform .3s ${EASE}` },
        "&:hover, &:focus-visible": {
          outline: "none",
          transform: "translateY(-3px)",
          color: "#fff",
          background: color,
          boxShadow: `0 10px 20px ${color}59`,
        },
        "&:hover svg": { transform: "scale(1.15) rotate(-6deg)" },
        "&:active": { transform: "scale(.97)" },
      }}
    >
      {icon}
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "inherit", lineHeight: 1.3 }}>{label}</Typography>
    </Box>
  );
}

function IncomeExpenseRow({ label, cashAmount, bankAmount, total }) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{formatCurrency(total)}</Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.75, mt: 0.25 }}>
        <Box sx={{ px: 0.75, borderRadius: "6px", bgcolor: "#10b9811A", color: "#059669", fontSize: 9.5, fontWeight: 600 }}>
          Cash {formatCurrency(cashAmount)}
        </Box>
        <Box sx={{ px: 0.75, borderRadius: "6px", bgcolor: "#3b82f61A", color: "#2563eb", fontSize: 9.5, fontWeight: 600 }}>
          Bank {formatCurrency(bankAmount)}
        </Box>
      </Box>
    </Box>
  );
}

function BalanceRow({ emoji, title, sub, amount, g }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        mx: -1,
        borderRadius: "12px",
        transition: "background .25s ease, transform .25s ease",
        "&:hover": { bgcolor: "#f8fafc", transform: "translateX(3px)" },
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "11px",
          display: "grid",
          placeItems: "center",
          fontSize: 16,
          background: `linear-gradient(135deg,${g[0]}33,${g[1]}33)`,
        }}
      >
        {emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 600, fontSize: 12.5, color: "#1e293b" }}>{title}</Typography>
        <Typography noWrap sx={{ fontSize: 11, color: "#64748b" }}>{sub}</Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{formatCurrency(amount)}</Typography>
    </Box>
  );
}

// Simple animated bar chart (no extra library needed)
function TrendChart({ data }) {
  const items = data.map((t) => ({
    label: t.month ?? t.label ?? t.name ?? "",
    value: Number(t.amount ?? t.total ?? t.collection ?? t.value ?? 0),
  }));
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 180 }}>
      {items.map((it, i) => {
        const [a, b] = GRADIENTS[i % GRADIENTS.length];
        return (
          <Box
            key={i}
            sx={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}
          >
            <Typography sx={{ fontSize: 9, color: "#64748b", mb: 0.5 }}>{formatCurrency(it.value)}</Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 28,
                height: `${Math.max((it.value / max) * 70, 3)}%`,
                borderRadius: "8px 8px 3px 3px",
                background: `linear-gradient(180deg,${a},${b})`,
                transformOrigin: "bottom",
                animation: `${grow} .9s ${EASE} both`,
                animationDelay: `${i * 60}ms`,
                transition: "filter .2s ease, transform .2s ease",
                "&:hover": { filter: "brightness(1.12) saturate(1.1)" },
              }}
            />
            <Typography noWrap sx={{ fontSize: 9, color: "#94a3b8", mt: 0.5, maxWidth: "100%" }}>{it.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}