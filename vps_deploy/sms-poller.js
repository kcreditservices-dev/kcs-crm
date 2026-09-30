/**
 * sms-poller.js — Polls RingCentral for inbound SMS every 60s and saves to CRM Supabase.
 * Runs inside DES on VPS. Zero n8n credits.
 */

const RC_CLIENT_ID = 'AGpBtagtXntaz5lRjnBdgv';
const RC_CLIENT_SECRET = '2cXvLmEBkXTd65AjAuS7vCddTMc27bQ5bcZzyhZMXEF2';
const RC_JWT = 'eyJraWQiOiI4NzYyZjU5OGQwNTk0NGRiODZiZjVjYTk3ODA0NzYwOCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczovL3BsYXRmb3JtLnJpbmdjZW50cmFsLmNvbS9yZXN0YXBpL29hdXRoL3Rva2VuIiwic3ViIjoiMjIyODAyNDAxNSIsImlzcyI6Imh0dHBzOi8vcGxhdGZvcm0ucmluZ2NlbnRyYWwuY29tIiwiZXhwIjozOTMzOTgxNTEzLCJpYXQiOjE3ODY0OTc4NjYsImp0aSI6InlpcEJmX2xtVDBHVGhGc3MwVmJxdUEifQ.VoTi8dW-IULoN4Fe9qavhMPbSEG5xngJAh2R5aEOUW2mUVHg8_vcFcCk-5mZuQxdRFDvl-Tb67hVPn7LX5RJySRyuGA0yem9ZCjcUefNAreekt94VekI5e0wYlQLQzij-CzvzwL93J1CZ_xz9DeW4p7UcZj8O6n9mHPme__0mEipQkXH-7Q8E72PNYnCsk2xji6t7tauMvIOx3HeDWKG2zrjZyb7r43cKnRChMB0wN8sj4VEErkHhJUdFlm5uhJAFiyy-SMokjYjXEVSoIMVa5sPjxMwmBnYrORCjvnqL9xoFqEfawVDS4J8OdfHpHhtZ1z0JG1DuBlIBCO4brMzfQ';

const SUPABASE_URL = 'https://fleyqstdtxzaiimcjoey.supabase.co';
const SUPABASE_KEY = 'sb_publishable_33jSoTeLQJhPL_yGDBIztA_C0wBsZJX';

let rcToken = null;
let tokenExpiry = 0;

async function getRcToken() {
  if (rcToken && Date.now() < tokenExpiry) return rcToken;

  const resp = await fetch('https://platform.ringcentral.com/restapi/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(RC_CLIENT_ID + ':' + RC_CLIENT_SECRET).toString('base64'),
    },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + encodeURIComponent(RC_JWT),
  });

  const data = await resp.json();
  if (!data.access_token) throw new Error('RC auth failed');
  rcToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return rcToken;
}

async function pollInboundSMS() {
  try {
    const token = await getRcToken();
    const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const resp = await fetch(
      'https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~/message-store?messageType=SMS&direction=Inbound&dateFrom=' + encodeURIComponent(since) + '&perPage=50',
      { headers: { Authorization: 'Bearer ' + token } }
    );

    if (!resp.ok) {
      console.log('[sms-poller] RC API error:', resp.status);
      return;
    }

    const { records = [] } = await resp.json();
    if (!records.length) return;

    let saved = 0;
    for (const msg of records) {
      const from = msg.from?.phoneNumber || '';
      const to = msg.to?.[0]?.phoneNumber || '';
      const body = msg.subject || '';
      const rcId = String(msg.id || '');

      if (!from || !body) continue;

      // Check if already saved
      const checkResp = await fetch(
        SUPABASE_URL + '/rest/v1/messages?rc_message_id=eq.' + rcId + '&select=id&limit=1',
        { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }
      );
      const existing = await checkResp.json();
      if (Array.isArray(existing) && existing.length > 0) continue;

      // Save via handle_inbound_sms
      const saveResp = await fetch(SUPABASE_URL + '/rest/v1/rpc/handle_inbound_sms', {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_number: from, to_number: to, message_body: body, rc_message_id: rcId }),
      });
      const result = await saveResp.json();
      if (result?.status === 'ok') saved++;
    }

    if (saved > 0) console.log('[sms-poller] Saved', saved, 'new inbound messages');
  } catch (err) {
    console.error('[sms-poller] Error:', err.message);
  }
}

export function startSMSPoller() {
  console.log('[sms-poller] Starting inbound SMS poller (every 60s)');
  pollInboundSMS();
  setInterval(pollInboundSMS, 60 * 1000);
}
