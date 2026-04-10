const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data.json', 'utf8'));
const mapping = JSON.parse(fs.readFileSync('src/drive_mapping.json', 'utf8'));

const agencies = {};

data.forEach(item => {
  if (!agencies[item.instansi]) {
    agencies[item.instansi] = {
      name: item.instansi,
      links: new Set(),
      sample_id: item.id
    };
  }
  if (item.link_pdf) {
    agencies[item.instansi].links.add(item.link_pdf);
  }
});

const results = {
  linked: [],
  broken: [],
  missing: []
};

Object.values(agencies).forEach(agency => {
  if (agency.links.size === 0) {
    results.missing.push(agency.name);
    return;
  }

  const links = Array.from(agency.links);
  const isLinked = links.some(link => {
    if (link.startsWith('http')) return true;
    const filename = link.split('/').pop();
    return !!mapping[filename];
  });

  if (isLinked) {
    results.linked.push(agency.name);
  } else {
    results.broken.push({
      name: agency.name,
      sample_link: links[0]
    });
  }
});

console.log(`TOTAL AGENCIES: ${Object.keys(agencies).length}`);
console.log(`LINKED: ${results.linked.length}`);
console.log(`BROKEN (Path exists but no mapping): ${results.broken.length}`);
console.log(`MISSING (No link_pdf at all): ${results.missing.length}`);

if (results.broken.length > 0) {
  console.log("\nBroken Agencies (Missing Drive Mapping):");
  results.broken.forEach(b => console.log(`- ${b.name} (${b.sample_link})`));
}

if (results.missing.length > 0) {
    console.log("\nAgencies with NO link_pdf:");
    results.missing.forEach(m => console.log(`- ${m}`));
}
