import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import {
  getInventoryDashboard,
  getLowStockItems,
  getRecentTransactions
} from '../../../state/inventoryDashboardSlice';

/* ---------- Animations & tokens ---------- */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const rowIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const grow = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;
const shift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const NO_MOTION = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } };
// "backwards" fill so hover transforms keep working after the entrance ends
const enter = (ms = 0) => ({ animation: `${fadeUp} .5s ${EASE} ${ms}ms backwards`, ...NO_MOTION });

const cardSx = {
  borderRadius: '16px',
  border: '1px solid rgba(148,163,184,.18)',
  boxShadow: '0 6px 20px rgba(15,23,42,.05)',
  transition: `transform .35s ${EASE}, box-shadow .35s ${EASE}`,
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(15,23,42,.09)' },
};

const GRADS = {
  green: ['#34d399', '#059669'],
  blue: ['#60a5fa', '#4f46e5'],
  violet: ['#a78bfa', '#db2777'],
  rose: ['#fb7185', '#f97316'],
  amber: ['#fbbf24', '#f59e0b'],
  red: ['#fb7185', '#e11d48'],
};

const formatCurrency = (amount) => `₹${(Number(amount) || 0).toLocaleString('en-IN')}`;

const AMOUNT_SECTIONS = [
  {
    title: 'Sell Amount', icon: TrendingUpIcon, color: '#f59e0b', g: [GRADS.amber[0], '#f97316'], key: 'sellAmount',
    rows: [["Today's Sell", 'today'], ['Last Week Sell', 'lastWeek'], ['Current Month Sell', 'currentMonth'], ['Last 6 Month Sell', 'last6Months'], ['Current Session Sell', 'currentSession']],
  },
  {
    title: 'Received Amount', icon: MoneyIcon, color: '#10b981', g: GRADS.green, key: 'receivedAmount',
    rows: [["Today's Received", 'today'], ['Last Week Received', 'lastWeek'], ['Current Month Received', 'currentMonth'], ['Last 6 Month Received', 'last6Months'], ['Current Session Received', 'currentSession']],
  },
  {
    title: 'Purchased Amount', icon: CartIcon, color: '#ef4444', g: GRADS.red, key: 'purchaseAmount',
    rows: [["Today's Purchase", 'today'], ['Last Week Purchase', 'lastWeek'], ['Current Month Purchase', 'currentMonth'], ['Last 6 Month Purchase', 'last6Months'], ['Current Session Purchase', 'currentSession']],
  },
];

const QUICK_ACTIONS = [
  ['New Sale', AddIcon, '#10b981'],
  ['New Purchase', AddIcon, '#ef4444'],
  ['Sell Report', DownloadIcon, '#f59e0b'],
  ['Purchase Report', DownloadIcon, '#8b5cf6'],
  ['Stock Report', DownloadIcon, '#3b82f6'],
  ['All Items', InventoryIcon, '#0ea5e9'],
];

/* ---------- Small components (outside main so they don't remount/re-animate) ---------- */

// Number that counts up smoothly
function CountUp({ value, format = (n) => Math.round(n).toLocaleString('en-IN') }) {
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
  return <>{format(n)}</>;
}

