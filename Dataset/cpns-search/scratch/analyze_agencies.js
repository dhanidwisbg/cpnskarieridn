const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));

const instansiRaw = data.map(d => d.instansi);
const instansiUnique = Array.from(new Set(instansiRaw)).sort();

console.log(`Total records: ${data.length}`);
console.log(`Unique instansi: ${instansiUnique.length}`);

// Check for trailing spaces or inconsistencies
const trimmedInconsistent = instansiUnique.filter(i => i !== i.trim());
if (trimmedInconsistent.length > 0) {
  console.log("Inconsistent names (trailing/leading spaces):");
  console.log(trimmedInconsistent);
}

// Check for case inconsistencies
const lowerMap = new Map();
instansiUnique.forEach(i => {
  const low = i.toLowerCase();
  if (!lowerMap.has(low)) lowerMap.set(low, []);
  lowerMap.get(low).push(i);
});

const caseInconsistent = Array.from(lowerMap.entries()).filter(([low, list]) => list.length > 1);
if (caseInconsistent.length > 0) {
  console.log("Case inconsistencies:");
  caseInconsistent.forEach(([low, list]) => console.log(`- ${list.join(' vs ')}`));
}

// Check for very short names that might be junk
const shortNames = instansiUnique.filter(i => i.length < 5);
if (shortNames.length > 0) {
    console.log("Short names (potentially junk):");
    console.log(shortNames);
}

// List first 20 agencies
console.log("First 20 unique agencies:");
console.log(instansiUnique.slice(0, 20));
