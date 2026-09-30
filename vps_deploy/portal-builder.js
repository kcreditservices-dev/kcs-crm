/**
 * portal-builder.js — Extract scores from progress report PDFs and update GHL portal fields.
 * Runs on VPS (no n8n memory limits).
 */

import fs from 'fs';
import path from 'path';

const GHL_PIT = 'pit-d49c2f23-d557-473e-889e-03e60e7d8d20';
const GHL_V2 = 'https://services.leadconnectorhq.com';
const GHL_LOCATION = 'ecS45oQdAqBnYmOigg6F';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const FIELD_MAP = {
  tu_start: 'FjLqcxf7xMN7K846ifDC',
  exp_start: 'zTCOAmTH3Ax1Lo8PX6m6',
  eq_start: 'YE4JeBhaJSpQXhrrbogJ',
  tu_current: 'KyE3PHYJpOPdZvxnfJkv',
  exp_current: 'M8P8La0UwfKk3A11dz4f',
  eq_current: 'eR3QPrlF0WjOUQVhVLFF',
  items_deleted: 'TummwnWulzJeof2H6fwy',
  items_disputed: 'lwJs1ZZllx3Mz5ROPUE9',
  disputed_items_list: '2b16baR7zeWeTXDsmvUw',
  score_change_note: 'dCPUiKwqWoXhyLb9wIPn',
  timeline_events: 'IPT0o5xbFw3DGAEKCtxe',
  dispute_status: 'HOMeWibi0VrpANQboxaJ',
};

async function callClaude(pdfBuffer) {
  const base64pdf = pdfBuffer.toString('base64');
  const extractPrompt = 'You are analyzing a credit document PDF for a credit repair client.\nReturn ONLY a single valid JSON object. No markdown. No explanation. Use 0 for missing numbers. Use empty arrays for missing lists.\nExtract: {"equifax_starting": 0, "transunion_starting": 0, "experian_starting": 0, "equifax_current": 0, "transunion_current": 0, "experian_current": 0, "round_number": 0, "items_deleted": [{"account": "", "bureaus": ""}], "items_ongoing": [{"account": "", "bureaus": ""}], "disputes_deleted_total": 0, "disputes_ongoing_total": 0, "credit_utilization": 0, "summary": ""}\nIf this is a raw credit report: the scores shown ARE the current scores. Look for negative accounts (collections, charge-offs, late payments, bankruptcies, inquiries) and list them as items_ongoing.\nIf this is a progress report: starting scores = first/original scores. current scores = most recent.\nsummary = 2-3 sentence plain English progress update.';

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64pdf }, cache_control: { type: 'ephemeral' } },
          { type: 'text', text: extractPrompt }
        ]
      }]
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('Claude API error ' + resp.status + ': ' + errText.substring(0, 300));
  }

  const data = await resp.json();
  const text = data.content?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned no JSON: ' + text.substring(0, 200));
  return JSON.parse(jsonMatch[0]);
}

async function updateGHL(contactId, extracted) {
  const customFields = [];

  if (extracted.transunion_starting) customFields.push({ id: FIELD_MAP.tu_start, value: String(extracted.transunion_starting) });
  if (extracted.experian_starting) customFields.push({ id: FIELD_MAP.exp_start, value: String(extracted.experian_starting) });
  if (extracted.equifax_starting) customFields.push({ id: FIELD_MAP.eq_start, value: String(extracted.equifax_starting) });
  if (extracted.transunion_current) customFields.push({ id: FIELD_MAP.tu_current, value: String(extracted.transunion_current) });
  if (extracted.experian_current) customFields.push({ id: FIELD_MAP.exp_current, value: String(extracted.experian_current) });
  if (extracted.equifax_current) customFields.push({ id: FIELD_MAP.eq_current, value: String(extracted.equifax_current) });
  if (extracted.disputes_deleted_total != null) customFields.push({ id: FIELD_MAP.items_deleted, value: String(extracted.disputes_deleted_total) });
  if (extracted.disputes_ongoing_total != null) customFields.push({ id: FIELD_MAP.items_disputed, value: String(extracted.disputes_ongoing_total) });
  if (extracted.summary) customFields.push({ id: FIELD_MAP.score_change_note, value: extracted.summary });
  if (extracted.items_ongoing?.length) customFields.push({ id: FIELD_MAP.disputed_items_list, value: JSON.stringify(extracted.items_ongoing) });

  if (!customFields.length) return { updated: false, reason: 'no fields to update' };

  const resp = await fetch(GHL_V2 + '/contacts/' + contactId, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + GHL_PIT, Version: '2021-07-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ customFields }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('GHL update failed ' + resp.status + ': ' + errText.substring(0, 200));
  }
  return { updated: true, fieldsCount: customFields.length };
}

async function searchGHLContact(clientName) {
  const resp = await fetch(GHL_V2 + '/contacts/?locationId=' + GHL_LOCATION + '&query=' + encodeURIComponent(clientName) + '&limit=1', {
    headers: { Authorization: 'Bearer ' + GHL_PIT, Version: '2021-07-28' }
  });
  const data = await resp.json();
  return data.contacts?.[0] || null;
}

export async function populatePortal({ client_name, contact_id, file_id, pdf_base64 }) {
  console.log('[portal-builder] Starting for', client_name);

  let pdfBuffer;

  if (pdf_base64) {
    pdfBuffer = Buffer.from(pdf_base64, 'base64');
  } else if (file_id) {
    const { google } = await import('googleapis');
    const tokenData = JSON.parse(fs.readFileSync('/root/des-dispute-specialist/token.json', 'utf-8'));
    const clientSecret = JSON.parse(fs.readFileSync('/root/des-dispute-specialist/client_secret.json', 'utf-8'));
    const installed = clientSecret.installed || clientSecret.web;
    const oauth2 = new google.auth.OAuth2(installed.client_id, installed.client_secret, installed.redirect_uris?.[0]);
    oauth2.setCredentials(tokenData);
    const drive = google.drive({ version: 'v3', auth: oauth2 });
    const fileResp = await drive.files.get({ fileId: file_id, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' });
    pdfBuffer = Buffer.from(fileResp.data);
  } else {
    const clientDir = path.join('/root/des-dispute-specialist', client_name.replace(/\s+/g, '_'));
    const crDir = path.join(clientDir, 'CR');
    if (fs.existsSync(crDir)) {
      const files = fs.readdirSync(crDir).filter(f => f.endsWith('.pdf')).sort().reverse();
      if (files.length) pdfBuffer = fs.readFileSync(path.join(crDir, files[0]));
    }
    if (!pdfBuffer) throw new Error('No PDF source provided and no PDF found on disk for ' + client_name);
  }

  console.log('[portal-builder] PDF loaded:', pdfBuffer.length, 'bytes');
  const extracted = await callClaude(pdfBuffer);
  console.log('[portal-builder] Claude extracted:', JSON.stringify(extracted).substring(0, 200));

  let ghlContactId = contact_id;
  if (!ghlContactId) {
    const contact = await searchGHLContact(client_name);
    if (!contact) throw new Error('No GHL contact found for ' + client_name);
    ghlContactId = contact.id;
  }

  const updateResult = await updateGHL(ghlContactId, extracted);
  console.log('[portal-builder] GHL updated:', updateResult);
  return { client_name, contact_id: ghlContactId, extracted, ghl: updateResult };
}
