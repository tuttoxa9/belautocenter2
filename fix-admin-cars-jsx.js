const fs = require('fs');
// Это была проблема в функции-обертке...
// Посмотрим, может мы случайно стерли return или фигурную скобку перед return
// 396:     )
// 397:   }
// 398:
// 399:   return (

// Посмотрим на строки с 370
const content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');
const lines = content.split('\n');
for(let i=370; i<400; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
