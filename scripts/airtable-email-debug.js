#!/usr/bin/env node
// JS version of Airtable dual-field email debug script
const fetch = require('node-fetch');

function assertEnv(name){
  const v = process.env[name];
  if(!v){
    console.error('Missing env var:', name);
    process.exit(1);
  }
  return v;
}

const [, , rawEmail] = process.argv;
if(!rawEmail){
  console.error('Email argument required');
  process.exit(1);
}
const email = rawEmail.trim().toLowerCase();

const apiKey = assertEnv('AIRTABLE_API_KEY');
const baseId = assertEnv('AIRTABLE_BASE_ID');
const tableId = assertEnv('AIRTABLE_TABLE_ID');
const emailField = process.env.AIRTABLE_EMAIL_FIELD || 'Email';
const emailField2 = process.env.AIRTABLE_EMAIL_FIELD_2 || '';
const mgmtField = process.env.AIRTABLE_MGMT_FEE_FIELD || 'Mgmt Fee';
const carryField = process.env.AIRTABLE_CARRY_FIELD || 'Carry 1';

function eqFormula(){
  const parts = [`{${emailField}} = '${email}'`];
  if(emailField2) parts.push(`{${emailField2}} = '${email}'`);
  return parts.length > 1 ? `OR(${parts.join(',')})` : parts[0];
}
function arrayFormula(){
  const fields = [emailField, ...(emailField2 ? [emailField2] : [])];
  const target = email;
  const clauses = fields.map(f => `OR(LOWER(TRIM({${f}}))='${target}',SEARCH('${target}',LOWER(ARRAYJOIN({${f}},',')))>0)`);
  return clauses.length > 1 ? `OR(${clauses.join(',')})` : clauses[0];
}
async function run(formula){
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` }});
  const json = await res.json();
  return { formula, status: res.status, json };
}
(async()=>{
  console.log('--- Airtable Email Debug ---');
  console.log('Email:', email);
  console.log('Fields:', emailField, emailField2 || '(none)');

  const eq = await run(eqFormula());
  console.log('\n[1] Equality formula');
  console.log('Formula:', eq.formula);
  console.log('Status:', eq.status);
  console.log('Records length:', Array.isArray(eq.json.records)? eq.json.records.length : 0);
  if(eq.json.records?.[0]){
    const fields = eq.json.records[0].fields || {};
    const matched = [emailField, emailField2].filter(Boolean).find(f => (fields[f]?.toString().trim().toLowerCase()) === email);
    console.log('Matched field:', matched || 'unknown');
    console.log('Mgmt Fee:', fields[mgmtField]);
    console.log('Carry:', fields[carryField]);
  }

  const arr = await run(arrayFormula());
  console.log('\n[2] Array-safe formula');
  console.log('Formula:', arr.formula);
  console.log('Status:', arr.status);
  console.log('Records length:', Array.isArray(arr.json.records)? arr.json.records.length : 0);
  if(arr.json.records?.[0]){
    const fields = arr.json.records[0].fields || {};
    const matched = [emailField, emailField2].filter(Boolean).find(f => (fields[f]?.toString().trim().toLowerCase()) === email);
    console.log('Matched field:', matched || 'unknown');
    console.log('Mgmt Fee:', fields[mgmtField]);
    console.log('Carry:', fields[carryField]);
  }

  if((!eq.json.records || eq.json.records.length===0) && (!arr.json.records || arr.json.records.length===0)){
    console.log('\nNo record matched. Check:');
    console.log('- Field names EXACT (copy from Airtable header)');
    console.log('- Email stored differently (e.g., Name <email>)');
    console.log('- Table ID mismatch');
    console.log('- Row lives in linked table not this base table');
  }
})();
