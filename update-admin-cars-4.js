const fs = require('fs');

let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Фиксим закрывающие дивы
const searchClose = `                  </div>
                </div>
              )}

              {/* Раздел: Изображения */}`;
const replaceClose = `                    </div>
                  </div>
                </div>
              )}

              {/* Раздел: Изображения */}`;
content = content.replace(searchClose, replaceClose);

// Раздел: Изображения
const searchImg = `              {/* Раздел: Изображения */}
              {activeTab === "images" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Фотографии автомобиля</Label>`;
const replaceImg = `              {/* Раздел: Изображения */}
              {activeTab === "images" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <div className="flex flex-col space-y-2 mb-6">
                      <h3 className="text-xl font-medium tracking-tight">Галерея фотографий</h3>`;
content = content.replace(searchImg, replaceImg);

// Раздел JSON
const searchJson = `              {/* Раздел: JSON */}
              {activeTab === "json" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Импорт данных из JSON</Label>`;
const replaceJson = `              {/* Раздел: JSON */}
              {activeTab === "json" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 shadow-sm">
                    <h3 className="text-xl font-medium tracking-tight mb-2">Импорт данных</h3>`;
content = content.replace(searchJson, replaceJson);

// Предпросмотр JSON
const searchJsonPrev = `                  {/* Предпросмотр текущих данных формы */}
                  <div>
                    <Label className="text-sm mb-2 block">Предпросмотр данных формы</Label>`;
const replaceJsonPrev = `                  </div>

                  {/* Предпросмотр текущих данных формы */}
                  <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 shadow-sm mt-8">
                    <h3 className="text-xl font-medium tracking-tight mb-2">Экспорт текущих данных</h3>`;
content = content.replace(searchJsonPrev, replaceJsonPrev);


fs.writeFileSync('components/admin/admin-cars.tsx', content);
