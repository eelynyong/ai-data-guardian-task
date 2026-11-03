
import express from 'express'
import { requireAuth, requireHr } from './auth.mjs'

const app = express()
const PORT = 3001

// Basic settings for our local proof of concept
app.disable('x-powered-by')
app.use(express.json({ limit: '8mb' }))

// Route 1: Check that the middleware is running
app.get('/api/v1/health', (req, res) => {
  res.json({
    ok: true,
    service: 'AI Data Guardian Middleware',
    message: 'Express is running successfully'
  })
})

// Route 2: Analyze synthetic HR records
app.post(
  '/api/v1/quality/analyze', 
  requireAuth,
  requireHr,
  (req, res) => {
    const rows = req.body?.rows

  // Check the request before processing it
  if (
    !Array.isArray(rows) ||
    rows.length === 0 ||
    rows.length > 2500 ||
    rows.some(row =>
      !row ||
      typeof row !== 'object' ||
      Array.isArray(row) ||
      typeof row.record_type !== 'string'
    )
  ) {
    return res.status(400).json({
      error: 'Please provide 1 to 2500 valid CSV rows.'
    })
  }

  const findings = []
  const seenClaimIds = new Map()

  // Convert a problem into the format expected by React
  function addFinding(
    row, index, type, field, severity,
    detail, policy, recommendation, maskedValue
  ) {
    findings.push({
      id: `CSV-${String(findings.length + 1).padStart(3, '0')}`,
      employeeId: row.employee_id || '(missing)',
      employee: row.employee_name || row.employee_id || 'Unknown',
      department: row.department || 'Unmapped',
      type,
      field,
      severity,
      detail,
      policy,
      recommendation,
      maskedValue,
      row: index + 2,
      date: 'Current upload',
      status: 'Open'
    })
  }

  // Inspect each CSV record
  rows.forEach((row, index) => {
    const recordType = row.record_type
    const employeeId = row.employee_id || ''

    // Rule 1: Missing employee ID
    if (!employeeId.trim()) {
      addFinding(
        row, index, 'Missing employee ID',
        'employee_id', 'High',
        'This record does not contain an employee ID.',
        'EMP-001',
        'Ask HR to verify the correct employee ID.',
        '(empty)'
      )
    }

    // Rules for claim records
    if (recordType === 'claim') {
      const claimId = row.claim_id || ''
      const amountText = row.claim_amount || ''
      const description = row.claim_description || ''

      // Rule 2: Duplicate claim ID
      if (claimId) {
        if (seenClaimIds.has(claimId)) {
          addFinding(
            row, index, 'Duplicate claim ID',
            'claim_id', 'High',
            `This claim ID also appears on CSV row ${seenClaimIds.get(claimId)}.`,
            'CLAIM-DUP-002',
            'Compare receipts before approving reimbursement.',
            claimId
          )
        } else {
          seenClaimIds.set(claimId, index + 2)
        }
      }

      // Rule 3: Sensitive information in a claim
      const accountLikeNumber = /(?:\d[ -]?){10,18}/

      if (accountLikeNumber.test(description)) {
        addFinding(
          row, index, 'Sensitive information',
          'claim_description', 'Critical',
          'Possible bank or account number in the claim description.',
          'CLAIM-PII-001',
          'Ask the employee to remove account details.',
          '[SENSITIVE VALUE MASKED]'
        )
      }

      // Rule 4: Invalid claim amount
      if (amountText && (
        !Number.isFinite(Number(amountText)) ||
        Number(amountText) < 0
      )) {
        addFinding(
          row, index, 'Invalid claim amount',
          'claim_amount', 'High',
          'The claim amount is invalid or negative.',
          'CLAIM-VAL-003',
          'Verify the receipt amount and refund status.',
          '[INVALID AMOUNT]'
        )
      }

      // Rule 5: Unusually large claim
      if (
        amountText &&
        Number.isFinite(Number(amountText)) &&
        Number(amountText) > 2000
      ) {
        addFinding(
          row, index, 'Unusual claim amount',
          'claim_amount', 'Medium',
          'Claim exceeds the RM 2000 sample review threshold.',
          'CLAIM-ANOM-004',
          'Check the receipt and any approved exception.',
          '[HIGH AMOUNT]'
        )
      }
    }

    // Rule 6: Missing attendance checkout
    if (
      recordType === 'attendance' &&
      row.check_in &&
      !row.check_out
    ) {
      addFinding(
        row, index, 'Missing checkout',
        'check_out', 'Medium',
        'Employee has a check-in but no checkout time.',
        'ATT-003',
        'Ask employee or supervisor to confirm the checkout time.',
        '(empty)'
      )
    }

    // Rule 7: Invalid leave dates
    if (
      recordType === 'leave' &&
      row.leave_start &&
      row.leave_end &&
      row.leave_end < row.leave_start
    ) {
      addFinding(
        row, index, 'Invalid leave dates',
        'leave_end', 'High',
        'Leave end date is earlier than leave start date.',
        'LEV-002',
        'Ask the employee to verify the leave dates.',
        '[INVALID DATE]'
      )
    }
  })

  // Send the result to the frontend
  res.json({
    rowsAnalyzed: rows.length,
    totalFindings: findings.length,
    findings
  })
})

// Return a safe error message for invalid requests
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request is too large.'
    })
  }

  res.status(400).json({
    error: 'Unable to process the request.'
  })
})

// Start the server on this computer only
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Middleware running at http://127.0.0.1:${PORT}`)
})
