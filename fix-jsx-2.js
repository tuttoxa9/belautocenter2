const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Похоже, где-то не закрыли div до этого:
const lines = content.split('\n');
for(let i=850; i<880; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
