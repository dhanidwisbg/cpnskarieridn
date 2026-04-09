const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

const problematic = data.filter(d => d.id >= 2600 && d.id <= 2615);
console.log(JSON.stringify(problematic, null, 2));
