// Script to convert hisnulmuslim.parquet to JSON
const fs = require('fs');
const path = require('path');
const { parquetRead } = require('hyparquet');

async function convert() {
  const filePath = path.join(__dirname, 'hisnulmuslim.parquet');
  const buffer = fs.readFileSync(filePath);
  
  const rows = [];
  await parquetRead({
    file: buffer,
    onComplete: (data) => {
      rows.push(...data);
    }
  });

  // data is array of arrays — get column names from first row metadata
  // hyparquet returns array of row arrays
  const result = rows.map(row => ({
    reference: row[0],
    arabic: row[1],
    english: row[2],
    title: row[3],
  }));

  const outPath = path.join(__dirname, 'hisnulmuslim.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Converted ${result.length} entries to ${outPath}`);
}

convert().catch(e => {
  console.error('Conversion error:', e.message);
  // Fallback: try using the HuggingFace API JSON format
  console.log('Trying HuggingFace API fallback...');
  const https = require('https');
  const url = 'https://datasets-server.huggingface.co/api/M-AI-C/hisnulmuslim/parquet/default/train/0.parquet';
  
  // Actually, let's just use the HuggingFace server API for JSON
  const jsonUrl = 'https://datasets-server.huggingface.co/rows?dataset=M-AI-C%2Fhisnulmuslim&config=default&split=train&offset=0&length=268';
  https.get(jsonUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const rows = parsed.rows.map(r => r.row);
        const outPath = path.join(__dirname, 'hisnulmuslim.json');
        fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf-8');
        console.log(`Fallback: Converted ${rows.length} entries via API`);
      } catch (e2) {
        console.error('Fallback also failed:', e2.message);
      }
    });
  }).on('error', e3 => {
    console.error('HTTP error:', e3.message);
  });
});
