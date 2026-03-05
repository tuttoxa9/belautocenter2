const fs = require('fs');
const content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');
const lines = content.split('\n');
for(let i=730; i<760; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
