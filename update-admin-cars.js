const fs = require('fs');
const content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

const updatedContent = content.replace(
  /<form onSubmit={handleSubmit} className="space-y-4">[\s\S]*?(?=<\/form>)/m,
  `<form onSubmit={handleSubmit} className="space-y-6">
              {/* Раздел: Основная информация */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  {/* Главный блок - Карточка */}
                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Основные данные</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Марка</Label>
                        <Input
                          value={carForm.make}
                          onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all"
                          placeholder="Например: BMW"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Модель</Label>
                        <Input
                          value={carForm.model}
                          onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all"
                          placeholder="Например: X5"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Год выпуска</Label>
                        <Input
                          type="number"
                          value={carForm.year}
                          onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Цена ($)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                          <Input
                            type="number"
                            value={carForm.price}
                            onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
                            className="h-11 pl-8 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all font-semibold"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Пробег (км)</Label>
                        <Input
                          type="number"
                          value={carForm.mileage}
                          onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all"
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Технические характеристики - Карточка */}
                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Технические детали</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Тип топлива</Label>
                        <Select
                          value={carForm.fuelType}
                          onValueChange={(value) => {
                            const newForm = { ...carForm, fuelType: value }
                            if (value === "Электро") newForm.engineVolume = ""
                            setCarForm(newForm)
                          }}
                        >
                          <SelectTrigger className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all">
                            <SelectValue placeholder="Выберите тип топлива" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-muted-foreground/20">
                            <SelectItem value="Бензин" className="rounded-lg my-1">Бензин</SelectItem>
                            <SelectItem value="Дизель" className="rounded-lg my-1">Дизель</SelectItem>
                            <SelectItem value="Гибрид" className="rounded-lg my-1">Гибрид</SelectItem>
                            <SelectItem value="Электро" className="rounded-lg my-1">Электро</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Объем двигателя (л)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={carForm.engineVolume}
                          onChange={(e) => setCarForm({ ...carForm, engineVolume: e.target.value })}
                          disabled={carForm.fuelType === "Электро"}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all disabled:opacity-50"
                          placeholder={carForm.fuelType === "Электро" ? "Не требуется" : "Например: 2.0"}
                          required={carForm.fuelType !== "Электро"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Коробка передач</Label>
                        <Select
                          value={carForm.transmission}
                          onValueChange={(value) => setCarForm({ ...carForm, transmission: value })}
                        >
                          <SelectTrigger className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all">
                            <SelectValue placeholder="Выберите КПП" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-muted-foreground/20">
                            <SelectItem value="Автомат" className="rounded-lg my-1">Автомат</SelectItem>
                            <SelectItem value="Механика" className="rounded-lg my-1">Механика</SelectItem>
                            <SelectItem value="Вариатор" className="rounded-lg my-1">Вариатор</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Привод</Label>
                        <Select
                          value={carForm.driveTrain}
                          onValueChange={(value) => setCarForm({ ...carForm, driveTrain: value })}
                        >
                          <SelectTrigger className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all">
                            <SelectValue placeholder="Выберите привод" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-muted-foreground/20">
                            <SelectItem value="Передний" className="rounded-lg my-1">Передний</SelectItem>
                            <SelectItem value="Задний" className="rounded-lg my-1">Задний</SelectItem>
                            <SelectItem value="Полный" className="rounded-lg my-1">Полный</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Тип кузова</Label>
                        <Input
                          value={carForm.bodyType}
                          onChange={(e) => setCarForm({ ...carForm, bodyType: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all"
                          placeholder="Седан, Внедорожник..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Цвет</Label>
                        <Input
                          value={carForm.color}
                          onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all"
                          placeholder="Например: Черный металлик"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Медиа и ссылки - Карточка */}
                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Медиа ссылки</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          Ссылка TikTok
                        </Label>
                        <Input
                          value={carForm.tiktok_url}
                          onChange={(e) => setCarForm({ ...carForm, tiktok_url: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all text-sm"
                          placeholder="https://tiktok.com/@..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          Ссылка YouTube
                        </Label>
                        <Input
                          value={carForm.youtube_url}
                          onChange={(e) => setCarForm({ ...carForm, youtube_url: e.target.value })}
                          className="h-11 bg-background/50 border-muted-foreground/20 focus:border-primary rounded-lg transition-all text-sm"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Описание - Карточка */}
                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Описание</h3>
                      <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded border border-border/50">Markdown</span>
                    </div>

                    <Tabs defaultValue="edit" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-10 bg-background/50 p-1 border border-border/50 rounded-lg mb-3">
                        <TabsTrigger value="edit" className="rounded-md text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">Редактор</TabsTrigger>
                        <TabsTrigger value="preview" className="rounded-md text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">Предпросмотр</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit" className="mt-0">
                        <Textarea
                          className="w-full p-4 border-muted-foreground/20 bg-background/50 rounded-xl text-sm min-h-[160px] focus:border-primary transition-all resize-y"
                          value={carForm.description}
                          onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                          placeholder="Подробное описание автомобиля..."
                        />
                      </TabsContent>
                      <TabsContent value="preview" className="mt-0">
                        <div className="w-full p-4 border border-muted-foreground/20 rounded-xl bg-background/50 min-h-[160px] prose prose-sm dark:prose-invert max-w-none">
                          {carForm.description ? (
                            <MarkdownRenderer content={carForm.description} />
                          ) : (
                            <p className="text-muted-foreground italic text-sm">Нет описания для предпросмотра...</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Статусы и метки - Карточка */}
                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Статус и видимость</h3>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <label className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={carForm.isAvailable}
                            onChange={(e) => setCarForm({ ...carForm, isAvailable: e.target.checked })}
                          />
                          <div className="w-5 h-5 border-2 border-muted-foreground/40 rounded bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">В наличии</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={carForm.showOnHomepage}
                            onChange={(e) => setCarForm({ ...carForm, showOnHomepage: e.target.checked })}
                          />
                          <div className="w-5 h-5 border-2 border-muted-foreground/40 rounded bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">На главную</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-border/50 rounded-xl bg-background/50 hover:bg-muted/50 cursor-pointer transition-colors flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={carForm.fromEurope}
                            onChange={(e) => setCarForm({ ...carForm, fromEurope: e.target.checked })}
                          />
                          <div className="w-5 h-5 border-2 border-muted-foreground/40 rounded bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">Без пробега по РБ</span>
                      </label>
                    </div>
                  </div>

                  {/* Характеристики и Комплектация */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Характеристики */}
                    <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Характеристики</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => setCarForm({ ...carForm, specifications: { ...carForm.specifications, "": "" } })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Добавить
                        </Button>
                      </div>

                      <div className="space-y-2.5">
                        {Object.entries(carForm.specifications).map(([key, value], index) => (
                          <div key={index} className="flex gap-2 items-center group">
                            <Input
                              placeholder="Свойство"
                              value={key}
                              className="h-9 text-xs bg-background/50 border-muted-foreground/20 rounded-lg flex-1"
                              onChange={(e) => {
                                const newSpecs = { ...carForm.specifications }
                                delete newSpecs[key]
                                newSpecs[e.target.value] = value
                                setCarForm({ ...carForm, specifications: newSpecs })
                              }}
                            />
                            <Input
                              placeholder="Значение"
                              value={value}
                              className="h-9 text-xs bg-background/50 border-muted-foreground/20 rounded-lg flex-1"
                              onChange={(e) => {
                                setCarForm({
                                  ...carForm,
                                  specifications: { ...carForm.specifications, [key]: e.target.value }
                                })
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-50 group-hover:opacity-100 transition-all shrink-0"
                              onClick={() => {
                                const newSpecs = { ...carForm.specifications }
                                delete newSpecs[key]
                                setCarForm({ ...carForm, specifications: newSpecs })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {Object.keys(carForm.specifications).length === 0 && (
                           <p className="text-xs text-muted-foreground italic text-center py-2">Нет добавленных характеристик</p>
                        )}
                      </div>
                    </div>

                    {/* Комплектация */}
                    <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Комплектация</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => setCarForm({ ...carForm, features: [...carForm.features, ""] })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Добавить
                        </Button>
                      </div>

                      <div className="space-y-2.5">
                        {carForm.features.map((feature, index) => (
                          <div key={index} className="flex gap-2 items-center group">
                            <Input
                              placeholder="Опция комплектации"
                              value={feature}
                              className="h-9 text-xs bg-background/50 border-muted-foreground/20 rounded-lg flex-1"
                              onChange={(e) => {
                                const newFeatures = [...carForm.features]
                                newFeatures[index] = e.target.value
                                setCarForm({ ...carForm, features: newFeatures })
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-50 group-hover:opacity-100 transition-all shrink-0"
                              onClick={() => {
                                const newFeatures = carForm.features.filter((_, i) => i !== index)
                                setCarForm({ ...carForm, features: newFeatures })
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {carForm.features.length === 0 && (
                           <p className="text-xs text-muted-foreground italic text-center py-2">Список опций пуст</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Раздел: Изображения */}
              {activeTab === "images" && (
                <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-6 shadow-sm space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Фотографии автомобиля</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Загрузите качественные фотографии. Первое изображение будет использоваться как главное (обложка).
                    </p>
                  </div>

                  <div className="bg-background/50 border border-dashed border-border/60 rounded-xl p-4">
                    <ImageUpload
                      multiple={true}
                      currentImages={carForm.imageUrls.filter(url => url.trim() !== "")}
                      path="cars"
                      onMultipleUpload={(allUrls) => {
                        setCarForm({ ...carForm, imageUrls: allUrls.length > 0 ? allUrls : [""] })
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* Раздел: JSON */}
              {activeTab === "json" && (
                <div className="space-y-6">
                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" /> Импорт данных (JSON)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Вставьте сырой JSON для быстрого предзаполнения полей формы. Внимание: текущие введенные данные будут перезаписаны.
                    </p>
                    <div className="relative">
                      <Textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="font-mono text-xs h-48 bg-background/80 border-muted-foreground/20 rounded-xl focus:border-primary p-4 resize-y"
                        placeholder='{\n  "make": "BMW",\n  "model": "X5"\n}'
                      />
                    </div>
                    {jsonError && (
                      <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg border border-destructive/20 font-medium">
                        {jsonError}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={processJsonInput}
                        className="flex-1 h-11 rounded-lg font-medium shadow-sm"
                      >
                        Применить JSON
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {setJsonInput(""); setJsonError("")}}
                        className="flex-1 h-11 rounded-lg font-medium"
                      >
                        Очистить
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card dark:bg-zinc-900/40 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Предпросмотр данных формы</h3>
                    <div className="relative">
                      <Textarea
                        value={JSON.stringify({
                          make: carForm.make,
                          model: carForm.model,
                          year: Number(carForm.year),
                          price: Number(carForm.price),
                          mileage: Number(carForm.mileage),
                          engineVolume: carForm.fuelType === "Электро" ? 0 : parseFloat(carForm.engineVolume || 0),
                          fuelType: carForm.fuelType,
                          transmission: carForm.transmission,
                          driveTrain: carForm.driveTrain,
                          bodyType: carForm.bodyType,
                          color: carForm.color,
                          description: carForm.description,
                          imageUrls: carForm.imageUrls.filter(url => url.trim() !== ""),
                          isAvailable: carForm.isAvailable,
                          showOnHomepage: carForm.showOnHomepage,
                          fromEurope: carForm.fromEurope,
                          specifications: carForm.specifications,
                          features: carForm.features,
                          tiktok_url: carForm.tiktok_url,
                          youtube_url: carForm.youtube_url
                        }, null, 2)}
                        className="font-mono text-xs h-64 bg-muted/30 border-muted-foreground/20 rounded-xl p-4 resize-y cursor-text"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Кнопки управления */}
              <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border mt-8 flex flex-col sm:flex-row gap-3 z-10 -mx-6 px-6">
                <Button type="submit" className="flex-1 h-12 rounded-xl text-sm font-semibold shadow-md" loading={isSaving}>
                  {editingCar ? "Сохранить изменения" : "Добавить автомобиль"}
                </Button>
                <Button type="button" variant="outline" className="h-12 rounded-xl text-sm font-semibold sm:w-1/3" onClick={() => setIsSheetOpen(false)}>
                  Отмена
                </Button>
              </div>
            `
);

fs.writeFileSync('components/admin/admin-cars.tsx', updatedContent);
