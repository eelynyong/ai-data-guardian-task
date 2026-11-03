import { useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowRight, Bell, BookOpen, CalendarDays,
  Check, CheckCheck, ChevronDown, ChevronRight, CircleAlert, ClipboardCheck,
  Clock3, CloudUpload, Download, FileCheck2, FileClock, FileSpreadsheet,
  FileText, Filter, Fingerprint, Gauge, LayoutDashboard, LockKeyhole,
  Menu, Search, Send, Shield,
  ShieldAlert, ShieldCheck, Sparkles, TrendingUp, UploadCloud, Users, Wallet,
  X, type LucideIcon,
} from 'lucide-react'
import {
  departments, employees, initialFindings, policyCards, sampleCsv,
  parseCsv, scanDemoRows, trend,
  type CsvRow, type Employee, type Finding, type FindingStatus, type PageKey,
  type Severity,
} from './demoData'

type AppProps = {
  userName: string
  userRole: string
  onLogout: () => void
}

type NavItem = { key: PageKey; title: string; icon: LucideIcon }
const hrNav: NavItem[] = [
  {key:'overview',title:'Overview',icon:LayoutDashboard}, {key:'imports',title:'Data imports',icon:FileSpreadsheet},
  {key:'departments',title:'Departments',icon:Users}, {key:'employees',title:'Employees',icon:Fingerprint},
  {key:'issues',title:'Issue center',icon:CircleAlert}, {key:'assistant',title:'AI assistant',icon:Sparkles},
  {key:'policies',title:'Policy library',icon:BookOpen}, {key:'notifications',title:'Notifications',icon:Bell},
  {key:'reports',title:'Reports',icon:FileText},
]
const employeeNav: NavItem[] = [
  {key:'mycorrections',title:'My corrections',icon:ClipboardCheck},
  {key:'notifications',title:'Notifications',icon:Bell},
  {key:'policies',title:'Policies',icon:BookOpen},
]

const titleMap: Record<PageKey,string> = {
  overview:'HR overview', imports:'Data imports', departments:'Departments', employees:'Employee records',
  issues:'Issue center', assistant:'AI assistant', policies:'Policy library', notifications:'Notifications',
  reports:'Quality reports', mycorrections:'My corrections',
}
const severityOrder: Record<Severity,number>={Critical:0,High:1,Medium:2,Low:3}
const statusClass=(value:string)=>value.toLowerCase().replaceAll(' ','-')

function StatusPill({value}:{value:string}) {return <span className={`pill pill-${statusClass(value)}`}>{value}</span>}
function ScoreTag({score}:{score:number}) {return <span className={`score-tag ${score>=92?'great':score>=85?'okay':'low'}`}>{score}%</span>}
function IconBadge({icon:Icon,tone='blue'}:{icon:LucideIcon,tone?:string}) {return <span className={`icon-badge ${tone}`}><Icon size={20}/></span>}
function EmptyState({icon:Icon,title,description}:{icon:LucideIcon,title:string,description:string}) {return <div className="empty-state"><Icon size={32}/><strong>{title}</strong><p>{description}</p></div>}

function Metric({label,value,note,icon:Icon,tone='blue',change}:{label:string,value:string,note:string,icon:LucideIcon,tone?:string,change?:string}) {
  return <div className="metric-card"><div className="metric-top"><span>{label}</span><IconBadge icon={Icon} tone={tone}/></div><div className="metric-value">{value}</div><div className="metric-bottom">{change&&<span className="metric-change"><TrendingUp size={14}/>{change}</span>}<span>{note}</span></div></div>
}

