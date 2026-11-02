import fs from 'node:fs/promises'
import assert from 'node:assert/strict'

const base=new URL('../datasets/',import.meta.url)
const key=JSON.parse(await fs.readFile(new URL('evaluation_answer_key.json',base),'utf8'))
for(const [file,expected] of [['hr_train.csv',1500],['hr_test.csv',400]]){
  const text=await fs.readFile(new URL(file,base),'utf8')
  const lines=text.trimEnd().split(/\r?\n/)
  assert.equal(lines.length-1,expected,`${file} row count`)
  assert.ok(lines[0].includes('record_type,record_id,employee_id'),`${file} headers`)
  assert.ok(lines.some(l=>l.startsWith('claim,')),`${file} claims`)
  assert.ok(lines.some(l=>l.startsWith('attendance,')),`${file} attendance`)
  const known=key.findings.filter(f=>f.file===file)
  for(const issue of known){const line=lines[issue.csv_row-1];assert.ok(line.includes(issue.record_id),`${issue.rule_code} maps to ${issue.csv_row}`)}
  console.log(`${file}: ${expected} rows, ${known.length} known seeded findings`)
}
console.log('Synthetic dataset checks passed.')
