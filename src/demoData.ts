export type Role = 'HR Manager' | 'HR Officer' | 'Employee'
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'
export type FindingStatus = 'Open' | 'Under Review' | 'Awaiting Employee' | 'Resolved' | 'Dismissed'
export type PageKey = 'overview' | 'imports' | 'departments' | 'employees' | 'issues' | 'assistant' | 'policies' | 'notifications' | 'reports' | 'mycorrections'

export interface Employee { id: string; name: string; department: string; title: string; quality: number; email: string; avatar: string }
export interface Finding { id: string; employeeId: string; employee: string; department: string; type: string; field: string; detail: string; severity: Severity; status: FindingStatus; date: string; row: number; recommendation: string; policy: string; maskedValue: string }

export const departments = [
  { name: 'Human Resources', short: 'HR', quality: 96, employees: 42, open: 4, color: '#36ba98' },
  { name: 'Information Technology', short: 'IT', quality: 93, employees: 78, open: 9, color: '#5a8dee' },
  { name: 'Finance', short: 'FIN', quality: 87, employees: 64, open: 17, color: '#f0ac59' },
  { name: 'Operations', short: 'OPS', quality: 81, employees: 112, open: 24, color: '#e9878f' },
  { name: 'Sales & Marketing', short: 'S&M', quality: 91, employees: 55, open: 11, color: '#ae91e8' },
]

export const employees: Employee[] = [
  { id: 'EMP-101', name: 'Aina Hassan', department: 'Human Resources', title: 'HR Executive', quality: 98, email: 'aina.hassan@example.test', avatar: 'AH' },
  { id: 'EMP-102', name: 'Daniel Tan', department: 'Information Technology', title: 'Software Engineer', quality: 95, email: 'daniel.tan@example.test', avatar: 'DT' },
  { id: 'EMP-103', name: 'Nur Iman', department: 'Finance', title: 'Accounts Executive', quality: 79, email: 'nur.iman@example.test', avatar: 'NI' },
  { id: 'EMP-104', name: 'Arif Rahman', department: 'Information Technology', title: 'Support Analyst', quality: 82, email: 'arif.rahman@example.test', avatar: 'AR' },
  { id: 'EMP-105', name: 'Sofia Lim', department: 'Operations', title: 'Operations Specialist', quality: 76, email: 'sofia.lim@example.test', avatar: 'SL' },
  { id: 'EMP-106', name: 'Hakim Ismail', department: 'Finance', title: 'Finance Analyst', quality: 91, email: 'hakim.ismail@example.test', avatar: 'HI' },
  { id: 'EMP-107', name: 'Priya Nair', department: 'Sales & Marketing', title: 'Marketing Manager', quality: 93, email: 'priya.nair@example.test', avatar: 'PN' },
  { id: 'EMP-108', name: 'Jia Wei', department: 'Operations', title: 'Logistics Coordinator', quality: 84, email: 'jia.wei@example.test', avatar: 'JW' },
]

