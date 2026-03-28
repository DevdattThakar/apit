const fs = require('fs');
let content = fs.readFileSync('src/components/WorkForceIntel.jsx', 'utf8');

// Replace all combinations of fixed grids with auto-fit grids
content = content.replace(/gridTemplateColumns:\s*["']1fr\s+1fr["']/g, 'gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))"');
content = content.replace(/gridTemplateColumns:\s*["']repeat\([2-4],\s*1fr\)["']/g, 'gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))"');

// Rule 1: Fixed Pixel values to clamp/min/max

// height: "Npx" -> height: "auto" (except when it should be kept)
// I will not regex height since some might be decorative, I'll review them manually if needed or just let it be. But wait, I can do simple spacing.

// For gap: N -> gap: "clamp(6px, 1.5vw, Npx)"
content = content.replace(/gap:\s*(\d+)/g, (match, p1) => {
    return 'gap: "clamp(6px, 1.5vw, ' + p1 + 'px)"';
});

// padding: "Npx Mpx" -> padding: "clamp(8px, 2vw, Npx) clamp(8px, 2vw, Mpx)" is hard to regex exactly, but padding: N (number) can be:
content = content.replace(/(?<!\w)padding:\s*(\d+)(?!px)(?!vw)(?!%)/g, (match, p1) => {
    return 'padding: "clamp(8px, 2vw, ' + p1 + 'px)"';
});

// borderRadius: N -> borderRadius: "clamp(8px, 1.5vw, Npx)"
content = content.replace(/borderRadius:\s*(\d+)(?!px)(?!vw)(?!%)/g, (match, p1) => {
    // but what if it's 50%? the regex avoids it.
    return 'borderRadius: "clamp(8px, 1.5vw, ' + p1 + 'px)"';
});

// Rule 5: Typography auto-scales
// fontSize: N -> fontSize: "clamp(12px, 1.5vw + 8px, Npx)"
// only numbers
content = content.replace(/fontSize:\s*(\d+)(?!px)(?!vw)(?!%)/g, (match, p1) => {
    return 'fontSize: "clamp(12px, 1.5vw + 8px, ' + p1 + 'px)"';
});

fs.writeFileSync('src/components/WorkForceIntel.jsx', content);
console.log('Fluid CSS application script ran.');
