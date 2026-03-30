const fs = require('fs');
const content = fs.readFileSync('src/components/WorkForceIntel.jsx', 'utf8');

const matches = new Set();
// find width: [number], minWidth: [number], width: "[number]px", w-[number], min-w-[number]
const regexes = [
    /minWidth:\s*['"]?(\d{3,})(?:px)?['"]?/g,
    /(?<![a-zA-Z])width:\s*['"]?(\d{3,})(?:px)?['"]?/g,
    /w-\[\s*(\d{3,})px\s*\]/g,
    /min-w-\[\s*(\d{3,})px\s*\]/g,
    /gridTemplateColumns:[^;}]+/g,
    /w-(?:64|72|80|96|px)/g
];

regexes.forEach(regex => {
    let match;
    while ((match = regex.exec(content)) !== null) {
        matches.add(match[0].trim());
    }
});

console.log(Array.from(matches).join('\n'));
