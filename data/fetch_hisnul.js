// Fetch Hisnul Muslim dataset from HuggingFace API and save as JSON
const https = require('https');
const fs = require('fs');
const path = require('path');

const DATASET = 'M-AI-C/hisnulmuslim';
const TOTAL = 268;
const BATCH = 100;

function fetchRows(offset) {
  return new Promise((resolve, reject) => {
    const url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(DATASET)}&config=default&split=train&offset=${offset}&length=${BATCH}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.rows.map(r => r.row));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const allRows = [];
  for (let offset = 0; offset < TOTAL; offset += BATCH) {
    console.log(`Fetching rows ${offset}–${offset + BATCH - 1}...`);
    const rows = await fetchRows(offset);
    allRows.push(...rows);
    if (rows.length < BATCH) break;
  }

  const outPath = path.join(__dirname, 'hisnulmuslim.json');
  fs.writeFileSync(outPath, JSON.stringify(allRows, null, 2), 'utf-8');
  console.log(`Saved ${allRows.length} entries to ${outPath}`);
}

main().catch(e => console.error('Error:', e.message));