function StatCard({ title, value, format, subtitle, icon: Icon, g, delay = 0 }) {
  return (
    <Card
      sx={{
        ...cardSx,
        ...enter(delay),
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        border: 'none',
        background: `linear-gradient(135deg,${g[0]},${g[1]})`,
        boxShadow: `0 10px 24px ${g[1]}40`,
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 32px ${g[1]}59` },
      }}
    >
      <Box sx={{ position: 'absolute', top: -28, right: -28, width: 96, height: 96, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.16)' }} />
      <Box sx={{ position: 'absolute', bottom: -36, right: 26, width: 66, height: 66, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.10)' }} />
      <CardContent sx={{ position: 'relative', p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: '11px', bgcolor: 'rgba(255,255,255,.22)', mb: 1.5 }}>
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          <CountUp value={value} format={format} />
        </Typography>
        <Typography sx={{ fontSize: 11.5, fontWeight: 600, mt: 0.5, opacity: 0.95 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 10.5, opacity: 0.8 }}>{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

function AmountRow({ label, value, max, color, index }) {
  const num = Number(value) || 0;
  const pct = max > 0 ? Math.max(0, Math.min((num / max) * 100, 100)) : 0;
  return (
    <Box
      sx={{
        py: 1.1,
        px: 0.5,
        borderBottom: '1px solid #f1f5f9',
        borderRadius: '8px',
        animation: `${rowIn} .35s ${EASE} ${index * 60}ms backwards`,
        transition: `background .25s ease, transform .25s ${EASE}`,
        '&:hover': { bgcolor: `${color}0D`, transform: 'translateX(3px)' },
        ...NO_MOTION,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 12, color: '#64748b' }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatCurrency(value)}</Typography>
      </Box>
      <Box sx={{ height: 4, mt: 0.75, borderRadius: 2, bgcolor: `${color}1A`, overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 2,
            transformOrigin: 'left',
            background: `linear-gradient(90deg,${color},${color}99)`,
            animation: `${grow} 1s ${EASE} ${300 + index * 90}ms backwards`,
            ...NO_MOTION,
          }}
        />
      </Box>
    </Box>
  );
}

function AmountCard({ section, data, delay }) {
  const { title, icon: Icon, color, g, rows } = section;
  const values = rows.map(([, k]) => Number(data?.[k]) || 0);
  const max = Math.max(...values, 1);
  return (
    <Card sx={{ ...cardSx, ...enter(delay), height: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.25,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          color: '#fff',
          background: `linear-gradient(120deg,${g[0]},${g[1]})`,
        }}
      >
        <Box sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '9px', bgcolor: 'rgba(255,255,255,.22)' }}>
          <Icon sx={{ fontSize: 16 }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{title}</Typography>
      </Box>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 1.5 } }}>
        {rows.map(([label, k], i) => (
          <AmountRow key={k} label={label} value={data?.[k]} max={max} color={color} index={i} />
        ))}
      </CardContent>
    </Card>
  );
}

const InventoryDashboard = () => {
  const dispatch = useDispatch();
  const {
    dashboard,
    lowStockItems,
    recentTransactions,
    loading,
    lowStockLoading,
    transactionsLoading
  } = useSelector((state) => state.inventoryDashboard);

  const { user } = useSelector((state) => state.login);
  const schoolId = user?.school?._id || user?.schoolId || user?.school_id || user?.school?.id || (typeof user?.school === 'string' ? user.school : null);

  useEffect(() => {
    if (schoolId) {
      fetchAll();
    }
  }, [schoolId]);

  const fetchAll = () => {
    dispatch(getInventoryDashboard(schoolId));
    dispatch(getLowStockItems({ schoolId, limit: 10 }));
    dispatch(getRecentTransactions({ schoolId, type: 'all', limit: 10 }));
  };

  const d = dashboard || {};

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: '100vh',
        background:
          'radial-gradient(900px 420px at 0% 0%, rgba(16,185,129,.10), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(139,92,246,.10), transparent 60%), radial-gradient(800px 500px at 50% 100%, rgba(245,158,11,.08), transparent 60%), #f6f7fb',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2.5,
          borderRadius: '18px',
          color: '#fff',
          background: 'linear-gradient(120deg,#0ea5e9 0%,#6366f1 40%,#a855f7 70%,#ec4899 100%)',
          backgroundSize: '200% 200%',
          animation: `${fadeUp} .5s ${EASE} backwards, ${shift} 12s ease infinite`,
          boxShadow: '0 12px 28px rgba(99,102,241,.30)',
          ...NO_MOTION,
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: 200, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.12)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: -20, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.10)' }} />
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 22 }, letterSpacing: '-0.02em' }}>
            Inventory & Stock
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.92, mt: 0.4 }}>
            Complete overview of sales, purchases and stock management
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ position: 'relative' }}>
          <Button
            startIcon={<RefreshIcon sx={{ fontSize: 16, transition: `transform .5s ${EASE}` }} />}
            onClick={fetchAll}
            size="small"
            sx={{
              color: '#fff', fontSize: 12, fontWeight: 600, textTransform: 'none', borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.4)', backdropFilter: 'blur(6px)',
              transition: `all .25s ${EASE}`,
              '&:hover': { bgcolor: 'rgba(255,255,255,.3)', transform: 'translateY(-2px)', '& svg': { transform: 'rotate(180deg)' } },
            }}
          >
            Refresh
          </Button>
          <Button
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            size="small"
            sx={{
              bgcolor: '#fff', color: '#059669', fontSize: 12, fontWeight: 700, textTransform: 'none', borderRadius: '10px',
              boxShadow: '0 6px 16px rgba(0,0,0,.15)', transition: `all .25s ${EASE}`,
              '&:hover': { bgcolor: '#ecfdf5', transform: 'translateY(-2px)', boxShadow: '0 10px 22px rgba(0,0,0,.2)' },
            }}
          >
            New Sale
          </Button>
          <Button
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            size="small"
            sx={{
              bgcolor: '#fff', color: '#e11d48', fontSize: 12, fontWeight: 700, textTransform: 'none', borderRadius: '10px',
              boxShadow: '0 6px 16px rgba(0,0,0,.15)', transition: `all .25s ${EASE}`,
              '&:hover': { bgcolor: '#fff1f2', transform: 'translateY(-2px)', boxShadow: '0 10px 22px rgba(0,0,0,.2)' },
            }}
          >
            New Purchase
          </Button>
        </Box>
      </Box>

      {loading && (
        <LinearProgress
          sx={{
            mb: 2, height: 5, borderRadius: 3, bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#6366f1,#ec4899,#f97316)', borderRadius: 3 },
          }}
        />
      )}

      {/* Top Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customer Balance"
            value={d.customerBalance}
            format={(n) => formatCurrency(Math.round(n))}
            subtitle="Outstanding balance"
            icon={MoneyIcon}
            g={GRADS.green}
            delay={60}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Stock Value"
            value={d.stockValue}
            format={(n) => `₹${(n / 1000).toFixed(1)} K`}
            subtitle="Total inventory value"
            icon={InventoryIcon}
            g={GRADS.blue}
            delay={120}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Supplier Balance"
            value={d.supplierBalance}
            format={(n) => formatCurrency(Math.round(n))}
            subtitle="Pending payments"
            icon={CartIcon}
            g={GRADS.violet}
            delay={180}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Items"
            value={d.activeItems}
            subtitle="Items in inventory"
            icon={TrendingUpIcon}
            g={GRADS.rose}
            delay={240}
          />
        </Grid>
      </Grid>

      {/* Sell, Received, Purchase Amounts */}
      <Grid container spacing={2} mb={3}>
        {AMOUNT_SECTIONS.map((section, i) => (
          <Grid item xs={12} md={4} key={section.key}>
            <AmountCard section={section} data={d[section.key]} delay={300 + i * 70} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ ...cardSx, ...enter(540), mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 4, height: 16, borderRadius: 2, background: 'linear-gradient(180deg,#6366f1,#ec4899)' }} />
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Quick Actions</Typography>
          </Box>
          <Grid container spacing={1.5}>
            {QUICK_ACTIONS.map(([label, Icon, color]) => (
              <Grid item xs={6} sm={4} md={2} key={label}>
                <Button
                  fullWidth
                  startIcon={<Icon sx={{ fontSize: 17 }} />}
                  sx={{
                    py: 1.1,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '12px',
                    color,
                    bgcolor: `${color}12`,
                    border: `1px solid ${color}30`,
                    transition: `all .3s ${EASE}`,
                    '& .MuiButton-startIcon': { transition: `transform .3s ${EASE}` },
                    '&:hover': {
                      color: '#fff',
                      bgcolor: color,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 10px 20px ${color}55`,
                      '& .MuiButton-startIcon': { transform: 'scale(1.15) rotate(-6deg)' },
                    },
                    '&:active': { transform: 'scale(.97)' },
                  }}
                >
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InventoryDashboard;