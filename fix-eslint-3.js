const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Похоже ошибка синтаксиса на строке 749, давайте внимательнее посмотрим кусок
const lines = content.split('\n');
for(let i=725; i<755; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
