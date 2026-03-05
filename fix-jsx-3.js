const fs = require('fs');
let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// В Images не закрыт div для галереи

const search = `                      <h3 className="text-xl font-medium tracking-tight">Галерея фотографий</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Загрузите качественные фотографии автомобиля. Первое изображение будет использоваться как главное.
                    </p>
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
              )}`;

const replace = `                      <h3 className="text-xl font-medium tracking-tight">Галерея фотографий</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Загрузите качественные фотографии автомобиля. Первое изображение будет использоваться как главное.
                    </p>
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
              )}`;
content = content.replace(search, replace);
fs.writeFileSync('components/admin/admin-cars.tsx', content);