export const initialFindings: Finding[] = [
  { id:'ISS-1024', employeeId:'EMP-103', employee:'Nur Iman', department:'Finance', type:'Sensitive information', field:'claim_description', detail:'A bank-account-like value was entered into the claim description.', severity:'Critical', status:'Open', date:'02 Nov 2026', row:24, recommendation:'Request a revised description without account details. Do not copy the original value into a message.', policy:'CLAIM-PII-001', maskedValue:'Account ****6789' },
  { id:'ISS-1025', employeeId:'EMP-105', employee:'Sofia Lim', department:'Operations', type:'Possible duplicate claim', field:'claim_id', detail:'Another claim has the same employee, date, category and amount. Review before reimbursement.', severity:'High', status:'Under Review', date:'01 Nov 2026', row:39, recommendation:'Compare original receipts and submission timestamps. Confirm whether these claims are distinct.', policy:'CLAIM-DUP-002', maskedValue:'CLM-1051' },
  { id:'ISS-1026', employeeId:'EMP-104', employee:'Arif Rahman', department:'Information Technology', type:'Missing attendance checkout', field:'check_out', detail:'Clock-out is missing after the expected shift window.', severity:'Medium', status:'Open', date:'01 Nov 2026', row:61, recommendation:'Ask the employee to confirm their end time and manager approval.', policy:'ATT-003', maskedValue:'(missing)' },
  { id:'ISS-1027', employeeId:'EMP-106', employee:'Hakim Ismail', department:'Finance', type:'Invalid claim amount', field:'claim_amount', detail:'The claim amount is negative, without a recorded refund transaction.', severity:'High', status:'Open', date:'31 Oct 2026', row:83, recommendation:'Confirm the receipt amount and whether this should be a refund record.', policy:'CLAIM-VAL-003', maskedValue:'-RM 145.00' },
  { id:'ISS-1028', employeeId:'EMP-108', employee:'Jia Wei', department:'Operations', type:'Leave and attendance overlap', field:'leave_start', detail:'Approved full-day leave appears on a day with full-day attendance.', severity:'Medium', status:'Open', date:'30 Oct 2026', row:95, recommendation:'Check leave amendment and shift records before deciding which is correct.', policy:'LEV-005', maskedValue:'2026-10-28' },
  { id:'ISS-1029', employeeId:'EMP-103', employee:'Nur Iman', department:'Finance', type:'Missing employee email', field:'work_email', detail:'The work email is empty in an employee master record.', severity:'Low', status:'Resolved', date:'28 Oct 2026', row:112, recommendation:'Confirm the valid work email and update the employee master record.', policy:'EMP-001', maskedValue:'(empty)' },
]

export const policyCards = [
  { code:'CLAIMS-2026', title:'Claims & Reimbursement Policy', version:'1.2', owner:'HR & Finance', description:'Receipt requirements, valid claim categories and prohibited sensitive details.', rules:8 },
  { code:'PRIVACY-2026', title:'Personal Data Protection Standard', version:'1.0', owner:'Data Protection Officer', description:'Handling and masking identity, contact and payment information.', rules:7 },
  { code:'ATTENDANCE-2026', title:'Attendance Recording Policy', version:'1.1', owner:'HR Operations', description:'Check-in/out standards, shift exceptions and correction requests.', rules:5 },
  { code:'LEAVE-2026', title:'Leave Management Policy', version:'1.0', owner:'HR Operations', description:'Leave entitlements, overlapping dates, approval and amendment process.', rules:6 },
  { code:'EMP-DATA-2026', title:'Employee Master Data Standard', version:'1.1', owner:'HR Systems', description:'Required employee fields, department codes and update frequency.', rules:6 },
  { code:'CORRECTION-2026', title:'Data Correction Procedure', version:'1.0', owner:'HR Manager', description:'Review, notify, revalidate, approve and keep an audit trail.', rules:5 },
]

export const trend = [
  { month:'Jun', score:81 }, { month:'Jul', score:83 }, { month:'Aug', score:85 },
  { month:'Sep', score:87 }, { month:'Oct', score:90 }, { month:'Nov', score:91 },
]

export const sampleCsv = `record_type,record_id,employee_id,employee_name,department,event_date,claim_id,claim_amount,claim_description,leave_start,leave_end,check_in,check_out,approval_status
claim,REC-0001,EMP-103,Nur Iman,Finance,2026-10-30,CLM-1001,120,Taxi reimbursement,,,,,Submitted
claim,REC-0002,EMP-103,Nur Iman,Finance,2026-10-30,CLM-1002,155,Account 1234-5678-9012 for reimbursement,,,,,Submitted
claim,REC-0003,EMP-105,Sofia Lim,Operations,2026-10-31,CLM-1003,79,Parking,,,,,Submitted
claim,REC-0004,EMP-105,Sofia Lim,Operations,2026-10-31,CLM-1003,79,Parking,,,,,Submitted
claim,REC-0005,EMP-106,Hakim Ismail,Finance,2026-10-31,CLM-1005,-45,Meal allowance,,,,,Submitted
attendance,REC-0006,EMP-104,Arif Rahman,Information Technology,2026-11-01,,,,,,2026-11-01T09:00:00,,Approved
leave,REC-0007,EMP-108,Jia Wei,Operations,2026-10-28,,,,2026-10-30,2026-10-28,,,Approved`

