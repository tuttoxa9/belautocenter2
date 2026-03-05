const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');
const lines = content.split('\n');
// Посмотрим дальше по файлу
for(let i=760; i<850; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
