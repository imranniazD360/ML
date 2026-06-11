const fs = require('fs');
const path = require('path');

// Load the report data
const rawData = JSON.parse(fs.readFileSync('data/report_data.json', 'utf8'));
const { findings, scan_date, severity_counts } = rawData;

console.log('\n' + '═'.repeat(100));
console.log('  ✓ REPORT VERIFICATION - FULL FINDINGS WITH COMPLETE URLs'.toUpperCase());
console.log('═'.repeat(100));
console.log(`  Scan Date: ${scan_date}`);
console.log(`  Total Findings: ${findings.length}`);
console.log(`  Severity Distribution: Critical: ${severity_counts.critical} | High: ${severity_counts.high} | Medium: ${severity_counts.medium} | Low: ${severity_counts.low}`);
console.log('─'.repeat(100));

// Group by URL and severity
const groupedByUrl = {};
findings.forEach(f => {
  if (!groupedByUrl[f.url]) {
    groupedByUrl[f.url] = [];
  }
  groupedByUrl[f.url].push(f);
});

// Display findings organized by URL
let findingNum = 1;
Object.keys(groupedByUrl).sort().forEach(url => {
  console.log(`\n📍 TARGET: ${url}`);
  console.log('  ' + '─'.repeat(96));
  
  groupedByUrl[url].forEach(finding => {
    const sev = finding.severity || 'Info';
    const cvss = typeof finding.cvss === 'number' ? finding.cvss.toFixed(1) : '0.0';
    const mlConf = finding.ml_prediction ? `${(finding.ml_prediction.confidence * 100).toFixed(1)}%` : 'N/A';
    const vulnerable = finding.vulnerable ? '🔴 VULNERABLE' : '🟡 POTENTIAL';
    const evidence = (finding.evidence||[]).map(e=>e.indicator).join(' | ') || 'ML-flagged anomaly';
    
    console.log(`  [${String(findingNum).padStart(3, '0')}] ${vulnerable} | Severity: ${sev.padEnd(7)} | CVSS: ${cvss.padStart(3)} | ML: ${mlConf.padStart(6)}`);
    console.log(`       → Parameter: ${finding.parameter.padEnd(20)} | Category: ${finding.category}`);
    console.log(`       → Method: ${finding.method.padEnd(6)} | Status: ${finding.status_code} | Response: ${finding.response_size} bytes`);
    console.log(`       → Payload: ${finding.payload}`);
    console.log(`       → Evidence: ${evidence}`);
    console.log(`       → ML Flagged: ${finding.ml_flagged ? 'YES' : 'NO'} | Ensemble Score: ${(finding.ml_prediction?.ensemble_score || 0).toFixed(3)}`);
    
    findingNum++;
  });
});

console.log('\n' + '═'.repeat(100));
console.log(`  Total Analyzed: ${findingNum - 1} findings across ${Object.keys(groupedByUrl).length} unique URL(s)`);
console.log('═'.repeat(100) + '\n');

// Summary statistics
const vulnCount = findings.filter(f => f.vulnerable).length;
const mlFlaggedCount = findings.filter(f => f.ml_flagged).length;
console.log('📊 STATISTICS:'.padEnd(50) + '');
console.log(`  ✓ Confirmed Vulnerabilities:     ${vulnCount.toString().padStart(3)}`);
console.log(`  ⚠ ML-Flagged (Anomalies):       ${mlFlaggedCount.toString().padStart(3)}`);
console.log(`  📍 Unique URLs Scanned:          ${Object.keys(groupedByUrl).length.toString().padStart(3)}`);
console.log(`  📋 Report File Generated:        reports/DT_Scan_Report_${scan_date.split(' ').join('_').replace(/[^0-9_]/g, '')}.docx`);
console.log('');