export interface CsvRow { [key: string]: string }

// Handles quoted commas, escaped quotes and newlines for local demo CSVs.
export function parseCsv(text: string): CsvRow[] {
  const cells: string[][] = []; let row: string[] = []; let cell=''; let quoted=false
  for(let i=0;i<text.length;i++) {
    const c=text[i]
    if(c==='"') { if(quoted && text[i+1]==='"') {cell+='"';i++} else quoted=!quoted }
    else if(c===',' && !quoted) {row.push(cell);cell=''}
    else if((c==='\n'||c==='\r') && !quoted) {if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))cells.push(row);row=[];cell=''}
    else cell+=c
  }
  row.push(cell);if(row.some(x=>x.trim()))cells.push(row)
  if(cells.length<2)return []
  const headers=cells.shift()!.map(s=>s.trim().replace(/^\uFEFF/,''))
  return cells.map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]??'').trim()])))
}

export function scanDemoRows(rows: CsvRow[]): Finding[] {
  const found: Finding[]=[];const claimIds=new Map<string,number>()
  const add=(row:CsvRow,i:number,type:string,field:string,severity:Severity,detail:string,policy:string,recommendation:string,maskedValue:string)=>found.push({
    id:`CSV-${String(found.length+1).padStart(3,'0')}`,employeeId:row.employee_id||'(missing)',employee:row.employee_name||row.employee_id||'Unknown employee',department:row.department||'Unmapped',type,field,severity,detail,policy,recommendation,maskedValue,row:i+2,date:'Current upload',status:'Open'
  })
  rows.forEach((r,i)=>{
    if(!r.employee_id)add(r,i,'Missing employee ID','employee_id','High','Employee ID is required for every HR event.','EMP-001','Ask HR to confirm the master employee ID.','(empty)')
    if(r.record_type==='claim'){
      if(r.claim_id){if(claimIds.has(r.claim_id))add(r,i,'Duplicate claim ID','claim_id','High',`Claim ID also appears on CSV row ${claimIds.get(r.claim_id)}.`,'CLAIM-DUP-002','Compare receipts and verify whether the submissions are distinct.',r.claim_id);else claimIds.set(r.claim_id,i+2)}
      if(/(?:\d[ -]?){10,18}/.test(r.claim_description??''))add(r,i,'Sensitive information','claim_description','Critical','Possible account number in a claim description.','CLAIM-PII-001','Remove bank details from claim comments and request a corrected description.','Sensitive number masked')
      if(r.claim_amount && Number(r.claim_amount)<0)add(r,i,'Invalid claim amount','claim_amount','High','Negative claim amount needs explicit refund handling.','CLAIM-VAL-003','Confirm receipt/refund classification.',r.claim_amount)
      if(r.claim_amount && Number(r.claim_amount)>2000)add(r,i,'Unusual claim amount','claim_amount','Medium','Amount exceeds the sample rule-of-thumb review threshold of RM 2,000.','CLAIM-ANOM-004','Review category, receipt and approved exception. This is not proof of fraud.',`RM ${r.claim_amount}`)
    }
    if(r.record_type==='attendance'&&r.check_in&&!r.check_out)add(r,i,'Missing checkout','check_out','Medium','Check-out value missing.','ATT-003','Request confirmed end time from employee or manager.','(empty)')
    if(r.record_type==='leave'&&r.leave_start&&r.leave_end&&r.leave_end<r.leave_start)add(r,i,'Invalid leave dates','leave_end','High','End date is earlier than start date.','LEV-002','Confirm the leave dates and resubmit the record.',r.leave_end)
  })
  return found
}
