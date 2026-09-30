import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const RC_CLIENT_ID = "AGpBtagtXntaz5lRjnBdgv";
const RC_CLIENT_SECRET = "2cXvLmEBkXTd65AjAuS7vCddTMc27bQ5bcZzyhZMXEF2";
const RC_JWT = "eyJraWQiOiI4NzYyZjU5OGQwNTk0NGRiODZiZjVjYTk3ODA0NzYwOCIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJhdWQiOiJodHRwczovL3BsYXRmb3JtLnJpbmdjZW50cmFsLmNvbS9yZXN0YXBpL29hdXRoL3Rva2VuIiwic3ViIjoiMjIyODAyNDAxNSIsImlzcyI6Imh0dHBzOi8vcGxhdGZvcm0ucmluZ2NlbnRyYWwuY29tIiwiZXhwIjozOTMzOTgxNTEzLCJpYXQiOjE3ODY0OTc4NjYsImp0aSI6InlpcEJmX2xtVDBHVGhGc3MwVmJxdUEifQ.VoTi8dW-IULoN4Fe9qavhMPbSEG5xngJAh2R5aEOUW2mUVHg8_vcFcCk-5mZuQxdRFDvl-Tb67hVPn7LX5RJySRyuGA0yem9ZCjcUefNAreekt94VekI5e0wYlQLQzij-CzvzwL93J1CZ_xz9DeW4p7UcZj8O6n9mHPme__0mEipQkXH-7Q8E72PNYnCsk2xji6t7tauMvIOx3HeDWKG2zrjZyb7r43cKnRChMB0wN8sj4VEErkHhJUdFlm5uhJAFiyy-SMokjYjXEVSoIMVa5sPjxMwmBnYrORCjvnqL9xoFqEfawVDS4J8OdfHpHhtZ1z0JG1DuBlIBCO4brMzfQ";
const RC_FROM = "+12094974337";

async function getRcAccessToken(): Promise<string> {
  const res = await fetch("https://platform.ringcentral.com/restapi/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${RC_CLIENT_ID}:${RC_CLIENT_SECRET}`),
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: RC_JWT,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("RC auth failed: " + JSON.stringify(data));
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, body, contactId, conversationId } = await req.json();

    if (!to || !body) {
      return new Response(JSON.stringify({ error: "to and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format phone to E.164
    const toFormatted = to.replace(/\D/g, "").replace(/^1?(\d{10})$/, "+1$1");

    // Send SMS via RingCentral
    const token = await getRcAccessToken();
    const rcRes = await fetch(
      "https://platform.ringcentral.com/restapi/v1.0/account/~/extension/~/sms",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: { phoneNumber: RC_FROM },
          to: [{ phoneNumber: toFormatted }],
          text: body,
        }),
      }
    );

    const rcData = await rcRes.json();

    if (!rcRes.ok) {
      return new Response(JSON.stringify({ error: "RC SMS failed", details: rcData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save message to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (contactId && conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        contact_id: contactId,
        direction: "outbound",
        channel: "sms",
        body,
        from_number: RC_FROM,
        to_number: toFormatted,
        sent_by: "Louis",
        rc_message_id: String(rcData.id),
        status: "delivered",
      });

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    return new Response(JSON.stringify({ success: true, rcMessageId: rcData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
