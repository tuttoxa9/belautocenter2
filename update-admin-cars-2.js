const fs = require('fs');

let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Ищем следующий блок после "Базовые параметры"
const search1 = `              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <Label className="text-sm">Год</Label>`;
const replace1 = `                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Год</Label>`;

content = content.replace(search1, replace1);

const search2 = `                <div>
                  <Label className="text-sm">Цена ($)</Label>`;
const replace2 = `                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Цена ($)</Label>`;
content = content.replace(search2, replace2);


const search3 = `                <div className="sm:col-span-2 md:col-span-1">
                  <Label className="text-sm">Пробег (км)</Label>`;
const replace3 = `                      <div className="space-y-2 sm:col-span-2 md:col-span-1">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Пробег (км)</Label>`;
content = content.replace(search3, replace3);


const search4 = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Объем двигателя (л)</Label>`;

const replace4 = `                  </div>

                  {/* Технические характеристики */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Технические данные</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Объем двигателя (л)</Label>`;
content = content.replace(search4, replace4);

const search5 = `                <div>
                  <Label>Тип топлива</Label>`;
const replace5 = `                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Тип топлива</Label>`;
content = content.replace(search5, replace5);

const search6 = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Коробка передач</Label>`;
const replace6 = `                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Коробка передач</Label>`;
content = content.replace(search6, replace6);

const search7 = `                <div>
                  <Label>Привод</Label>`;
const replace7 = `                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Привод</Label>`;
content = content.replace(search7, replace7);

const search8 = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Тип кузова</Label>`;
const replace8 = `                  </div>

                  {/* Внешний вид */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Внешний вид</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Тип кузова</Label>`;
content = content.replace(search8, replace8);

const search9 = `                <div>
                  <Label>Цвет</Label>`;
const replace9 = `                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Цвет</Label>`;
content = content.replace(search9, replace9);

const search10 = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label>Ссылка на обзор в TikTok</Label>`;
const replace10 = `                  </div>

                  {/* Медиа ссылки */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Медиа ссылки</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">TikTok</Label>`;
content = content.replace(search10, replace10);

const search11 = `                <div>
                  <Label>Ссылка на обзор в YouTube</Label>`;
const replace11 = `                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">YouTube</Label>`;
content = content.replace(search11, replace11);

fs.writeFileSync('components/admin/admin-cars.tsx', content);
