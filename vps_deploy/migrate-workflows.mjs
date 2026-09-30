import https from 'https';

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5Y2E5NTZiOC0wNTQxLTRlYjgtYTZiMC1mZjk3N2I1Y2NlNzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzgzOTU2MDY0fQ.0pOs1cwbwNqcvDXezpk0IMKtEPCJxVwkDq0xsoWuI8I';

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'kingcredit.app.n8n.cloud', path: '/api/v1' + path, method, headers: { 'X-N8N-API-KEY': API_KEY, 'Content-Type': 'application/json' } };
    const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function updateWorkflow(id, name, replacements) {
  console.log(`\n=== ${name} ===`);
  const { body: raw } = await api('GET', '/workflows/' + id);
  const wf = JSON.parse(raw);

  for (const rep of replacements) {
    const node = wf.nodes.find(n => n.name === rep.findNode);
    if (!node) { console.log('  Node not found:', rep.findNode); continue; }

    node.name = rep.newName || node.name;
    node.type = 'n8n-nodes-base.httpRequest';
    node.typeVersion = 4.2;
    node.parameters = {
      method: 'POST',
      url: rep.url,
      sendBody: true,
      specifyBody: 'json',
      jsonBody: rep.jsonBody,
      options: { timeout: 120000 }
    };
    console.log('  Replaced:', rep.findNode, '->', node.name);

    // Rewire connections if specified
    if (rep.connectTo) {
      wf.connections[node.name] = { main: [[{ node: rep.connectTo, type: 'main', index: 0 }]] };
    }
    if (rep.deleteConnections) {
      for (const dc of rep.deleteConnections) delete wf.connections[dc];
    }
    if (rep.rewireFrom) {
      wf.connections[rep.rewireFrom] = { main: [[{ node: node.name, type: 'main', index: 0 }]] };
    }
  }

  const cleanNodes = wf.nodes.map(n => ({ parameters: n.parameters, name: n.name, type: n.type, typeVersion: n.typeVersion, position: n.position, id: n.id }));
  const { status } = await api('PUT', '/workflows/' + id, {
    name: wf.name, nodes: cleanNodes, connections: wf.connections,
    settings: { executionOrder: 'v1', errorWorkflow: 'u3wA1lRCWaQXHgzR' }
  });
  console.log('  PUT status:', status);
}

const portalBody = '={{ JSON.stringify({ client_name: $json.clientName || $json.client_name || "", contact_id: $json.contactId || $json.contact_id || "", file_id: $json.fileId || $json.file_id || "" }) }}';
const baBody = '={{ JSON.stringify({ client_name: $json.client_name || $json.clientName || "", folder_id: $json.folder_id || "" }) }}';

async function run() {
  // 1. Progress Report Score Extractor
  await updateWorkflow('ulJqvrfpmC2C8ZnY', 'Progress Report Score Extractor', [{
    findNode: 'Convert to Base64',
    newName: 'VPS Extract + Update GHL',
    url: 'http://149.248.3.156:3847/populate-portal',
    jsonBody: portalBody,
    connectTo: 'Success Response',
    deleteConnections: ['Convert to Base64', 'Claude Extract Scores', 'Parse Claude Response', 'If Extraction OK'],
    rewireFrom: 'Download PDF'
  }]);

  // 2. DES - Before and After Report
  await updateWorkflow('vwaKwTcQC2Snv0pa', 'DES - Before and After Report', [{
    findNode: 'Analyze',
    url: 'http://149.248.3.156:3847/ba-data',
    jsonBody: baBody
  }]);

  // 3. BA Report Generator
  await updateWorkflow('CxV62H5U4Hj0Fcs9', 'BA Report Generator', [{
    findNode: 'Read Content + Build Payload',
    newName: 'VPS BA Analysis',
    url: 'http://149.248.3.156:3847/ba-data',
    jsonBody: baBody,
    connectTo: 'Build HTML P1',
    deleteConnections: ['Read Content + Build Payload', 'Claude Extract'],
    rewireFrom: 'Download Files'
  }]);

  // 4. Attorney Packet v3
  await updateWorkflow('FEVraEQd3dEgE2Nv', 'Attorney Packet v3 (Template)', [{
    findNode: 'Read Content + Build Payload',
    newName: 'VPS BA Analysis',
    url: 'http://149.248.3.156:3847/ba-data',
    jsonBody: baBody,
    connectTo: 'Build HTML',
    deleteConnections: ['Read Content + Build Payload', 'Claude Extract'],
    rewireFrom: 'Download Files'
  }]);

  console.log('\nAll 4 workflows migrated to VPS endpoints.');
}

run().catch(e => console.error(e));
