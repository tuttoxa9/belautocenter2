const fs = require('fs');

let content = fs.readFileSync('components/admin/admin-cars.tsx', 'utf8');

// Замена заголовка и табов + кнопок в начале SheetContent
const searchHeader = `<SheetHeader>
              <SheetTitle className="text-lg md:text-xl">{editingCar ? "Редактировать" : "Добавить"} автомобиль</SheetTitle>
            </SheetHeader>

            {/* Навигация по разделам */}
            <div className="flex gap-1 mb-6 mt-4 bg-muted/50 dark:bg-zinc-800/50 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={\`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all \${
                  activeTab === "basic"
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }\`}
              >
                Основная информация
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={\`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all \${
                  activeTab === "images"
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }\`}
              >
                Изображения
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={\`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all \${
                  activeTab === "json"
                    ? "bg-background text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }\`}
              >
                JSON
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Раздел: Основная информация */}
              {activeTab === "basic" && (
                <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">`;

const replaceHeader = `<div className="sticky top-0 z-50 -mx-6 -mt-6 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <SheetTitle className="text-2xl font-light tracking-tight text-foreground">
                  {editingCar ? "Редактирование автомобиля" : "Новый автомобиль"}
                </SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Заполните данные ниже
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="rounded-full px-6 bg-transparent" onClick={() => setIsSheetOpen(false)}>
                  Отмена
                </Button>
                <Button type="button" className="rounded-full px-6" onClick={(e) => {
                  // Инициируем submit формы програмно
                  const form = document.getElementById("car-form");
                  if (form) form.requestSubmit();
                }} loading={isSaving}>
                  {editingCar ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </div>

            {/* Навигация по разделам (Современные Pills) */}
            <div className="flex flex-wrap gap-2 mt-8 mb-8">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={\`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 \${
                  activeTab === "basic"
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }\`}
              >
                Основная информация
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={\`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 \${
                  activeTab === "images"
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }\`}
              >
                Галерея
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={\`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 \${
                  activeTab === "json"
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }\`}
              >
                Импорт/Экспорт JSON
              </button>
            </div>

            <form id="car-form" onSubmit={handleSubmit} className="space-y-12 pb-24">
              {/* Раздел: Основная информация */}
              {activeTab === "basic" && (
                <div className="space-y-10">
                  {/* Базовая информация */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium tracking-tight border-b pb-2">Базовые параметры</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">`;

content = content.replace(searchHeader, replaceHeader);

fs.writeFileSync('components/admin/admin-cars.tsx', content);
