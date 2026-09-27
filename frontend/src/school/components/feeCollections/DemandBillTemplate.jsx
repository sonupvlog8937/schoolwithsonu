import React, { useRef } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Paper,
  Chip, Button,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';

/* ════════════════════════════════════════════════════════════════════════════
   Global print styles — injected once into <head>
════════════════════════════════════════════════════════════════════════════ */
const PRINT_STYLE_ID = 'demand-bill-print-styles-v2';
const injectPrintStyles = () => {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = PRINT_STYLE_ID;
  el.textContent = `
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    @media print {
      *,*::before,*::after { 
        box-sizing: border-box; 
      }
      html, body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print { 
        display: none !important; 
      }
      #demand-bill-a4 {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      /* Hide MUI Dialog chrome during print */
      .MuiDialog-root .MuiDialogTitle-root,
      .MuiDialog-root .MuiDialogActions-root {
        display: none !important;
      }
      .MuiDialog-paper {
        box-shadow: none !important;
        margin: 0 !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }
      .MuiDialogContent-root {
        padding: 0 !important;
        overflow: visible !important;
      }
    }
  `;
  document.head.appendChild(el);
};

/* ════════════════════════════════════════════════════════════════════════════
   DemandBillTemplate  — forwardRef (external print ref support kept)
════════════════════════════════════════════════════════════════════════════ */
const DemandBillTemplate = React.forwardRef(({ billData, schoolInfo }, ref) => {
  injectPrintStyles();

  /* ── helpers ─────────────────────────────────────────────────────────── */
  const curr = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(v || 0);

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!billData) return null;

  const student  = billData.student || {};
  const fullName = student.firstName
    ? `${student.firstName} ${student.lastName || ''}`.trim()
    : 'Unknown';

  /* ── normalise fee rows ──────────────────────────────────────────────── */
  const rawFees = billData.feeDetails || billData.feeAssignments || [];
  const feeRows = rawFees.map((f) => ({
    feesGroup:      f.feesGroup      || f.feeMaster?.feesGroup  || 'N/A',
    feesCode:       f.feesCode       || f.feeMaster?.feesCode   || 'N/A',
    dueDate:        f.dueDate,
    amount:         f.amount         || 0,
    paidAmount:     f.paidAmount     || 0,
    discountAmount: f.discountAmount || 0,
    fineAmount:     f.fineAmount     || 0,
    balance:        f.balance        || 0,
    status:         f.status         || 'Unpaid',
  }));

  const totalAmount   = billData.totalAmount   ?? feeRows.reduce((s, f) => s + f.amount, 0);
  const totalPaid     = billData.totalPaid     ?? feeRows.reduce((s, f) => s + f.paidAmount, 0);
  const totalDiscount = billData.totalDiscount ?? feeRows.reduce((s, f) => s + f.discountAmount, 0);
  const totalFine     = billData.totalFine     ?? feeRows.reduce((s, f) => s + f.fineAmount, 0);
  const totalBalance  = billData.totalBalance  ?? feeRows.reduce((s, f) => s + f.balance, 0);

  const paidFees   = feeRows.filter((f) => f.status === 'Paid');
  const unpaidFees = feeRows.filter((f) => f.status !== 'Paid');
  const overallStatus = totalBalance <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

  /* ── design tokens ───────────────────────────────────────────────────── */
  const P   = '#6D28D9';
  const PD  = '#4C1D95';
  const PL  = '#EDE9FE';
  const PLB = '#DDD6FE';

  /* ── reusable cell sx ────────────────────────────────────────────────── */
  const thSx = {
    color: '#fff', fontWeight: 700, fontSize: '0.63rem',
    py: '5px', px: '6px', borderBottom: 'none',
    letterSpacing: 0.2, whiteSpace: 'nowrap',
    '@media print': { fontSize: '6.5pt', py: '4px', px: '5px' },
  };
  const tdSx = {
    fontSize: '0.65rem', py: '4px', px: '6px',
    borderBottom: `1px solid ${PLB}`,
    '@media print': { fontSize: '6.5pt', py: '3px', px: '5px' },
  };
  const totalRowSx = {
    fontWeight: 800, fontSize: '0.68rem', py: '5px', px: '6px',
    borderBottom: 'none', background: PL,
    '@media print': { fontSize: '7pt', py: '4px', px: '5px' },
  };

  /* ── label / value helpers ───────────────────────────────────────────── */
  const Lbl = ({ children }) => (
    <Typography sx={{
      fontSize: '0.55rem', fontWeight: 700, color: P,
      textTransform: 'uppercase', letterSpacing: 0.5,
      lineHeight: 1.3, mb: '2px',
      '@media print': { fontSize: '5.5pt' },
    }}>
      {children}
    </Typography>
  );
  const Val = ({ children, sx }) => (
    <Typography sx={{
      fontSize: '0.72rem', fontWeight: 700, color: '#1F2937',
      lineHeight: 1.3,
      '@media print': { fontSize: '7.5pt' },
      ...sx,
    }}>
      {children}
    </Typography>
  );

  /* ── status badge ────────────────────────────────────────────────────── */
  const StatusBadge = ({ status }) => {
    const cfg = {
      Paid:    { bg: '#16A34A', icon: <CheckCircleIcon sx={{ fontSize: 9 }} /> },
      Partial: { bg: '#D97706', icon: <WarningIcon     sx={{ fontSize: 9 }} /> },
      Unpaid:  { bg: '#DC2626', icon: <ErrorIcon       sx={{ fontSize: 9 }} /> },
    }[status] || { bg: '#6B7280', icon: null };
    return (
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: '2px',
        bgcolor: cfg.bg, color: '#fff', borderRadius: '3px',
        px: '5px', py: '1px', fontSize: '0.58rem', fontWeight: 700,
        '@media print': { fontSize: '6pt' },
      }}>
        {cfg.icon}{status}
      </Box>
    );
  };

  /* ── section bar ─────────────────────────────────────────────────────── */
  const SecBar = ({ label }) => (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5,
      mb: 0.75, borderBottom: `1.5px solid ${PLB}`, pb: '4px',
    }}>
      <Box sx={{
        width: 3, height: 12, borderRadius: 1,
        background: `linear-gradient(180deg,${P},#A78BFA)`,
      }} />
      <Typography sx={{
        fontWeight: 800, color: PD, fontSize: '0.68rem',
        letterSpacing: 0.3,
        '@media print': { fontSize: '7pt' },
      }}>
        {label}
      </Typography>
    </Box>
  );

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <Box
      ref={ref}
      id="demand-bill-a4"
      sx={{
        width: '210mm',
        maxWidth: '210mm',
        minHeight: '297mm',
        mx: 'auto',
        p: '10mm',
        bgcolor: '#fff',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        boxSizing: 'border-box',
        position: 'relative',
        '@media print': { width: '100%', maxWidth: '100%', minHeight: 'auto', p: 0 },
      }}
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        mb: 1.25, pb: 1.25, borderBottom: `2.5px solid ${P}`,
      }}>
        {/* Left — school identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: '10px', flexShrink: 0,
            background: `linear-gradient(135deg,${PD},${P},#A78BFA)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 3px 10px rgba(109,40,217,0.45)`,
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', lineHeight: 1 }}>
              {(schoolInfo?.name || 'S').charAt(0).toUpperCase()}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{
              fontWeight: 900, color: PD, fontSize: '0.98rem',
              letterSpacing: 0.2, lineHeight: 1.2,
              '@media print': { fontSize: '11pt' },
            }}>
              {schoolInfo?.name || 'SCHOOL NAME'}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '0.6rem', mt: '2px', '@media print': { fontSize: '6.5pt' } }}>
              {schoolInfo?.address || 'School Address, City, State - PIN'}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '0.6rem', '@media print': { fontSize: '6.5pt' } }}>
              📞 {schoolInfo?.phone || '+91 XXXXXXXXXX'}&nbsp;·&nbsp;✉ {schoolInfo?.email || 'info@school.com'}
            </Typography>
          </Box>
        </Box>

        {/* Right — bill badge */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <Box sx={{
            background: `linear-gradient(135deg,${PD},${P})`,
            color: '#fff', px: 2, py: '7px',
            borderRadius: '8px 8px 8px 0',
            boxShadow: `0 3px 12px rgba(109,40,217,0.4)`,
          }}>
            <Typography sx={{ fontWeight: 900, fontSize: '0.78rem', letterSpacing: 2.5, '@media print': { fontSize: '8.5pt' } }}>
              FEE DEMAND BILL
            </Typography>
          </Box>
          <Box sx={{
            border: `1px solid ${PLB}`, bgcolor: PL, px: 1.5, py: '3px',
            borderRadius: '0 0 6px 6px', textAlign: 'center',
          }}>
            <Typography sx={{ fontWeight: 700, color: P, fontSize: '0.62rem', '@media print': { fontSize: '6.5pt' } }}>
              #{billData.billNumber || `DB-${student.admissionNo || 'XXXX'}-${new Date().getFullYear()}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ META STRIP ══════════════════════════════════════════════════════ */}
      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        border: `1.5px solid ${PLB}`, borderRadius: '6px',
        overflow: 'hidden', mb: 1.25, bgcolor: PL,
      }}>
        {[
          { label: 'Bill Date',      val: fmtDate(new Date()) },
          { label: 'Academic Year',  val: billData.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear()+1}` },
          { label: 'Fee Group',      val: billData.feesGroup || 'N/A' },
          { label: 'Overall Status', val: overallStatus },
        ].map(({ label, val }, i) => (
          <Box key={label} sx={{
            px: 1.25, py: '7px',
            borderRight: i < 3 ? `1px solid ${PLB}` : 'none',
          }}>
            <Lbl>{label}</Lbl>
            <Val sx={label === 'Overall Status' ? {
              color: val === 'Paid' ? '#16A34A' : val === 'Partial' ? '#D97706' : '#DC2626',
            } : {}}>{val}</Val>
          </Box>
        ))}
      </Box>

      {/* ══ STUDENT INFO ════════════════════════════════════════════════════ */}
      <Box sx={{
        border: `1.5px solid ${PLB}`, borderRadius: '6px',
        overflow: 'hidden', mb: 1.25,
      }}>
        <Box sx={{
          bgcolor: PL, px: 1.25, py: '5px',
          borderBottom: `1px solid ${PLB}`,
          display: 'flex', alignItems: 'center', gap: 0.75,
        }}>
          <Box sx={{
            width: 16, height: 16, borderRadius: '50%',
            background: `linear-gradient(135deg,${P},#A78BFA)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Typography sx={{ fontSize: '0.5rem', lineHeight: 1 }}>👤</Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, color: PD, fontSize: '0.68rem', '@media print': { fontSize: '7pt' } }}>
            Student Information
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)' }}>
          {[
            { label: 'Student Name',    val: fullName },
            { label: 'Admission No.',   val: student.admissionNo || 'N/A' },
            { label: 'Class & Section', val: `${student.class?.class_text || 'N/A'} – ${student.section || 'N/A'}` },
            { label: "Father's Name",   val: student.fatherName  || 'N/A' },
            { label: 'Mobile',          val: student.mobileNumber || 'N/A' },
            { label: 'Roll No.',        val: student.rollNumber  || 'N/A' },
          ].map(({ label, val }, i) => (
            <Box key={label} sx={{
              px: 1.25, py: '7px',
              borderRight: i < 5 ? `1px solid ${PLB}` : 'none',
              borderTop: i >= 3 ? `1px solid ${PLB}` : 'none',
            }}>
              <Lbl>{label}</Lbl>
              <Val>{val}</Val>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ FEE TABLE ═══════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 1.25 }}>
        <SecBar label="Complete Fee Breakdown" />
        <TableContainer sx={{ border: `1.5px solid ${PLB}`, borderRadius: '6px', overflow: 'hidden' }}>
          <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '100%' }}>
            <TableHead>
              <TableRow sx={{ background: `linear-gradient(135deg,${PD},${P})` }}>
                <TableCell sx={{ ...thSx, width: '5%' }}>#</TableCell>
                <TableCell sx={{ ...thSx, width: '18%' }}>Fee Group</TableCell>
                <TableCell sx={{ ...thSx, width: '16%' }}>Fee Code</TableCell>
                <TableCell sx={{ ...thSx, width: '11%' }}>Due Date</TableCell>
                <TableCell align="right" sx={{ ...thSx, width: '12%' }}>Amount</TableCell>
                <TableCell align="right" sx={{ ...thSx, width: '10%' }}>Paid</TableCell>
                <TableCell align="right" sx={{ ...thSx, width: '10%' }}>Discount</TableCell>
                <TableCell align="right" sx={{ ...thSx, width: '8%' }}>Fine</TableCell>
                <TableCell align="right" sx={{ ...thSx, width: '10%' }}>Balance</TableCell>
                <TableCell align="center" sx={{ ...thSx, width: '10%' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeRows.length > 0 ? feeRows.map((fee, idx) => (
                <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#FAF5FF' }}>
                  <TableCell sx={{ ...tdSx, fontWeight: 700, color: P }}>{idx + 1}</TableCell>
                  <TableCell sx={{ ...tdSx, fontWeight: 600, color: PD }}>{fee.feesGroup}</TableCell>
                  <TableCell sx={{ ...tdSx, color: '#4B5563' }}>{fee.feesCode}</TableCell>
                  <TableCell sx={{ ...tdSx, color: '#4B5563' }}>{fmtDate(fee.dueDate)}</TableCell>
                  <TableCell align="right" sx={{ ...tdSx, fontWeight: 700 }}>{curr(fee.amount)}</TableCell>
                  <TableCell align="right" sx={{ ...tdSx, fontWeight: 600, color: '#16A34A' }}>{curr(fee.paidAmount)}</TableCell>
                  <TableCell align="right" sx={{ ...tdSx, color: '#16A34A' }}>{curr(fee.discountAmount)}</TableCell>
                  <TableCell align="right" sx={{ ...tdSx, color: '#DC2626' }}>{curr(fee.fineAmount)}</TableCell>
                  <TableCell align="right" sx={{ ...tdSx, fontWeight: 700, color: fee.balance > 0 ? '#DC2626' : '#16A34A' }}>
                    {curr(fee.balance)}
                  </TableCell>
                  <TableCell align="center" sx={tdSx}>
                    <StatusBadge status={fee.status} />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 2.5, fontSize: '0.7rem', color: '#6B7280' }}>
                    No fee details available
                  </TableCell>
                </TableRow>
              )}

              {/* totals */}
              {feeRows.length > 0 && (
                <TableRow sx={{ borderTop: `2px solid ${P}` }}>
                  <TableCell colSpan={4} align="right" sx={{ ...totalRowSx, color: PD }}>GRAND TOTAL</TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, color: '#1F2937' }}>{curr(totalAmount)}</TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, color: '#16A34A' }}>{curr(totalPaid)}</TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, color: '#16A34A' }}>{curr(totalDiscount)}</TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, color: '#DC2626' }}>{curr(totalFine)}</TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, fontSize: '0.72rem', color: totalBalance > 0 ? '#DC2626' : '#16A34A' }}>
                    {curr(totalBalance)}
                  </TableCell>
                  <TableCell sx={{ ...totalRowSx }} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ══ PAID / UNPAID + SUMMARY  ══════════════════════════════════════════ */}
      <Grid container spacing={1.25} sx={{ mb: 1.25 }}>

        {/* Paid list */}
        <Grid item xs={4}>
          <Box sx={{ border: `1.5px solid #86EFAC`, borderRadius: '6px', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ bgcolor: '#DCFCE7', px: 1.25, py: '5px', borderBottom: '1px solid #86EFAC', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 13 }} />
              <Typography sx={{ fontWeight: 800, color: '#15803D', fontSize: '0.63rem', '@media print': { fontSize: '6.5pt' } }}>
                PAID ({paidFees.length})
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              {paidFees.length > 0 ? paidFees.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: '3px', borderBottom: i < paidFees.length - 1 ? '1px solid #BBF7D0' : 'none' }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#166534', '@media print': { fontSize: '6pt' } }}>
                    {f.feesGroup}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#16A34A', '@media print': { fontSize: '6pt' } }}>
                    {curr(f.paidAmount)}
                  </Typography>
                </Box>
              )) : (
                <Typography sx={{ fontSize: '0.6rem', color: '#6B7280' }}>No paid fees</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Unpaid list */}
        <Grid item xs={4}>
          <Box sx={{ border: '1.5px solid #FCA5A5', borderRadius: '6px', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ bgcolor: '#FEE2E2', px: 1.25, py: '5px', borderBottom: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ErrorIcon sx={{ color: '#DC2626', fontSize: 13 }} />
              <Typography sx={{ fontWeight: 800, color: '#B91C1C', fontSize: '0.63rem', '@media print': { fontSize: '6.5pt' } }}>
                UNPAID / PARTIAL ({unpaidFees.length})
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              {unpaidFees.length > 0 ? unpaidFees.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: '3px', borderBottom: i < unpaidFees.length - 1 ? '1px solid #FEE2E2' : 'none' }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#7F1D1D', '@media print': { fontSize: '6pt' } }}>
                    {f.feesGroup}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#DC2626', '@media print': { fontSize: '6pt' } }}>
                    {curr(f.balance)}
                  </Typography>
                </Box>
              )) : (
                <Typography sx={{ fontSize: '0.6rem', color: '#16A34A', fontWeight: 700 }}>✓ All fees paid</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Payment summary */}
        <Grid item xs={4}>
          <Box sx={{ border: `2px solid ${P}`, borderRadius: '6px', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ bgcolor: PD, px: 1.25, py: '5px' }}>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.63rem', '@media print': { fontSize: '6.5pt' } }}>
                PAYMENT SUMMARY
              </Typography>
            </Box>
            <Box sx={{ bgcolor: PL, p: 1 }}>
              {[
                { label: 'Total Amount',   val: totalAmount,   color: '#1F2937' },
                { label: 'Total Paid',     val: totalPaid,     color: '#16A34A' },
                { label: 'Total Discount', val: totalDiscount, color: '#16A34A' },
                { label: 'Total Fine',     val: totalFine,     color: '#DC2626' },
              ].map(({ label, val, color }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: '3px', borderBottom: `1px solid ${PLB}` }}>
                  <Typography sx={{ fontSize: '0.58rem', color: '#6B7280', '@media print': { fontSize: '6pt' } }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color, '@media print': { fontSize: '6.5pt' } }}>{curr(val)}</Typography>
                </Box>
              ))}
              <Box sx={{
                mt: '6px', px: 1, py: '6px', borderRadius: '4px',
                bgcolor: totalBalance > 0 ? P : '#16A34A',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.55rem', fontWeight: 700, '@media print': { fontSize: '5.5pt' } }}>
                  OUTSTANDING
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.8rem', '@media print': { fontSize: '8.5pt' } }}>
                  {curr(totalBalance)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* ══ INSTRUCTIONS + TERMS ════════════════════════════════════════════ */}
      <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
        <Grid item xs={6}>
          <Box sx={{ border: '1.5px solid #FCD34D', borderRadius: '6px', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ bgcolor: '#FEF3C7', px: 1.25, py: '5px', borderBottom: '1px solid #FCD34D' }}>
              <Typography sx={{ fontWeight: 800, color: '#92400E', fontSize: '0.63rem', '@media print': { fontSize: '6.5pt' } }}>
                ⚠ PAYMENT INSTRUCTIONS
              </Typography>
            </Box>
            <Box component="ul" sx={{ pl: 2, pr: 1, py: 0.75, m: 0 }}>
              {[
                'Pay before due date to avoid late fees.',
                'Modes: Cash · Cheque · DD · UPI · Card.',
                `Online: ${schoolInfo?.website || 'www.school.com/payment'}`,
                'Keep this bill & receipt for records.',
                `Queries: ${schoolInfo?.phone || 'School Office'}`,
              ].map((t) => (
                <Typography component="li" key={t}
                  sx={{ fontSize: '0.58rem', color: '#78350F', mb: '2px', '@media print': { fontSize: '6pt' } }}>
                  {t}
                </Typography>
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ border: `1px solid #E5E7EB`, borderRadius: '6px', overflow: 'hidden', height: '100%' }}>
            <Box sx={{ bgcolor: '#F3F4F6', px: 1.25, py: '5px', borderBottom: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontWeight: 800, color: '#374151', fontSize: '0.63rem', '@media print': { fontSize: '6.5pt' } }}>
                TERMS &amp; CONDITIONS
              </Typography>
            </Box>
            <Box sx={{ px: 1.25, py: 0.75 }}>
              {[
                'Late payment attracts fine as per school policy.',
                'Fees once paid will not be refunded under any circumstances.',
                `Cheque/DD in favour of "${schoolInfo?.name || 'School Name'}".`,
                'Discrepancy? Contact accounts department immediately.',
              ].map((t, i) => (
                <Typography key={i}
                  sx={{ fontSize: '0.58rem', color: '#4B5563', mb: '2px', display: 'flex', gap: '4px', '@media print': { fontSize: '6pt' } }}>
                  <span style={{ color: P, fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span> {t}
                </Typography>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <Box sx={{ borderTop: `2px solid ${P}`, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ fontSize: '0.55rem', color: '#9CA3AF', '@media print': { fontSize: '5.5pt' } }}>
            Generated: {fmtDate(new Date())} &nbsp;|&nbsp; {schoolInfo?.name || 'School Management System'}
          </Typography>
          <Typography sx={{ fontSize: '0.52rem', color: '#C4B5FD', fontStyle: 'italic', mt: '2px', '@media print': { fontSize: '5pt' } }}>
            Computer-generated document — no physical signature required. Contact school for verification.
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ borderTop: '1.5px solid #374151', pt: '4px', minWidth: 130, mt: 4 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.6rem', color: '#374151', '@media print': { fontSize: '6pt' } }}>
              Authorized Signatory
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ WATERMARK ═══════════════════════════════════════════════════════ */}
      {totalBalance > 0 && (
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) rotate(-45deg)',
          opacity: 0.03, pointerEvents: 'none', zIndex: 0,
        }}>
          <Typography sx={{ fontSize: '7.5rem', fontWeight: 900, color: P, whiteSpace: 'nowrap' }}>
            UNPAID
          </Typography>
        </Box>
      )}
    </Box>
  );
});

DemandBillTemplate.displayName = 'DemandBillTemplate';

/* ════════════════════════════════════════════════════════════════════════════
   DemandBillWithPrint  — wrapper for standalone preview (no print button)
════════════════════════════════════════════════════════════════════════════ */
const DemandBillWithPrint = ({ billData, schoolInfo }) => {
  const printRef = useRef(null);

  return (
    <Box sx={{ bgcolor: '#D1D5DB', minHeight: '100vh', py: 3 }}>

      {/* ── A4 Preview Card ── */}
      <Box sx={{
        width: '210mm',
        mx: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
        borderRadius: '4px',
        overflow: 'hidden',
        bgcolor: '#fff',
      }}>
        <DemandBillTemplate ref={printRef} billData={billData} schoolInfo={schoolInfo} />
      </Box>

    </Box>
  );
};

export { DemandBillTemplate };
export default DemandBillWithPrint;