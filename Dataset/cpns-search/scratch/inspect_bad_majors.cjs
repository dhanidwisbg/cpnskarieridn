const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../src/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const kemenkes = data.filter(d => d.instansi === 'Kementerian Kesehatan');
const badMajors = kemenkes.map(d => d.jurusan).filter(j => /\b\d\b/.test(j)); // matches single isolated digits which signify the numbers
console.log(`Total Kemenkes: ${kemenkes.length}. With possible numbers: ${badMajors.length}`);
console.log("Samples:", badMajors.slice(0, 20));
