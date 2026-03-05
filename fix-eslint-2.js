const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Строки вокруг 749, похоже я засунул не туда закрывающие дивы в замене searchChecks / replaceChecks
// Проблема в парсере, скорее всего JSX разметке не хватает закрывающих дивов.
// Посмотрим хвост вкладки Basic
const lines = content.split('\n');
for(let i=840; i<880; i++) {
  if (lines[i] !== undefined) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
