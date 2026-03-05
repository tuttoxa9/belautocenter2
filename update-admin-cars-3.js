const fs = require('fs');

let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Марка и модель (самое начало)
const searchMake = `              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-sm">Марка</Label>`;
const replaceMake = `                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Марка</Label>`;
content = content.replace(searchMake, replaceMake);

const searchModel = `                <div>
                  <Label className="text-sm">Модель</Label>`;
const replaceModel = `                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Модель</Label>`;
content = content.replace(searchModel, replaceModel);

// Описание
const searchDesc = `              <div>
                <Label className="text-sm">Описание (Markdown поддерживается)</Label>`;
const replaceDesc = `                  </div>

                  {/* Описание */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Описание</h3>
                    <div className="mt-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Детальное описание</Label>`;
content = content.replace(searchDesc, replaceDesc);

// Чекбоксы
const searchChecks = `                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input`;
const replaceChecks = `                    </div>
                  </div>

                  {/* Статус и опции */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Статус и опции</h3>
                    <div className="flex flex-col sm:flex-row gap-6 mt-6 p-6 bg-muted/20 rounded-xl border border-border/50">
                      <div className="flex items-center space-x-3 cursor-pointer hover:bg-muted/40 p-3 rounded-lg transition-colors flex-1">
                        <input
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"`;
content = content.replace(searchChecks, replaceChecks);

const searchCheck2 = `                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showOnHomepage"`;
const replaceCheck2 = `                      <div className="flex items-center space-x-3 cursor-pointer hover:bg-muted/40 p-3 rounded-lg transition-colors flex-1">
                        <input
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                          type="checkbox"
                          id="showOnHomepage"`;
content = content.replace(searchCheck2, replaceCheck2);

const searchCheck3 = `                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="fromEurope"`;
const replaceCheck3 = `                      <div className="flex items-center space-x-3 cursor-pointer hover:bg-muted/40 p-3 rounded-lg transition-colors flex-1">
                        <input
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                          type="checkbox"
                          id="fromEurope"`;
content = content.replace(searchCheck3, replaceCheck3);


// Спецификации
const searchSpecs = `                  <div>
                    <Label className="text-sm">Характеристики</Label>`;
const replaceSpecs = `                    </div>
                  </div>

                  {/* Характеристики */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Характеристики</h3>
                    <div className="space-y-4 mt-6">`;
content = content.replace(searchSpecs, replaceSpecs);

// Комплектация
const searchFeatures = `                  <div>
                    <Label className="text-sm">Комплектация</Label>`;
const replaceFeatures = `                    </div>
                  </div>

                  {/* Комплектация */}
                  <div className="space-y-6 pt-6 mt-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Комплектация</h3>
                    <div className="space-y-4 mt-6 bg-muted/10 p-6 rounded-xl border border-border/30">`;
content = content.replace(searchFeatures, replaceFeatures);

// Убираем старые кнопки
const searchButtons = `              {/* Кнопки управления */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                <Button type="submit" className="flex-1 text-sm" loading={isSaving}>
                  {editingCar ? "Сохранить изменения" : "Добавить автомобиль"}
                </Button>
                <Button type="button" variant="outline" className="text-sm" onClick={() => setIsSheetOpen(false)}>
                  Отмена
                </Button>
              </div>`;
const replaceButtons = `              {/* Кнопки управления перемещены в sticky header */}`;
content = content.replace(searchButtons, replaceButtons);

fs.writeFileSync('components/admin/admin-cars.tsx', content);
