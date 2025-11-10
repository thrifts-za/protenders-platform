/**
 * Extract categories and organs of state from etenders.html
 * Run with: node extract-etenders-data.js
 */

const fs = require('fs');
const path = require('path');

// Read the HTML file
const html = fs.readFileSync(path.join(__dirname, '../../etenders.html'), 'utf-8');

// Extract categories
const categoriesRegex = /<select[^>]*id="categorieslist"[^>]*>([\s\S]*?)<\/select>/;
const categoriesMatch = html.match(categoriesRegex);
const categories = [];

if (categoriesMatch) {
  const optionRegex = /<option value="(\d+)">([^<]+)<\/option>/g;
  let match;
  while ((match = optionRegex.exec(categoriesMatch[1])) !== null) {
    categories.push({
      id: parseInt(match[1]),
      name: match[2].trim(),
    });
  }
}

// Extract provinces
const provincesRegex = /<select[^>]*id="provincelist"[^>]*>([\s\S]*?)<\/select>/;
const provincesMatch = html.match(provincesRegex);
const provinces = [];

if (provincesMatch) {
  const optionRegex = /<option value="(\d+)">([^<]+)<\/option>/g;
  let match;
  while ((match = optionRegex.exec(provincesMatch[1])) !== null) {
    provinces.push({
      id: parseInt(match[1]),
      name: match[2].trim(),
    });
  }
}

// Extract organs of state
const organsRegex = /<select[^>]*id="departments"[^>]*>([\s\S]*?)<\/select>/;
const organsMatch = html.match(organsRegex);
const organs = [];

if (organsMatch) {
  const optionRegex = /<option value="(\d+)">([^<]+)<\/option>/g;
  let match;
  while ((match = optionRegex.exec(organsMatch[1])) !== null) {
    // Decode HTML entities
    let name = match[2].trim()
      .replace(/&#xE9;/g, 'é')
      .replace(/&#x2013;/g, '–')
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/g, "'");

    organs.push({
      id: parseInt(match[1]),
      name: name,
    });
  }
}

// Classify organs of state by type
const organsByType = {
  municipalities: {
    local: [],
    district: [],
    metro: [],
  },
  departments: {
    national: [],
    provincial: [],
  },
  soes: [],
  entities: [],
  setas: [],
  agencies: [],
  other: [],
};

organs.forEach(organ => {
  const nameLower = organ.name.toLowerCase();

  if (nameLower.includes('local municipality')) {
    organsByType.municipalities.local.push(organ);
  } else if (nameLower.includes('district municipality')) {
    organsByType.municipalities.district.push(organ);
  } else if (nameLower.includes('metro') || nameLower.includes('metropolitan municipality')) {
    organsByType.municipalities.metro.push(organ);
  } else if (nameLower.includes('department') || nameLower.startsWith('dept')) {
    if (nameLower.includes('national') || !nameLower.match(/(western cape|eastern cape|gauteng|kwazulu|limpopo|mpumalanga|northern cape|north west|free state)/)) {
      organsByType.departments.national.push(organ);
    } else {
      organsByType.departments.provincial.push(organ);
    }
  } else if (nameLower.includes('seta') || nameLower.includes('education and training authority')) {
    organsByType.setas.push(organ);
  } else if (nameLower.includes('soc ltd') || nameLower.includes('limited') || nameLower.includes('(pty)')) {
    organsByType.soes.push(organ);
  } else if (nameLower.includes('agency') || nameLower.includes('authority') || nameLower.includes('board') || nameLower.includes('commission') || nameLower.includes('council')) {
    organsByType.agencies.push(organ);
  } else if (nameLower.includes('entity')) {
    organsByType.entities.push(organ);
  } else {
    organsByType.other.push(organ);
  }
});

// Write JSON files
fs.writeFileSync(
  path.join(__dirname, 'etenders-categories.json'),
  JSON.stringify(categories, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, 'etenders-provinces.json'),
  JSON.stringify(provinces, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, 'etenders-organs-of-state.json'),
  JSON.stringify(organs, null, 2)
);

fs.writeFileSync(
  path.join(__dirname, 'etenders-organs-by-type.json'),
  JSON.stringify(organsByType, null, 2)
);

// Print summary
console.log('✅ Extraction Complete!\n');
console.log(`📊 Statistics:`);
console.log(`   - Categories: ${categories.length}`);
console.log(`   - Provinces: ${provinces.length}`);
console.log(`   - Organs of State: ${organs.length}`);
console.log(`\n🏛️  Organs by Type:`);
console.log(`   - Local Municipalities: ${organsByType.municipalities.local.length}`);
console.log(`   - District Municipalities: ${organsByType.municipalities.district.length}`);
console.log(`   - Metro Municipalities: ${organsByType.municipalities.metro.length}`);
console.log(`   - National Departments: ${organsByType.departments.national.length}`);
console.log(`   - Provincial Departments: ${organsByType.departments.provincial.length}`);
console.log(`   - State-Owned Enterprises: ${organsByType.soes.length}`);
console.log(`   - SETAs: ${organsByType.setas.length}`);
console.log(`   - Agencies/Authorities/Boards: ${organsByType.agencies.length}`);
console.log(`   - Public Entities: ${organsByType.entities.length}`);
console.log(`   - Other: ${organsByType.other.length}`);
console.log(`\n📁 Files created in Plans/Phase2-December/`);