function RecordTable({rows,findings,onOpen}:{rows:CsvRow[],findings:Finding[],onOpen:(f:Finding)=>void}) {
  if(rows.length===0)return <EmptyState icon={FileSpreadsheet} title="No CSV records yet" description="Upload your own synthetic CSV or load the sample to review problem cells."/>
  const headers=Object.keys(rows[0]).slice(0,14)
  return <div className="table-scroller"><table className="data-table spreadsheet"><thead><tr><th>CSV row</th>{headers.map(h=><th key={h}>{h.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{rows.slice(0,80).map((row,index)=><tr key={index}><td className="muted">{index+2}</td>{headers.map(h=>{const issue=findings.find(f=>f.row===index+2&&f.field===h);const raw=row[h]??'';const preview=issue?.type==='Sensitive information'?'•••••• [masked]':(raw||'—');return <td key={h} className={issue?'cell-issue':''}>{issue?<button className="cell-btn" title={`Open ${issue.type} finding`} onClick={()=>onOpen(issue)}><ShieldAlert size={13}/>{preview}</button>:preview}</td>})}</tr>)}</tbody></table></div>
}

export default function App(props: AppProps) {
  const [page, setPage] = useState<PageKey>(
  props.userRole === 'Employee' ? 'mycorrections' : 'overview'
)
  const role = props.userRole
  const [department,setDepartment]=useState('All departments')
  const [period,setPeriod]=useState('November 2026')
  const [findings,setFindings]=useState<Finding[]>(initialFindings)
  const [selectedIssue,setSelectedIssue]=useState<Finding|null>(null)
  const [selectedEmployee,setSelectedEmployee]=useState<Employee|null>(null)
  const [uploadRows,setUploadRows]=useState<CsvRow[]>([])
  const [uploadName,setUploadName]=useState('')
  const [uploadError,setUploadError]=useState('')
  const [activeImportTab,setActiveImportTab]=useState<'review'|'history'>('review')
  const [search,setSearch]=useState('')
  const [severityFilter,setSeverityFilter]=useState('All severities')
  const [assistantPrompt,setAssistantPrompt]=useState('Why is the Finance department below the data quality target?')
  const [assistantResponse,setAssistantResponse]=useState('')
  const [menuOpen,setMenuOpen]=useState(false)
  const [notice,setNotice]=useState('')
  const fileRef=useRef<HTMLInputElement>(null)
  const scopedFindings=useMemo(()=>findings.filter(f=>department==='All departments'||f.department===department),[findings,department])
  const openFindings=scopedFindings.filter(f=>!['Resolved','Dismissed'].includes(f.status))
  const scopedEmployees=employees.filter(e=>department==='All departments'||e.department===department)
  const issueSummary=findings.filter(f=>f.status==='Awaiting Employee').length

  function navigate(to:PageKey){setPage(to);setSearch('');setSelectedEmployee(null);setMenuOpen(false)}
  function changeStatus(id:string,status:FindingStatus){setFindings(old=>old.map(f=>f.id===id?{...f,status}:f));setSelectedIssue(old=>old?.id===id?{...old,status}:old);setNotice(status==='Awaiting Employee'?'An in-app employee request was created (demo only).':`Issue moved to ${status.toLowerCase()}.`)}
  function openIssue(f:Finding){setSelectedIssue(f);setNotice('')}
  
async function loadRows(rows: CsvRow[], name: string) {
  setUploadRows(rows)
  setUploadName(name)
  setUploadError('')
  setActiveImportTab('review')

  try {
    // Send CSV rows to our Express middleware
    const response = await fetch('/api/v1/quality/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rows })
    })

    if (!response.ok) {
      throw new Error('Middleware returned an error.')
    }

    const result: {
      rowsAnalyzed: number
      totalFindings: number
      findings: Finding[]
    } = await response.json()

    // Use the findings returned by Express
    setFindings([
      ...initialFindings,
      ...result.findings
    ])

    setNotice(
      `Express analyzed ${result.rowsAnalyzed} rows and found ` +
      `${result.totalFindings} new issues.`
    )

  } catch (error) {
    // If Express is offline, show a clear warning
    setUploadError(
      'Cannot reach Express middleware. ' +
      'Please start the server on port 3001.'
    )

    // Keep the frontend demo usable
    const localFindings = scanDemoRows(rows)

    setFindings([
      ...initialFindings,
      ...localFindings
    ])

    setNotice(
      'Middleware unavailable. Local demo scan was used instead.'
    )
  }
}

  async function readFile(file:File){if(file.size>3_000_000){setUploadError('Choose a CSV smaller than 3 MB for this browser-only demo.');return}if(!file.name.toLowerCase().endsWith('.csv')){setUploadError('Only .csv files are supported in this starter.');return}const text=await file.text();const rows=parseCsv(text);if(!rows.length||!rows[0].record_type){setUploadError('CSV must contain record_type and at least one data row. See DATA_DICTIONARY.md.');return}loadRows(rows,file.name)}
  function exportReport(){const safe=(s:string)=>{const v=/^[\s]*[=+\-@]/.test(s)?`'${s}`:s;return `"${v.replaceAll('"','""')}"`};const header='id,type,department,severity,status,policy\n';const body=scopedFindings.map(f=>[f.id,f.type,f.department,f.severity,f.status,f.policy].map(safe).join(',')).join('\n');const blob=new Blob([header+body],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='ai-data-guardian-demo-issues.csv';anchor.click();URL.revokeObjectURL(url);setNotice('Downloaded a local demo findings summary; no private cell values are included.')}
  const isEmployee=role==='Employee'

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen?'sidebar-open':''}`}>
      <div className="brand" onClick={()=>navigate(isEmployee?'mycorrections':'overview')} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&navigate('overview')}><span className="brand-mark"><ShieldCheck size={25}/></span><span><strong>AI Data Guardian</strong><small>HR QUALITY PLATFORM</small></span></div>
      <div className="workspace-switch"><div className="workspace-avatar">AD</div><div><strong>Acme Demo HR</strong><span>Sample workspace</span></div><ChevronDown size={15}/></div>
      <div className="nav-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{(isEmployee?employeeNav:hrNav).map(({key,title,icon:Icon})=><button key={key} className={`nav-link ${page===key?'active':''}`} onClick={()=>navigate(key)}><Icon size={18}/><span>{title}</span>{key==='issues'&&openFindings.length>0?<span className="nav-count">{openFindings.length}</span>:null}{key==='mycorrections'&&issueSummary>0?<span className="nav-count">{issueSummary}</span>:null}</button>)}</nav>
      <div className="sidebar-bottom"><div className="security-note"><Shield size={18}/><span>Protected by design<strong>Local demonstration</strong></span></div><button className="sidebar-help" onClick={()=>navigate('policies')}><BookOpen size={17}/>How it works<ArrowRight size={16}/></button></div>
    </aside>
    {menuOpen&&<button aria-label="Close sidebar" className="mobile-backdrop" onClick={()=>setMenuOpen(false)}/>}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={20}/>
          </button>
          <span className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{titleMap[page]}</strong></span>
        </div>
        <div className="topbar-right">
          <span className="demo-badge"><span className="dot"/> DEMO MODE</span>
          <button className="icon-button" aria-label="Open notifications" onClick={() => navigate('notifications')}>
            <Bell size={19}/>{issueSummary > 0 && <span className="notification-dot"/>}
          </button>
          <div className="user-control">
            <div className="user-avatar">
              {props.userName.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase() || 'HR'}
            </div>
            <div className="user-meta">
              <strong>{props.userName}</strong>
              <span>{role}</span>
            </div>
            <button type="button" className="button secondary small" onClick={props.onLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="content-wrap">
        {notice&&<div className="toast" role="status"><Check size={17}/>{notice}<button aria-label="Dismiss notification" onClick={()=>setNotice('')}><X size={16}/></button></div>}
        {!isEmployee&&['overview','departments','employees','issues','reports'].includes(page)&&<div className="filter-strip"><div className="filter-group"><Filter size={15}/><select value={department} onChange={e=>setDepartment(e.target.value)} aria-label="Filter by department"><option>All departments</option>{departments.map(d=><option key={d.name}>{d.name}</option>)}</select></div><div className="filter-group"><CalendarDays size={15}/><select value={period} onChange={e=>setPeriod(e.target.value)} aria-label="Reporting period"><option>November 2026</option><option>October 2026</option><option>Last 3 months</option><option>Year to date</option></select></div><span className="filter-note">Illustrative scores · {period}</span></div>}

        {page==='overview'&&!isEmployee&&<>
          <div className="page-heading"><div><p className="eyebrow">MONDAY, 2 NOVEMBER 2026</p><h1>Good morning, {props.userName} <span className="wave">✳</span></h1><p>Monitor employee records, claims, leave and attendance in one place.</p></div><button className="button primary" onClick={()=>navigate('imports')}><UploadCloud size={17}/> Upload data</button></div>
          <div className="metrics-grid"><Metric label="Overall data quality" value={department==='All departments'?'91.4%':`${departments.find(d=>d.name===department)?.quality??91}%`} note="Target: 95%" icon={Gauge} tone="blue" change="+2.4%"/><Metric label="Claims processed" value="1,284" note="36 records flagged" icon={Wallet} tone="purple"/><Metric label="Leave requests" value="748" note="14 need attention" icon={CalendarDays} tone="yellow"/><Metric label="Attendance records" value="5,420" note="62 anomalies found" icon={Clock3} tone="teal"/></div>
          <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Department quality score</h2><p>Latest completed demo snapshot</p></div><button className="text-link" onClick={()=>navigate('departments')}>View all <ArrowRight size={15}/></button></div><div className="dept-bars">{departments.filter(d=>department==='All departments'||d.name===department).map(d=><button className="dept-bar-row" key={d.name} onClick={()=>{setDepartment(d.name);navigate('departments')}}><span className="dept-label">{d.name}</span><span className="bar-track"><span style={{width:`${d.quality}%`,background:d.color}}/></span><strong>{d.quality}%</strong></button>)}</div><div className="panel-footer"><span className="legend-dot green"/> Excellent 95%+ <span className="legend-dot amber"/> Needs attention &lt; 90%</div></section><section className="panel"><div className="panel-heading"><div><h2>Quality trend</h2><p>Six-month improvement</p></div><span className="soft-badge positive"><TrendingUp size={13}/> +10%</span></div><div className="trend-graph">{trend.map(t=><div className="trend-column" key={t.month}><span className="trend-val">{t.score}%</span><div className="trend-track"><span style={{height:`${t.score}%`}}/></div><small>{t.month}</small></div>)}</div><div className="panel-footer"><span className="legend-dot indigo"/> Overall data quality score</div></section></div>
          <div className="dashboard-grid lower"><section className="panel"><div className="panel-heading"><div><h2>Recent issues</h2><p>Findings requiring HR action</p></div><button className="text-link" onClick={()=>navigate('issues')}>Issue center <ArrowRight size={15}/></button></div><div className="issue-list">{openFindings.slice(0,4).map(f=><button className="issue-row" key={f.id} onClick={()=>openIssue(f)}><span className={`issue-dot ${f.severity.toLowerCase()}`}/><span><strong>{f.type}</strong><small>{f.employee} · {f.department}</small></span><StatusPill value={f.severity}/><ChevronRight size={15}/></button>)}</div></section><section className="panel recommendation-panel"><div className="panel-heading"><div><h2><Sparkles size={18}/> AI insights preview</h2><p>Rule-based demo summary</p></div><span className="soft-badge purple">BETA</span></div><div className="insight-content"><span className="insight-icon"><Sparkles size={22}/></span><strong>Focus on Finance and Operations</strong><p>These departments have the lowest illustrative data-quality scores. Start with sensitive details in claims and missing attendance records.</p><button className="button secondary" onClick={()=>navigate('assistant')}>Explore recommendations <ArrowRight size={16}/></button></div></section></div>
        </>}

        {page==='departments'&&!isEmployee&&<><div className="page-heading"><div><p className="eyebrow">QUALITY MONITORING</p><h1>Departments</h1><p>Compare HR record quality by department, then drill into employee records.</p></div></div><div className="department-cards">{departments.filter(d=>department==='All departments'||d.name===department).map(d=><button className="department-card" key={d.name} onClick={()=>{setDepartment(d.name);navigate('employees')}}><div className="dep-top"><span className="dep-monogram" style={{background:`${d.color}1d`,color:d.color}}>{d.short}</span><ScoreTag score={d.quality}/></div><h3>{d.name}</h3><p>{d.employees} employees · {d.open} open findings</p><div className="bar-track"><span style={{width:`${d.quality}%`,background:d.color}}/></div><span className="card-link">View employees <ArrowRight size={15}/></span></button>)}</div></>}

        {page==='employees'&&!isEmployee&&<><div className="page-heading"><div><p className="eyebrow">EMPLOYEE RECORDS</p><h1>Employees</h1><p>Quality scores describe HR record completeness and validity, not job performance.</p></div></div><section className="panel"><div className="table-toolbar"><label className="searchbox"><Search size={17}/><input placeholder="Search name or employee ID..." value={search} onChange={e=>setSearch(e.target.value)}/></label><span className="muted">{scopedEmployees.length} sample employees</span></div><div className="table-scroller"><table className="data-table"><thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Position</th><th>Record quality</th><th></th></tr></thead><tbody>{scopedEmployees.filter(e=>(e.name+' '+e.id).toLowerCase().includes(search.toLowerCase())).map(e=><tr key={e.id}><td><div className="person"><span className="avatar">{e.avatar}</span><span><strong>{e.name}</strong><small>{e.email}</small></span></div></td><td className="mono muted">{e.id}</td><td>{e.department}</td><td className="muted">{e.title}</td><td><ScoreTag score={e.quality}/></td><td><button className="icon-button" title="View employee" onClick={()=>setSelectedEmployee(e)}><ChevronRight size={18}/></button></td></tr>)}</tbody></table></div></section></>}

        {page==='imports'&&!isEmployee&&<><div className="page-heading"><div><p className="eyebrow">DATA INGESTION</p><h1>Data imports</h1><p>Upload a synthetic CSV to see row-level quality findings instantly in your browser.</p></div><button className="button secondary" onClick={()=>{loadRows(parseCsv(sampleCsv),'built-in-sample.csv')}}><FileCheck2 size={17}/> Load example</button></div><div className="import-layout"><section className="panel upload-panel"><div className="panel-heading"><div><h2>Upload your CSV</h2><p>Synthetic CSV rows are checked by your local Express middleware.</p></div><IconBadge icon={CloudUpload} tone="blue"/></div><button className="upload-zone" onClick={()=>fileRef.current?.click()}><UploadCloud size={30}/><strong>Click to choose a CSV file</strong><span>Supports sample HR event CSV, up to 3 MB</span><span className="button secondary small">Browse files</span></button><input ref={fileRef} className="visually-hidden" aria-label="Choose CSV file" type="file" accept=".csv,text/csv" onChange={e=>e.target.files?.[0]&&void readFile(e.target.files[0])}/>{uploadError&&<p className="form-error"><CircleAlert size={15}/>{uploadError}</p>}<div className="upload-tips"><strong><ShieldCheck size={16}/> Before uploading</strong><p>Use synthetic data only. The full version will validate access, store files privately and perform server-side scanning.</p></div></section><section className="panel import-summary"><div className="panel-heading"><div><h2>Latest analysis</h2><p>{uploadName||'No upload selected'}</p></div><span className="soft-badge">Express API demo</span></div><div className="import-stats"><div><strong>{uploadRows.length.toLocaleString()}</strong><span>Rows analyzed</span></div><div><strong>{findings.filter(f=>f.id.startsWith('CSV-')).length}</strong><span>New findings</span></div><div><strong>{new Set(uploadRows.map(r=>r.department).filter(Boolean)).size}</strong><span>Departments</span></div></div><div className="import-note"><FileClock size={20}/><span>The built-in sample intentionally includes prohibited account details, a duplicate claim and a negative amount.</span></div></section></div><section className="panel"><div className="panel-heading"><div><h2>CSV document review</h2><p>Click a red cell to inspect the rule and recommended action</p></div><div className="tabs"><button className={activeImportTab==='review'?'selected':''} onClick={()=>setActiveImportTab('review')}>Review rows</button><button className={activeImportTab==='history'?'selected':''} onClick={()=>setActiveImportTab('history')}>Upload history</button></div></div>{activeImportTab==='review'?<RecordTable rows={uploadRows} findings={findings.filter(f=>f.id.startsWith('CSV-'))} onOpen={openIssue}/>:<div className="history-entry"><FileSpreadsheet size={20}/><span><strong>{uploadName||'No uploads in this session'}</strong><small>{uploadRows.length?`${uploadRows.length} rows · completed in browser`:'Load a file to create a local demo entry'}</small></span><StatusPill value={uploadRows.length?'Resolved':'Open'}/></div>}</section></>}

        {page==='issues'&&!isEmployee&&<><div className="page-heading"><div><p className="eyebrow">REVIEW & RESOLUTION</p><h1>Issue center</h1><p>Investigate findings, ask employees for corrections, and track resolutions.</p></div><button className="button secondary" onClick={exportReport}><Download size={16}/> Export summary</button></div><div className="issue-metrics"><Metric label="Open / pending" value={String(openFindings.length)} note="Selected department scope" icon={CircleAlert} tone="yellow"/><Metric label="Critical alerts" value={String(scopedFindings.filter(f=>f.severity==='Critical'&&f.status!=='Resolved').length)} note="Sensitive-data review" icon={ShieldAlert} tone="red"/><Metric label="Awaiting employee" value={String(scopedFindings.filter(f=>f.status==='Awaiting Employee').length)} note="Requests created in demo" icon={Bell} tone="purple"/></div><section className="panel"><div className="table-toolbar"><label className="searchbox"><Search size={17}/><input placeholder="Search issues, employee, policy..." value={search} onChange={e=>setSearch(e.target.value)}/></label><select className="standard-select" aria-label="Filter by severity" value={severityFilter} onChange={e=>setSeverityFilter(e.target.value)}><option>All severities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></div><div className="table-scroller"><table className="data-table"><thead><tr><th>Issue</th><th>Employee</th><th>Department</th><th>Severity</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>{scopedFindings.filter(f=>(severityFilter==='All severities'||f.severity===severityFilter)&&(f.id+' '+f.type+' '+f.employee+' '+f.policy).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>severityOrder[a.severity]-severityOrder[b.severity]).map(f=><tr key={f.id}><td><strong>{f.type}</strong><small className="table-sub">{f.id} · {f.field}</small></td><td>{f.employee}</td><td className="muted">{f.department}</td><td><StatusPill value={f.severity}/></td><td><StatusPill value={f.status}/></td><td className="muted">{f.date}</td><td><button className="icon-button" aria-label={`Review ${f.id}`} onClick={()=>openIssue(f)}><ChevronRight size={18}/></button></td></tr>)}</tbody></table></div></section></>}

        {page==='assistant'&&!isEmployee&&<><div className="page-heading"><div><p className="eyebrow">POLICY-GROUNDED GUIDANCE</p><h1>AI assistant</h1><p>Try the recommendation experience. This starter uses preset guidance, not a live Gemini connection.</p></div><span className="soft-badge purple"><Sparkles size={15}/> Gemini integration: pending</span></div><div className="assistant-layout"><section className="panel assistant-main"><div className="assistant-intro"><span className="assistant-logo"><Sparkles size={26}/></span><h2>What would you like to investigate?</h2><p>Explore causes of HR data quality issues and steps your team can take.</p></div><div className="prompt-suggestions">{['Why is Finance below 95%?', 'What should HR do about bank details in claims?', 'How can we reduce duplicate claims?'].map(p=><button key={p} onClick={()=>setAssistantPrompt(p)}>{p}<ArrowRight size={14}/></button>)}</div><form className="prompt-form" onSubmit={e=>{e.preventDefault();setAssistantResponse(/bank|sensitive|privacy/i.test(assistantPrompt)?'The claims policy prohibits payment account details in a claim description. Review the flagged source row, mask the value, and send an employee correction request after HR approval. See CLAIM-PII-001.':/duplicate/i.test(assistantPrompt)?'Review repeated claim IDs and matching employee/date/amount combinations. Compare receipts before deciding whether a duplicate was submitted. See CLAIM-DUP-002.':'Finance has an illustrative quality score of 87%, compared with the 95% target. The demo highlights a prohibited bank-account-like value, an invalid claim amount, and missing data. Investigate these findings first and measure improvement after validated corrections.') }}><textarea value={assistantPrompt} onChange={e=>setAssistantPrompt(e.target.value)} aria-label="Question for AI guidance" rows={3}/><button className="button primary" type="submit"><Send size={16}/> Generate demo guidance</button></form>{assistantResponse&&<div className="assistant-answer"><span className="assistant-answer-head"><Sparkles size={17}/> Preset demonstration response</span><p>{assistantResponse}</p><small>Policies cited are fictional examples. No Gemini API has been called.</small></div>}</section><section className="panel assistant-sidebar"><h2>How recommendations work</h2><ol><li>Python detects a precise rule failure.</li><li>The backend masks sensitive values.</li><li>Approved policy sections are retrieved.</li><li>Gemini explains the issue with citations.</li><li>HR reviews the action before notifying anyone.</li></ol><div className="upload-tips"><LockKeyhole size={17}/><strong>Privacy first</strong><p>Never paste real HR data or credentials into this demonstration.</p></div></section></div></>}

        {page==='policies'&&<><div className="page-heading"><div><p className="eyebrow">COMPANY RULES</p><h1>Policy library</h1><p>These fictional policy templates explain which rules the finished app should check.</p></div><span className="soft-badge">6 sample documents</span></div><div className="policy-grid">{policyCards.map(p=><article className="policy-card" key={p.code}><div className="policy-card-top"><span className="policy-icon"><BookOpen size={21}/></span><span className="soft-badge positive">Approved sample</span></div><h3>{p.title}</h3><p>{p.description}</p><div className="policy-meta"><span>{p.code}</span><span>v{p.version}</span></div><div className="policy-card-bottom"><span>{p.owner} · {p.rules} rule links</span><FileText size={17}/></div></article>)}</div><div className="info-banner"><ShieldCheck size={21}/><div><strong>Policy documents are included in your starter files.</strong><p>Open the <code>policies/</code> folder in VS Code. Replace fictional wording only after your authorized policy owner has approved it.</p></div></div></>}

        {page==='notifications'&&<><div className="page-heading"><div><p className="eyebrow">WORKFLOW ACTIVITY</p><h1>Notifications</h1><p>Local in-app updates. Email delivery will be added when the backend is connected.</p></div></div><section className="panel"><div className="notification-list">{findings.filter(f=>f.status==='Awaiting Employee'||f.status==='Under Review'||f.status==='Resolved').map(f=><button key={f.id} className="notification-item" onClick={()=>isEmployee?navigate('mycorrections'):openIssue(f)}><span className="notification-icon"><Bell size={18}/></span><span><strong>{f.status==='Awaiting Employee'?'Correction request pending':f.status==='Resolved'?'Issue resolved':'Issue under review'}</strong><small>{f.employee} · {f.type} · {f.id}</small></span><ChevronRight size={17}/></button>)}{findings.length===0&&<EmptyState icon={Bell} title="No notifications" description="Workflow updates will appear here."/>}</div></section></>}

        {page==='reports'&&!isEmployee&&<><div className="page-heading"><div><p className="eyebrow">EXPORT & MONITOR</p><h1>Quality reports</h1><p>Review the six-month sample trend and export your current findings.</p></div><button className="button primary" onClick={exportReport}><Download size={17}/> Download CSV summary</button></div><div className="metrics-grid reports-metrics"><Metric label="Last completed snapshot" value="91.4%" note="Illustrative November 2026" icon={Activity}/><Metric label="Cases resolved" value={String(findings.filter(f=>f.status==='Resolved').length)} note="Current demo session" icon={CheckCheck} tone="teal"/><Metric label="Open issues" value={String(openFindings.length)} note="Current department filter" icon={CircleAlert} tone="yellow"/></div><section className="panel"><div className="panel-heading"><div><h2>Overall quality trend</h2><p>Sample history; real snapshots require backend/database integration</p></div></div><div className="report-bars">{trend.map(t=><div key={t.month}><strong>{t.score}%</strong><div className="report-bar-track"><span style={{height:`${t.score}%`}}/></div><small>{t.month}</small></div>)}</div></section></>}

        {page==='mycorrections'&&isEmployee&&<><div className="page-heading"><div><p className="eyebrow">EMPLOYEE SELF-SERVICE</p><h1>My correction requests</h1><p>Review safe correction requests and send revised information to HR.</p></div></div><div className="info-banner"><ShieldCheck size={22}/><div><strong>This is a role-switching simulation.</strong><p>The real app will sign you in and show only cases linked to your authenticated employee ID.</p></div></div><section className="panel"><div className="panel-heading"><div><h2>Assigned requests</h2><p>Demo employee: Nur Iman (EMP-103)</p></div></div>{findings.filter(f=>f.employeeId==='EMP-103'&&['Awaiting Employee','Under Review'].includes(f.status)).length===0?<EmptyState icon={ClipboardCheck} title="You're all caught up" description="Ask HR to open a finding and click Request correction, then switch back to Employee."/>:findings.filter(f=>f.employeeId==='EMP-103'&&['Awaiting Employee','Under Review'].includes(f.status)).map(f=><div className="employee-request" key={f.id}><div><StatusPill value={f.status}/><h3>{f.type}</h3><p>{f.detail}</p><small>Rule {f.policy} · Request {f.id}</small></div>{f.status==='Awaiting Employee'?<button className="button primary" onClick={()=>changeStatus(f.id,'Under Review')}><Send size={16}/> Submit correction (demo)</button>:<span className="soft-badge positive"><Clock3 size={14}/> Waiting for HR review</span>}</div>)}</section></>}
      </div>
    </main>

    {selectedEmployee&&<div className="drawer-backdrop" onMouseDown={()=>setSelectedEmployee(null)}><section className="detail-drawer" role="dialog" aria-modal="true" aria-label="Employee detail" onMouseDown={e=>e.stopPropagation()}><div className="drawer-header"><span className="eyebrow">EMPLOYEE DATA QUALITY</span><button className="icon-button" onClick={()=>setSelectedEmployee(null)} aria-label="Close"><X size={21}/></button></div><div className="drawer-person"><span className="avatar big">{selectedEmployee.avatar}</span><h2>{selectedEmployee.name}</h2><p>{selectedEmployee.title} · {selectedEmployee.department}</p><span className="mono muted">{selectedEmployee.id}</span></div><div className="drawer-score"><span>HR record quality</span><strong>{selectedEmployee.quality}%</strong><span className="bar-track"><span style={{width:`${selectedEmployee.quality}%`}}/></span></div><h3>Related findings</h3>{findings.filter(f=>f.employeeId===selectedEmployee.id).map(f=><button className="drawer-link" key={f.id} onClick={()=>{setSelectedEmployee(null);openIssue(f)}}>{f.type}<StatusPill value={f.severity}/><ChevronRight size={16}/></button>)}{!findings.some(f=>f.employeeId===selectedEmployee.id)&&<p className="muted">No sample findings for this employee.</p>}<p className="privacy-note"><LockKeyhole size={15}/> This score measures data records only, not employee performance.</p></section></div>}

    {selectedIssue&&<div className="drawer-backdrop" onMouseDown={()=>setSelectedIssue(null)}><section className="detail-drawer" role="dialog" aria-modal="true" aria-label="Issue detail" onMouseDown={e=>e.stopPropagation()}><div className="drawer-header"><span className="eyebrow">FINDING {selectedIssue.id}</span><button className="icon-button" onClick={()=>setSelectedIssue(null)} aria-label="Close"><X size={21}/></button></div><div className="drawer-title"><StatusPill value={selectedIssue.severity}/><h2>{selectedIssue.type}</h2><p>{selectedIssue.detail}</p></div><div className="drawer-section"><h3>Source evidence</h3><dl className="details-list"><div><dt>Employee</dt><dd>{selectedIssue.employee}</dd></div><div><dt>Department</dt><dd>{selectedIssue.department}</dd></div><div><dt>CSV row</dt><dd>{selectedIssue.row}</dd></div><div><dt>Column</dt><dd className="mono">{selectedIssue.field}</dd></div><div><dt>Value (masked)</dt><dd className="evidence-value">{selectedIssue.maskedValue}</dd></div><div><dt>Status</dt><dd><StatusPill value={selectedIssue.status}/></dd></div></dl></div><div className="drawer-section recommendation-box"><h3><Sparkles size={17}/> Recommendation preview</h3><p>{selectedIssue.recommendation}</p><span className="policy-ref"><BookOpen size={14}/> Rule: {selectedIssue.policy}</span><small>Preset rule guidance. Gemini API not connected.</small></div><div className="drawer-actions"><button className="button primary" onClick={()=>changeStatus(selectedIssue.id,'Awaiting Employee')} disabled={selectedIssue.status==='Resolved'||selectedIssue.status==='Dismissed'||selectedIssue.employeeId!=='EMP-103'}><Bell size={16}/> Request correction</button><button className="button secondary" onClick={()=>changeStatus(selectedIssue.id,'Resolved')} disabled={selectedIssue.status==='Resolved'}><Check size={16}/> Mark resolved</button><button className="button ghost" onClick={()=>changeStatus(selectedIssue.id,'Dismissed')} disabled={selectedIssue.status==='Dismissed'}>Dismiss false positive</button><small>Employee request demo is wired to Nur Iman only. Real employee routing needs Auth/database integration.</small></div></section></div>}
  </div>
}
