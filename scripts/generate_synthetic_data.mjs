// Deterministic synthetic HR data. No real identities or bank accounts are used.
import fs from 'node:fs/promises'
import path from 'node:path'

const root = new URL('../datasets/', import.meta.url)
const headers = ['record_type','record_id','employee_id','employee_name','department','work_email','employment_status','event_date','claim_id','claim_category','claim_amount','claim_description','leave_id','leave_type','leave_start','leave_end','leave_days','check_in','check_out','approval_status','source_updated_at']
const namesA=['Aina','Arif','Dania','Hakim','Iman','Jia','Kavya','Lina','Mika','Nadia','Omar','Priya','Rafiq','Sofia','Tariq','Wei']
const namesB=['Rahman','Lim','Tan','Hassan','Nair','Ismail','Wong','Karim','Yusof','Das','Lee','Abdullah']
const depts=['Human Resources','Information Technology','Finance','Operations','Sales & Marketing']
const types=['employee','claim','claim','claim','claim','leave','leave','attendance','attendance','attendance']
const categories=['Transport','Parking','Meal','Travel','Training','Office supplies']
const descriptions=['Client meeting taxi fare','Office parking reimbursement','Travel to branch meeting','Team lunch allowance','Approved training fee','Stationery and supplies']
const leaveTypes=['Annual','Medical','Emergency','Compassionate']
let state=20261102
function rand(){state=(1664525*state+1013904223)>>>0;return state/2**32}
function pick(xs){return xs[Math.floor(rand()*xs.length)]}
function pad(n){return String(n).padStart(2,'0')}
function daysFrom(date,n){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function quote(s){const t=String(s??'');return /[",\r\n]/.test(t)?`"${t.replaceAll('"','""')}"`:t}
function csv(rows){return [headers.join(','),...rows.map(r=>headers.map(h=>quote(r[h])).join(','))].join('\n')+'\n'}
const employees=Array.from({length:260},(_,i)=>{const first=namesA[i%namesA.length];const last=namesB[Math.floor(i/namesA.length)%namesB.length];const dept=depts[(i*7)%depts.length];return {id:`EMP-${String(i+101).padStart(4,'0')}`,name:`${first} ${last}`,dept,email:`${first.toLowerCase()}.${last.toLowerCase()}.${i+101}@example.test`}})

function makeRow(i,prefix){
  const e=pick(employees);const type=types[i%types.length];const date=`2026-${pick(['08','09','10'])}-${pad(1+Math.floor(rand()*27))}`
  const r=Object.fromEntries(headers.map(h=>[h,'']))
  r.record_type=type;r.record_id=`${prefix}-REC-${String(i+1).padStart(5,'0')}`;r.employee_id=e.id;r.employee_name=e.name;r.department=e.dept;r.work_email=e.email;r.employment_status='Active';r.event_date=date;r.approval_status=pick(['Approved','Approved','Submitted','Pending']);r.source_updated_at=daysFrom(date,Math.floor(rand()*4))
  if(type==='claim'){const k=Math.floor(rand()*categories.length);r.claim_id=`${prefix}-CLM-${String(i+1).padStart(5,'0')}`;r.claim_category=categories[k];r.claim_amount=String(18+Math.floor(rand()*400));r.claim_description=descriptions[k]}
  if(type==='leave'){r.leave_id=`${prefix}-LEV-${String(i+1).padStart(5,'0')}`;r.leave_type=pick(leaveTypes);r.leave_start=date;const days=1+Math.floor(rand()*4);r.leave_end=daysFrom(date,days-1);r.leave_days=String(days)}
  if(type==='attendance'){r.check_in=`${date}T09:00:00+08:00`;r.check_out=`${date}T18:00:00+08:00`}
  return r
}

function applyCases(rows,train){
  const cases=[]
  const indices=train?[12,39,78,114,159,226,341,477,593,721,808,1008,1204,1421]:[13,38,67,91,125,174,202,247,315,378]
  const kinds=['missing_id','bank_in_claim','duplicate_claim','negative_claim','high_claim','invalid_leave','missing_checkout','invalid_email','invalid_department','bank_in_claim','duplicate_claim','invalid_leave','negative_claim','missing_checkout']
  for(let j=0;j<indices.length;j++){
    const idx=indices[j],kind=kinds[j];const r=rows[idx];let target=idx
    const find=(type)=>{for(let offset=0;offset<10;offset++){const at=idx+offset;if(rows[at]?.record_type===type)return at}throw Error('Missing synthetic type')}
    if(kind==='bank_in_claim'||kind==='duplicate_claim'||kind==='negative_claim'||kind==='high_claim')target=find('claim')
    if(kind==='invalid_leave')target=find('leave')
    if(kind==='missing_checkout')target=find('attendance')
    if(kind==='invalid_email')target=find('employee')
    const item=rows[target]
    let code='',field=''
    switch(kind){
      case 'missing_id':item.employee_id='';code='EMP_REQUIRED_ID';field='employee_id';break
      case 'bank_in_claim':item.claim_description='Please send reimbursement to FAKE ACCOUNT 1111-2222-3333 (synthetic test pattern)';code='CLM_PII_BANK';field='claim_description';break
      case 'duplicate_claim':{let earlier=target-1;while(earlier>=0&&rows[earlier].record_type!=='claim')earlier--;item.claim_id=rows[earlier].claim_id;code='CLM_DUPLICATE_ID';field='claim_id';break}
      case 'negative_claim':item.claim_amount='-45';code='CLM_NEGATIVE_AMOUNT';field='claim_amount';break
      case 'high_claim':item.claim_amount='9999';code='CLM_AMOUNT_ANOMALY';field='claim_amount';break
      case 'invalid_leave':item.leave_end=daysFrom(item.leave_start,-2);code='LEV_DATE_ORDER';field='leave_end';break
      case 'missing_checkout':item.check_out='';code='ATT_MISSING_CHECKOUT';field='check_out';break
      case 'invalid_email':item.work_email='not-an-email';code='EMP_EMAIL_FORMAT';field='work_email';break
      case 'invalid_department':item.department='Unknown Division';code='EMP_INVALID_DEPT';field='department';break
    }
    cases.push({file:train?'hr_train.csv':'hr_test.csv',csv_row:target+2,record_id:item.record_id,rule_code:code,field,issue_kind:kind})
  }
  return cases
}

await fs.mkdir(root,{recursive:true})
const train=Array.from({length:1500},(_,i)=>makeRow(i,'TRN'))
const test=Array.from({length:400},(_,i)=>makeRow(i,'TST'))
const answerKey=[...applyCases(train,true),...applyCases(test,false)]
await fs.writeFile(new URL('hr_train.csv',root),csv(train),'utf8')
await fs.writeFile(new URL('hr_test.csv',root),csv(test),'utf8')
await fs.writeFile(new URL('evaluation_answer_key.json',root),JSON.stringify({description:'Known deliberately injected findings only. Additional heuristic alerts may occur.',created_for:'AI Data Guardian synthetic demonstration',records:{train:train.length,test:test.length},seed:20261102,findings:answerKey},null,2)+'\n')
console.log(`Generated train=${train.length}, test=${test.length}, injected=${answerKey.length}`)
