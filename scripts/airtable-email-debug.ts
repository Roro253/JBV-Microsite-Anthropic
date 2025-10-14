#!/usr/bin/env ts-node
/*
  Airtable dual-field email debug script.
  Usage:
    AIRTABLE_API_KEY=xxx AIRTABLE_BASE_ID=xxx AIRTABLE_TABLE_ID=xxx \
    AIRTABLE_EMAIL_FIELD="Email (from Contacts)" AIRTABLE_EMAIL_FIELD_2="Email (from Contacts) 2" \
    npx ts-node scripts/airtable-email-debug.ts roronazari25@gmail.com

  This script runs two strategies:
    1. Simple OR equality formula
    2. Array-safe OR formula with SEARCH + ARRAYJOIN

  It prints records (if any) and highlights matched field.
*/
import 'node-fetch';

const [,, rawEmail] = process.argv;
if (!rawEmail) {
  console.error('Email argument required. Example: npx ts-node scripts/airtable-email-debug.ts user@example.com');
  process.exit(1);
}

function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

const apiKey = assertEnv('AIRTABLE_API_KEY');
const baseId = assertEnv('AIRTABLE_BASE_ID');
const tableId = assertEnv('AIRTABLE_TABLE_ID');
const emailField = process.env.AIRTABLE_EMAIL_FIELD || 'Email';
const emailField2 = process.env.AIRTABLE_EMAIL_FIELD_2 || '';
const mgmtField = process.env.AIRTABLE_MGMT_FEE_FIELD || 'Mgmt Fee';
const carryField = process.env.AIRTABLE_CARRY_FIELD || 'Carry 1';

const normalized = rawEmail.trim().toLowerCase();

function buildEqFormula() {
  const parts = [`{${emailField}} = '${normalized}'`];
  if (emailField2) parts.push(`{${emailField2}} = '${normalized}'`);
  return parts.length > 1 ? `OR(${parts.join(',')})` : parts[0];
}

function buildArraySafeFormula() {
  const fields = [emailField, ...(emailField2 ? [emailField2] : [])];
  const clauses = fields.map(f => `OR(LOWER(TRIM({${f}}))='${normalized}',SEARCH('${normalized}',LOWER(ARRAYJOIN({${f}},',')))>0)`);
  return clauses.length > 1 ? `OR(${clauses.join(',')})` : clauses[0];
}

async function runFormula(formula: string) {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=1&filterByFormula=${encodeURIComponent(formula)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  const json = await res.json();
  return { formula, json, status: res.status };
}

(async () => {
  console.log('--- Airtable Email Debug ---');
  console.log('Email:', normalized);
  console.log('Fields:', emailField, emailField2 || '(none)');

  const eq = await runFormula(buildEqFormula());
  console.log('\n[1] Equality OR formula');
  console.log('Formula:', eq.formula);
  console.log('Status:', eq.status);
  console.log('Records length:', Array.isArray(eq.json.records) ? eq.json.records.length : 0);
  if (eq.json.records?.[0]) {
    const fields = eq.json.records[0].fields || {};
    const matched = [emailField, emailField2].filter(Boolean).find(f => (fields[f]?.toString().trim().toLowerCase()) === normalized);
    console.log('Matched field:', matched || 'unknown');
    console.log('Mgmt Fee:', fields[mgmtField]);
    console.log('Carry:', fields[carryField]);
  }

  const arr = await runFormula(buildArraySafeFormula());
  console.log('\n[2] Array-safe OR formula');
  console.log('Formula:', arr.formula);
  console.log('Status:', arr.status);
  console.log('Records length:', Array.isArray(arr.json.records) ? arr.json.records.length : 0);
  if (arr.json.records?.[0]) {
    const fields = arr.json.records[0].fields || {};
    const matched = [emailField, emailField2].filter(Boolean).find(f => (fields[f]?.toString().trim().toLowerCase()) === normalized);
    console.log('Matched field:', matched || 'unknown');
    console.log('Mgmt Fee:', fields[mgmtField]);
    console.log('Carry:', fields[carryField]);
  }

  if ((!eq.json.records || eq.json.records.length === 0) && (!arr.json.records || arr.json.records.length === 0)) {
    console.log('\nNo record matched with either formula. Check:');
    console.log('- Table ID correctness');
    console.log('- Exact field names (copy/paste from Airtable)');
    console.log('- Email stored with extra characters or different casing');
    console.log('- Row actually resides in another table linked via lookup');
  }
})();
