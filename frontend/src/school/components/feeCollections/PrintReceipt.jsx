import { forwardRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

/* ════════════════════════════════════════════════════════════════════════════
   Global print styles — injected once into <head>
════════════════════════════════════════════════════════════════════════════ */
const PRINT_STYLE_ID = 'fee-receipt-print-styles';
const injectPrintStyles = () => {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = PRINT_STYLE_ID;
  el.textContent = `
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
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
      /* Ensure receipt is visible and positioned correctly */
      #fee-receipt-a4 {
        visibility: visible !important;
        display: block !important;
        position: relative !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #fee-receipt-a4 * {
        visibility: visible !important;
      }
    }
  `;
  document.head.appendChild(el);
};

/**
 * Professional Fee Receipt Component - A4 Optimized
 * Displays fee receipt in printable format with school branding
 */
const PrintReceipt = forwardRef(({ student, feeAssignments, schoolInfo }, ref) => {
  injectPrintStyles();

  // ─── Design Tokens ─────────────────────────────────────────────────────────
  const P = '#7C3AED';
  const PD = '#6D28D9';
  const PL = '#EDE9FE';
  const PLB = '#DDD6FE';
  const SUCCESS = '#10B981';
  const WARNING = '#F59E0B';
  const ERROR = '#EF4444';

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const curr = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v || 0);

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const fmtDateTime = () => {
    const now = new Date();
    return `${now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} ${now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  // ─── Calculate Totals ──────────────────────────────────────────────────────
  const grandTotal = {
    amount: feeAssignments.reduce((sum, f) => sum + (f.amount || 0), 0),
    paid: feeAssignments.reduce((sum, f) => sum + (f.paidAmount || 0), 0),
    fine: feeAssignments.reduce((sum, f) => sum + (f.fineAmount || 0), 0),
    discount: feeAssignments.reduce((sum, f) => sum + (f.discountAmount || 0), 0),
    balance: feeAssignments.reduce((sum, f) => sum + (f.balance || 0), 0),
  };

  // ─── Get School Info ───────────────────────────────────────────────────────
  const getSchoolInfo = () => {
    if (schoolInfo) return schoolInfo;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          name: user.schoolName || user.school?.name || 'School Name',
          address: user.schoolAddress || user.school?.address || 'School Address, City, State - PIN',
          phone: user.schoolPhone || user.school?.phone || user.phone || '+91 XXXXXXXXXX',
          email: user.schoolEmail || user.school?.email || user.email || 'info@school.com',
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return {
      name: 'School Name',
      address: 'School Address, City, State - PIN',
      phone: '+91 XXXXXXXXXX',
      email: 'info@school.com',
    };
  };

  const school = getSchoolInfo();
  const receiptNo = `RCP-${student?.admissionNo || 'XXXX'}-${Date.now().toString().slice(-6)}`;

  // ─── Table Cell Styles ─────────────────────────────────────────────────────
  const thSx = {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.65rem',
    py: '6px',
    px: '8px',
    borderBottom: 'none',
    letterSpacing: 0.3,
    whiteSpace: 'nowrap',
    '@media print': { fontSize: '6.5pt', py: '5px', px: '6px' },
  };

  const tdSx = {
    fontSize: '0.7rem',
    py: '6px',
    px: '8px',
    borderBottom: `1px solid ${PLB}`,
    '@media print': { fontSize: '7pt', py: '5px', px: '6px' },
  };

  const totalRowSx = {
    fontWeight: 800,
    fontSize: '0.72rem',
    py: '7px',
    px: '8px',
    borderBottom: 'none',
    background: PL,
    '@media print': { fontSize: '7.5pt', py: '6px', px: '6px' },
  };

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <Box
      ref={ref}
      id="fee-receipt-a4"
      sx={{
        width: '210mm',
        maxWidth: '210mm',
        minHeight: '297mm',
        mx: 'auto',
        p: '12mm',
        bgcolor: '#fff',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        boxSizing: 'border-box',
        position: 'relative',
        '@media print': { width: '100%', maxWidth: '100%', minHeight: 'auto', p: 0 },
      }}
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1.5,
          pb: 1.5,
          borderBottom: `3px solid ${P}`,
        }}
      >
        {/* Left — School Identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              flexShrink: 0,
              background: `linear-gradient(135deg,${PD},${P},#A78BFA)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px rgba(109,40,217,0.4)`,
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>
              {(school?.name || 'S').charAt(0).toUpperCase()}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                color: PD,
                fontSize: '1.1rem',
                letterSpacing: 0.3,
                lineHeight: 1.2,
                '@media print': { fontSize: '12pt' },
              }}
            >
              {school?.name || 'SCHOOL NAME'}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '0.65rem', mt: '3px', '@media print': { fontSize: '7pt' } }}>
              {school?.address || 'School Address, City, State - PIN'}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '0.65rem', '@media print': { fontSize: '7pt' } }}>
              📞 {school?.phone || '+91 XXXXXXXXXX'} · ✉ {school?.email || 'info@school.com'}
            </Typography>
          </Box>
        </Box>

        {/* Right — Receipt Badge */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <Box
            sx={{
              background: `linear-gradient(135deg,${SUCCESS},#059669)`,
              color: '#fff',
              px: 2.5,
              py: '8px',
              borderRadius: '10px 10px 10px 0',
              boxShadow: `0 4px 14px rgba(16,185,129,0.4)`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: 2, '@media print': { fontSize: '9pt' } }}>
              FEE RECEIPT
            </Typography>
          </Box>
          <Box
            sx={{
              border: `1.5px solid ${PLB}`,
              bgcolor: PL,
              px: 1.5,
              py: '4px',
              borderRadius: '0 0 8px 8px',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: P, fontSize: '0.65rem', '@media print': { fontSize: '6.5pt' } }}>
              #{receiptNo}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ RECEIPT INFO BAR ════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          border: `1.5px solid ${PLB}`,
          borderRadius: '8px',
          overflow: 'hidden',
          mb: 1.5,
          bgcolor: PL,
        }}
      >
        <Box sx={{ px: 1.5, py: '8px', borderRight: `1px solid ${PLB}` }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: 0.5, mb: '3px', '@media print': { fontSize: '6pt' } }}>
            Receipt Date & Time
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1F2937', '@media print': { fontSize: '7.5pt' } }}>
            {fmtDateTime()}
          </Typography>
        </Box>
        <Box sx={{ px: 1.5, py: '8px' }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: 0.5, mb: '3px', '@media print': { fontSize: '6pt' } }}>
            Payment Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 14, color: SUCCESS }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: SUCCESS, '@media print': { fontSize: '7.5pt' } }}>
              PAID
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ STUDENT INFORMATION ═════════════════════════════════════════════ */}
      <Box
        sx={{
          border: `1.5px solid ${PLB}`,
          borderRadius: '8px',
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            bgcolor: PL,
            px: 1.5,
            py: '6px',
            borderBottom: `1px solid ${PLB}`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: `linear-gradient(135deg,${P},#A78BFA)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.55rem', lineHeight: 1 }}>👤</Typography>
          </Box>
          <Typography sx={{ fontWeight: 800, color: PD, fontSize: '0.72rem', '@media print': { fontSize: '7.5pt' } }}>
            Student Information
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { label: 'Student Name', val: `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'N/A' },
            { label: 'Admission No.', val: student?.admissionNo || 'N/A' },
            { label: 'Class & Section', val: `${student?.class?.class_text || 'N/A'} – ${student?.section || 'N/A'}` },
            { label: "Father's Name", val: student?.fatherName || 'N/A' },
          ].map(({ label, val }, i) => (
            <Box
              key={label}
              sx={{
                px: 1.5,
                py: '8px',
                borderRight: i < 3 ? `1px solid ${PLB}` : 'none',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: P,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  lineHeight: 1.3,
                  mb: '3px',
                  '@media print': { fontSize: '6pt' },
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1F2937',
                  lineHeight: 1.3,
                  '@media print': { fontSize: '7.5pt' },
                }}
              >
                {val}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ FEE DETAILS TABLE ═══════════════════════════════════════════════ */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, borderBottom: `1.5px solid ${PLB}`, pb: '5px' }}>
          <Box sx={{ width: 3, height: 14, borderRadius: 1, background: `linear-gradient(180deg,${P},#A78BFA)` }} />
          <Typography sx={{ fontWeight: 800, color: PD, fontSize: '0.72rem', letterSpacing: 0.3, '@media print': { fontSize: '7.5pt' } }}>
            Fee Payment Details
          </Typography>
        </Box>
        <TableContainer sx={{ border: `1.5px solid ${PLB}`, borderRadius: '8px', overflow: 'hidden' }}>
          <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '100%' }}>
            <TableHead>
              <TableRow sx={{ background: `linear-gradient(135deg,${PD},${P})` }}>
                <TableCell sx={{ ...thSx, width: '5%' }}>#</TableCell>
                <TableCell sx={{ ...thSx, width: '15%' }}>Fees Group</TableCell>
                <TableCell sx={{ ...thSx, width: '13%' }}>Fees Code</TableCell>
                <TableCell sx={{ ...thSx, width: '10%' }}>Due Date</TableCell>
                <TableCell sx={{ ...thSx, width: '10%' }} align="right">Amount</TableCell>
                <TableCell sx={{ ...thSx, width: '12%' }}>Payment ID</TableCell>
                <TableCell sx={{ ...thSx, width: '9%' }}>Mode</TableCell>
                <TableCell sx={{ ...thSx, width: '10%' }}>Date</TableCell>
                <TableCell sx={{ ...thSx, width: '8%' }} align="right">Paid</TableCell>
                <TableCell sx={{ ...thSx, width: '8%' }} align="right">Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeAssignments.length > 0 ? (
                feeAssignments.map((fee, idx) => (
                  <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#FAF5FF' }}>
                    <TableCell sx={{ ...tdSx, fontWeight: 700, color: P }}>{idx + 1}</TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 600, color: PD }}>{fee.feeMaster?.feesGroup || 'N/A'}</TableCell>
                    <TableCell sx={{ ...tdSx, color: '#4B5563' }}>{fee.feeMaster?.feesCode || 'N/A'}</TableCell>
                    <TableCell sx={{ ...tdSx, color: '#4B5563' }}>{fmtDate(fee.dueDate)}</TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700 }} align="right">
                      {curr(fee.amount)}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, color: '#4B5563', fontSize: '0.65rem' }}>
                      {fee.payments?.length > 0 ? fee.payments[0].paymentId : '—'}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, color: '#4B5563' }}>
                      {fee.payments?.length > 0 ? fee.payments[0].paymentMode : '—'}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, color: '#4B5563' }}>
                      {fee.payments?.length > 0 ? fmtDate(fee.payments[0].paymentDate) : '—'}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700, color: SUCCESS }} align="right">
                      {curr(fee.paidAmount)}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, fontWeight: 700, color: fee.balance > 0 ? ERROR : SUCCESS }} align="right">
                      {curr(fee.balance)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3, fontSize: '0.75rem', color: '#6B7280' }}>
                    No fee details available
                  </TableCell>
                </TableRow>
              )}

              {/* Grand Total Row */}
              {feeAssignments.length > 0 && (
                <TableRow sx={{ borderTop: `2px solid ${P}` }}>
                  <TableCell colSpan={4} align="right" sx={{ ...totalRowSx, color: PD }}>
                    GRAND TOTAL
                  </TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, color: '#1F2937' }}>
                    {curr(grandTotal.amount)}
                  </TableCell>
                  <TableCell colSpan={3} sx={{ ...totalRowSx }} />
                  <TableCell align="right" sx={{ ...totalRowSx, color: SUCCESS, fontSize: '0.78rem' }}>
                    {curr(grandTotal.paid)}
                  </TableCell>
                  <TableCell align="right" sx={{ ...totalRowSx, color: grandTotal.balance > 0 ? ERROR : SUCCESS, fontSize: '0.78rem' }}>
                    {curr(grandTotal.balance)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ══ PAYMENT SUMMARY ═════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 1.5,
          mb: 1.5,
        }}
      >
        {[
          { label: 'Total Amount', val: grandTotal.amount, color: '#1F2937' },
          { label: 'Total Paid', val: grandTotal.paid, color: SUCCESS },
          { label: 'Total Discount', val: grandTotal.discount, color: WARNING },
          { label: 'Total Balance', val: grandTotal.balance, color: grandTotal.balance > 0 ? ERROR : SUCCESS },
        ].map(({ label, val, color }) => (
          <Box
            key={label}
            sx={{
              border: `1.5px solid ${PLB}`,
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ bgcolor: PL, px: 1.5, py: '5px', borderBottom: `1px solid ${PLB}` }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: 0.5, '@media print': { fontSize: '6pt' } }}>
                {label}
              </Typography>
            </Box>
            <Box sx={{ px: 1.5, py: '8px', bgcolor: '#fff' }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color, '@media print': { fontSize: '9pt' } }}>
                {curr(val)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ══ PAYMENT NOTE ════════════════════════════════════════════════════ */}
      <Box
        sx={{
          border: '1.5px solid #86EFAC',
          borderRadius: '8px',
          overflow: 'hidden',
          mb: 1.5,
        }}
      >
        <Box sx={{ bgcolor: '#DCFCE7', px: 1.5, py: '6px', borderBottom: '1px solid #86EFAC' }}>
          <Typography sx={{ fontWeight: 800, color: '#15803D', fontSize: '0.68rem', '@media print': { fontSize: '7pt' } }}>
            ✓ PAYMENT CONFIRMATION
          </Typography>
        </Box>
        <Box sx={{ px: 1.5, py: '8px', bgcolor: '#F0FDF4' }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#166534', lineHeight: 1.5, '@media print': { fontSize: '6.5pt' } }}>
            This receipt confirms that the above mentioned fee payment has been successfully received and recorded in our system. 
            Please keep this receipt for your records. For any queries, contact the school accounts department.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: PLB }} />

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '0.6rem', color: '#9CA3AF', '@media print': { fontSize: '6pt' } }}>
            Generated: {fmtDate(new Date())} | {school?.name || 'School Management System'}
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', color: '#C4B5FD', fontStyle: 'italic', mt: '3px', '@media print': { fontSize: '5.5pt' } }}>
            Computer-generated receipt — no physical signature required. Contact school for verification.
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ borderTop: '1.5px solid #374151', pt: '5px', minWidth: 140, mt: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#374151', '@media print': { fontSize: '6.5pt' } }}>
              Authorized Signatory
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ══ WATERMARK (if balance exists) ═══════════════════════════════════ */}
      {grandTotal.balance > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%) rotate(-45deg)',
            opacity: 0.03,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <Typography sx={{ fontSize: '6rem', fontWeight: 900, color: ERROR, whiteSpace: 'nowrap' }}>
            PARTIAL PAID
          </Typography>
        </Box>
      )}
    </Box>
  );
});

PrintReceipt.displayName = 'PrintReceipt';

export default PrintReceipt;
