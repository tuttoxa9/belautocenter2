const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');
const lines = content.split('\n');
for(let i=915; i<940; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
