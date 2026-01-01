"use client"

import Image from "next/image"
import { useState } from "react"
import {
  Shield,
  Car,
  Zap,
  Clock,
  CheckCircle2,
  Phone,
  ArrowRight,
  Info,
  BadgeCheck,
  Wrench,
  HelpCircle,
  AlertTriangle,
  Battery,
  MapPin,
  ChevronDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { WarrantyDrawer } from "@/components/WarrantyDrawer"

export default function WarrantyPage() {
  const [activeTab, setActiveTab] = useState("help")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<{title: string, price: string}>({ title: "", price: "" })

  const handleSelectProgram = (title: string, price: string) => {
    setSelectedProgram({ title, price })
    setDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black selection:bg-blue-500/30 font-sans">
      <WarrantyDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        programTitle={selectedProgram.title}
        programPrice={selectedProgram.price}
      />

      {/* Hero Section */}
      <section className="relative min-h-[75vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center pb-16 md:pb-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/warranty-hero.jpg"
            alt="Гарантия и техпомощь"
            fill
            className="object-cover object-center scale-105"
            priority
          />
          {/* Darker overlay for better text contrast in light mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/60" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
          {/* Blend to page background at the very bottom */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-50 dark:from-black to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 px-4 md:px-6 text-center text-white space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pt-20 md:pt-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wide">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="uppercase tracking-widest text-xs">Официальная защита</span>
          </div>

          <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] md:leading-[0.9]">
            Абсолютная <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">
              уверенность
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base md:text-xl text-zinc-200 font-light leading-relaxed">
            Премиальная программа защиты автомобиля от Белавто Центр и DrivePolis.
            Мы берем на себя ответственность за техническое состояние вашего авто.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4 relative z-20 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 md:h-14 bg-white text-black hover:bg-zinc-200 text-base md:text-lg font-medium transition-all hover:scale-105" onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}>
              Выбрать программу
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-12 md:h-14 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base md:text-lg font-medium" asChild>
              <a href="tel:+375291234567">
                <Phone className="w-5 h-5 mr-2" />
                Связаться с нами
              </a>
            </Button>
          </div>

          <div className="pt-8 md:pt-12 opacity-90 relative z-10">
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Партнер программы</p>
            <div className="relative h-10 md:h-12 w-32 md:w-48 mx-auto">
               <Image
                src="/logo_polis.png"
                alt="DrivePolis"
                fill
                className="object-contain hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
           <ChevronDown className="w-8 h-8 text-white" />
        </div>
      </section>

      {/* Stats / Features Grid - Floating over hero */}
      <section className="relative z-20 -mt-8 md:-mt-20 container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
          {[
            { icon: Clock, title: "24/7 Поддержка", desc: "Круглосуточная помощь на дорогах Беларуси" },
            { icon: BadgeCheck, title: "Официальный договор", desc: "Юридическая гарантия всех обязательств" },
            { icon: Wrench, title: "Любые СТО", desc: "Ремонт на сертифицированных станциях" }
          ].map((item, i) => (
             <div key={i} className="bg-white/95 dark:bg-black/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-xl text-zinc-900 dark:text-white hover:-translate-y-2 transition-transform duration-300">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 dark:bg-zinc-900 border border-blue-100 dark:border-white/5 flex items-center justify-center mb-4 md:mb-6">
                 <item.icon className="w-6 h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
               </div>
               <h3 className="text-lg md:text-xl font-bold mb-2">{item.title}</h3>
               <p className="text-sm md:text-base text-muted-foreground dark:text-zinc-400 leading-relaxed">{item.desc}</p>
             </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-12 md:py-32 relative">
         {/* Decorative background blobs */}
         <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
         <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">Выберите уровень защиты</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Индивидуальные решения для каждого автомобиля и бюджета
            </p>
          </div>

          <Tabs defaultValue="help" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-start md:justify-center mb-8 md:mb-16 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="h-auto w-auto flex-nowrap bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                <ModernTabTrigger value="help" label="Помощь" active={activeTab === "help"} />
                <ModernTabTrigger value="pro" label="Гарантия" active={activeTab === "pro"} />
                <ModernTabTrigger value="el" label="Электро" active={activeTab === "el"} />
                <ModernTabTrigger value="old" label="С пробегом" active={activeTab === "old"} />
              </TabsList>
            </div>

            <div className="min-h-[400px] transition-all duration-500">
              <TabsContent value="help" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-8 duration-500">
                <ProgramContent
                  title="Драйв-HELP"
                  subtitle="Полное спокойствие в пути. От эвакуации до юридической помощи."
                  theme="orange"
                >
                  <ModernPricingCard
                    title="Стандарт"
                    price="789 BYN"
                    features={["Базовая помощь 24/7", "Эвакуация при ДТП", "Запуск двигателя"]}
                    theme="orange"
                    onSelect={() => handleSelectProgram("Драйв-HELP Стандарт", "789 BYN")}
                  />
                  <ModernPricingCard
                    title="Премиум"
                    price="1 199 BYN"
                    features={["Расширенная эвакуация", "Подвоз топлива", "Такси с места ДТП", "Юридическая помощь"]}
                    isPopular
                    theme="orange"
                    onSelect={() => handleSelectProgram("Драйв-HELP Премиум", "1 199 BYN")}
                  />
                  <ModernPricingCard
                    title="VIP"
                    price="1 599 BYN"
                    features={["Безлимитная эвакуация", "Трезвый водитель", "Трансфер в аэропорт", "Персональный менеджер"]}
                    theme="orange"
                    onSelect={() => handleSelectProgram("Драйв-HELP VIP", "1 599 BYN")}
                  />
                </ProgramContent>
                <div className="flex justify-center mt-12">
                   <DetailsDialog title="Программа Драйв-HELP" color="orange"><HelpDetails /></DetailsDialog>
                </div>
              </TabsContent>

              <TabsContent value="pro" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-8 duration-500">
                <ProgramContent
                  title="Драйв-PRO"
                  subtitle="Защита основных узлов и агрегатов автомобиля от дорогостоящего ремонта."
                  theme="blue"
                >
                  <ModernPricingCard
                    title="Стандарт"
                    price="1 800 BYN"
                    limit="27 000 BYN"
                    features={["Двигатель", "Коробка передач", "Мосты и редукторы"]}
                    theme="blue"
                    onSelect={() => handleSelectProgram("Драйв-PRO Стандарт", "1 800 BYN")}
                  />
                  <ModernPricingCard
                    title="Стандарт +"
                    price="2 500 BYN"
                    limit="40 000 BYN"
                    features={["Всё из Стандарт", "Рулевое управление", "Тормозная система", "Система охлаждения"]}
                    isPopular
                    theme="blue"
                    onSelect={() => handleSelectProgram("Драйв-PRO Стандарт +", "2 500 BYN")}
                  />
                  <ModernPricingCard
                    title="Премиум"
                    price="3 116 BYN"
                    limit="58 000 BYN"
                    features={["Максимальное покрытие", "Электрика и климат", "Топливная система", "Турбонагнетатель"]}
                    theme="blue"
                    onSelect={() => handleSelectProgram("Драйв-PRO Премиум", "3 116 BYN")}
                  />
                </ProgramContent>
                <div className="flex justify-center mt-12">
                   <DetailsDialog title="Программа Драйв-PRO" color="blue"><ProDetails /></DetailsDialog>
                </div>
              </TabsContent>

              <TabsContent value="el" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-8 duration-500">
                <ProgramContent
                  title="Драйв-EL"
                  subtitle="Специализированная защита для электромобилей и гибридов."
                  theme="green"
                >
                  <ModernPricingCard
                    title="Стандарт"
                    price="2 570 BYN"
                    limit="57 985 BYN"
                    features={["Тяговые двигатели", "Редуктор", "Лимит на ВВБ: 13 644 BYN"]}
                    theme="green"
                    onSelect={() => handleSelectProgram("Драйв-EL Стандарт", "2 570 BYN")}
                  />
                  <ModernPricingCard
                    title="Стандарт +"
                    price="3 370 BYN"
                    limit="73 335 BYN"
                    features={["Инвертор", "Блок зарядки", "Лимит на ВВБ: 17 055 BYN"]}
                    isPopular
                    theme="green"
                    onSelect={() => handleSelectProgram("Драйв-EL Стандарт +", "3 370 BYN")}
                  />
                  <ModernPricingCard
                    title="Премиум"
                    price="4 370 BYN"
                    limit="90 390 BYN"
                    features={["Максимальная защита", "Электроника", "Лимит на ВВБ: 20 466 BYN"]}
                    theme="green"
                    onSelect={() => handleSelectProgram("Драйв-EL Премиум", "4 370 BYN")}
                  />
                </ProgramContent>
                <div className="flex justify-center mt-12">
                   <DetailsDialog title="Программа Драйв-EL" color="green"><ElDetails /></DetailsDialog>
                </div>
              </TabsContent>

              <TabsContent value="old" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-8 duration-500">
                 <div className="max-w-5xl mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] p-6 md:p-12 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-purple-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
                       <div className="space-y-6 md:space-y-8">
                          <div>
                            <Badge variant="outline" className="mb-4 text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300">Для авто с пробегом</Badge>
                            <h3 className="text-2xl md:text-4xl font-bold mb-4">Драйв-OLD</h3>
                            <p className="text-base md:text-lg text-muted-foreground">
                              Специальное решение для автомобилей старше 10 лет. Мы понимаем риски и готовы их разделить.
                            </p>
                          </div>

                          <div className="space-y-4">
                             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800">
                                <div className="w-12 h-12 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                   <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="font-bold text-lg">Только важное</p>
                                   <p className="text-sm text-muted-foreground">ДВС, КПП, Мосты, Рулевое</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800">
                                <div className="w-12 h-12 shrink-0 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                   <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="font-bold text-lg">До 20 лет</p>
                                   <p className="text-sm text-muted-foreground">Возраст автомобиля</p>
                                </div>
                             </div>
                          </div>

                          <div className="flex gap-4">
                             <DetailsDialog title="Программа Драйв-OLD" color="purple" variant="outline"><OldDetails /></DetailsDialog>
                          </div>
                       </div>

                       <div className="relative">
                          <Card className="border-0 shadow-2xl bg-white dark:bg-zinc-950 rounded-[2rem] overflow-hidden">
                             <CardContent className="p-6 md:p-8 text-center space-y-6">
                                <div className="text-sm uppercase tracking-wider text-muted-foreground font-medium">Единый тариф</div>
                                <div className="text-4xl md:text-5xl font-bold text-foreground">1 650 <span className="text-xl md:text-2xl text-muted-foreground font-normal">BYN</span></div>
                                <div className="w-full h-px bg-border" />
                                <ul className="space-y-3 text-left pl-4">
                                   {["Лимит: 21 500 BYN", "Пробег до 375 000 км", "Без ограничений обращений"].map((item, i) => (
                                      <li key={i} className="flex items-center gap-3 text-sm md:text-base">
                                         <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                                         <span>{item}</span>
                                      </li>
                                   ))}
                                </ul>
                                <Button
                                  className="w-full h-12 rounded-xl text-lg bg-purple-600 hover:bg-purple-700 text-white"
                                  onClick={() => handleSelectProgram("Драйв-OLD", "1 650 BYN")}
                                >
                                   Оформить сейчас
                                </Button>
                             </CardContent>
                          </Card>
                       </div>
                    </div>
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 md:py-24 bg-zinc-100 dark:bg-zinc-900/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />

        <div className="container px-4 md:px-6 relative z-10">
           <div className="mb-10 md:mb-16 md:text-center">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Как это работает</h2>
              <p className="text-muted-foreground text-base md:text-lg">Прозрачный процесс от покупки до получения выплаты</p>
           </div>

           <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                 { step: "01", title: "Оформление", desc: "При покупке автомобиля выберите подходящий пакет гарантии. Договор подписывается на месте." },
                 { step: "02", title: "Обращение", desc: "При наступлении гарантийного случая позвоните в круглосуточный контакт-центр." },
                 { step: "03", title: "Ремонт", desc: "Направим на сертифицированную СТО. Все расходы на запчасти и работы мы берем на себя." }
              ].map((item, i) => (
                 <div key={i} className="group relative bg-background rounded-[2rem] p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg">
                    <div className="text-5xl md:text-6xl font-bold text-zinc-100 dark:text-zinc-800 mb-6 group-hover:text-blue-50 dark:group-hover:text-blue-900/20 transition-colors duration-300">{item.step}</div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4 relative z-10">{item.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground relative z-10">{item.desc}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-24 bg-zinc-50 dark:bg-black relative">
        <div className="container px-4 md:px-6 max-w-4xl relative z-10">
           <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Частые вопросы</h2>
           </div>

           <div className="space-y-4">
            {[
              { q: "Как быстро приедет помощь?", a: "Время прибытия зависит от дорожной ситуации и вашего местоположения, но мы стараемся обеспечить максимально быструю реакцию. В среднем по городу — 30-40 минут." },
              { q: "Действует ли услуга за пределами моего города?", a: "Да, покрытие действует на всей территории Республики Беларусь." },
              { q: "Можно ли подключить услугу после поломки?", a: "Нет, программа оформляется заранее как превентивная мера защиты. Это работает как страховка: нужно купить полис до наступления страхового случая." },
              { q: "Нужно ли заключать договор?", a: "Да, услуга предоставляется на основании официального договора, который вы подписываете при покупке. Это ваша юридическая гарантия." },
              { q: "Какие авто не попадают под гарантию?", a: "Автомобили, используемые в такси, прокате, автошколах, а также авто с тюнингом, меняющим заводские характеристики." }
            ].map((item, i) => (
               <Accordion key={i} type="single" collapsible>
                  <AccordionItem value={`item-${i}`} className="border-b border-zinc-200 dark:border-zinc-800">
                     <AccordionTrigger className="text-base md:text-lg font-medium hover:text-blue-600 text-left py-6">
                        {item.q}
                     </AccordionTrigger>
                     <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pb-6">
                        {item.a}
                     </AccordionContent>
                  </AccordionItem>
               </Accordion>
            ))}
           </div>
        </div>
      </section>

      {/* Spacer for footer overlap/mobile nav */}
       <div className="h-24 md:h-0 bg-zinc-50 dark:bg-black"></div>
    </div>
  )
}

// Modern Helper Components

function ModernTabTrigger({ value, label, active }: { value: string, label: string, active: boolean }) {
   return (
      <TabsTrigger
         value={value}
         className={cn(
            "rounded-full px-6 py-3 text-sm font-medium transition-all duration-300 z-10",
            active
               ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg scale-105"
               : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
         )}
      >
         {label}
      </TabsTrigger>
   )
}

function ProgramContent({ title, subtitle, children, theme }: any) {
   const themeColors: any = {
      orange: "from-orange-500/20 to-transparent",
      blue: "from-blue-500/20 to-transparent",
      green: "from-green-500/20 to-transparent",
      purple: "from-purple-500/20 to-transparent",
   }

   return (
      <div className="space-y-12">
         <div className="text-center space-y-4 px-2">
            <h3 className="text-2xl md:text-4xl font-bold">{title}</h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
         </div>
         <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {children}
         </div>
      </div>
   )
}

function ModernPricingCard({ title, price, limit, features, isPopular, theme, onSelect }: any) {
   const borderColors: any = {
      orange: "group-hover:border-orange-500/50",
      blue: "group-hover:border-blue-500/50",
      green: "group-hover:border-green-500/50",
      purple: "group-hover:border-purple-500/50",
   }

   const badgeColors: any = {
      orange: "bg-orange-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
   }

   return (
      <div className={cn(
         "group relative flex flex-col p-6 md:p-8 rounded-[2rem] bg-background border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
         borderColors[theme],
         isPopular ? "shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-700" : ""
      )}>
         {isPopular && (
            <div className="absolute top-0 inset-x-0 flex justify-center -mt-3">
               <Badge className={cn("px-4 py-1 text-xs font-bold uppercase tracking-wider text-white border-0", badgeColors[theme])}>
                  Популярный выбор
               </Badge>
            </div>
         )}

         <div className="mb-6">
            <h4 className="text-xl font-bold mb-2">{title}</h4>
            <div className="flex items-baseline gap-1">
               <span className="text-3xl font-bold">{price}</span>
            </div>
            {limit && <p className="text-sm text-muted-foreground mt-1">Лимит: {limit}</p>}
         </div>

         <ul className="space-y-4 flex-grow mb-8">
            {features.map((feature: string, i: number) => (
               <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className={cn("w-5 h-5 shrink-0", isPopular ? "text-foreground" : "text-muted-foreground/50")} />
                  <span className="leading-tight">{feature}</span>
               </li>
            ))}
         </ul>

         <Button
            variant={isPopular ? "default" : "outline"}
            className="w-full rounded-xl h-12 font-medium"
            onClick={onSelect}
         >
            Выбрать
         </Button>
      </div>
   )
}

function DetailsDialog({ title, children, color, variant = "default" }: any) {
   const btnStyles: any = {
     orange: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20",
     blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
     green: "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20",
     purple: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
   }

   return (
     <Dialog>
       <DialogTrigger asChild>
         <Button
           size="lg"
           variant={variant === "outline" ? "outline" : "default"}
           className={`rounded-full px-8 h-12 shadow-lg transition-all hover:scale-105 ${variant !== "outline" ? btnStyles[color] : ""}`}
         >
           Подробнее <Info className="ml-2 w-4 h-4" />
         </Button>
       </DialogTrigger>
       <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] modal-content sm:p-10">
         <DialogHeader className="mb-6">
           <DialogTitle className="text-2xl md:text-3xl font-bold">{title}</DialogTitle>
           <DialogDescription className="text-base">
             Подробная информация о предоставляемых услугах и условиях.
           </DialogDescription>
         </DialogHeader>
         {children}
       </DialogContent>
     </Dialog>
   )
 }

function HelpDetails() {
   return (
     <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
       <div>
         <h4 className="font-semibold text-lg mb-4 text-orange-600 flex items-center gap-2">
           <Phone className="w-5 h-5" /> Сервис и Консультации
         </h4>
         <ul className="space-y-3">
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Автосправка 24/7:</span> Консультации по любым вопросам.</li>
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Юрист/Европротокол:</span> Помощь в оформлении ДТП.</li>
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Механик онлайн:</span> Диагностика по телефону.</li>
         </ul>
       </div>
       <div>
         <h4 className="font-semibold text-lg mb-4 text-orange-600 flex items-center gap-2">
           <Car className="w-5 h-5" /> Эвакуация и Техпомощь
         </h4>
         <ul className="space-y-3">
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Эвакуация при ДТП:</span> До СТО или дома.</li>
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Замена колеса:</span> Установка запаски.</li>
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Подвоз топлива:</span> До 10 литров (Премиум+).</li>
           <li className="flex gap-3 text-sm"><span className="font-bold min-w-[140px]">Запуск двигателя:</span> Прикуривание (Премиум+).</li>
         </ul>
       </div>
       <div className="md:col-span-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/50">
         <h4 className="font-semibold mb-2">VIP Услуги</h4>
         <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500"/> Трезвый водитель</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500"/> Такси с места ДТП</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500"/> Трансфер в аэропорт</div>
         </div>
       </div>
     </div>
   )
 }

 function ProDetails() {
   return (
     <div className="space-y-8">
       <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
         <h4 className="font-semibold mb-2">Условия участия</h4>
         <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold">Иномарки:</span> до 20 лет, до 200 000 км</div>
            <div><span className="font-bold">Российские ТС:</span> до 10 лет, до 100 000 км</div>
         </div>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Двигатель", items: ["Блок цилиндров", "ГБЦ", "Поршневая", "Турбина", "Топливная"] },
            { title: "Трансмиссия", items: ["МКПП / АКПП", "Робот / Вариатор", "Гидротрансформатор", "Шестерни и валы"] },
            { title: "Ходовая и Рулевое", items: ["Мосты и редукторы", "Карданный вал", "Рулевая рейка", "Насос ГУР/ЭУР"] },
            { title: "Электрика и Климат", items: ["Стартер / Генератор", "Компрессор кондиционера", "Моторы стеклоочистителей", "ЭБУ"] },
          ].map((group, i) => (
            <div key={i} className="border p-4 rounded-xl">
              <h5 className="font-bold text-blue-600 mb-2">{group.title}</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {group.items.map((item, j) => <li key={j}>• {item}</li>)}
              </ul>
            </div>
          ))}
       </div>
     </div>
   )
 }

 function ElDetails() {
   return (
     <div className="space-y-8">
       <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/50">
         <h4 className="font-semibold mb-2">Условия участия</h4>
         <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold">Электро и Гибриды:</span> до 3 лет, до 100 000 км</div>
         </div>
       </div>

       <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
         <div className="flex gap-4">
           <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit text-green-600"><Battery /></div>
           <div>
             <h5 className="font-bold">Высоковольтная батарея</h5>
             <p className="text-sm text-muted-foreground">Элементы питания, модули, системы охлаждения ВВБ.</p>
           </div>
         </div>
         <div className="flex gap-4">
           <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit text-green-600"><Zap /></div>
           <div>
             <h5 className="font-bold">Электродвигатели</h5>
             <p className="text-sm text-muted-foreground">Ротор, статор, подшипники, корпус тягового мотора.</p>
           </div>
         </div>
         <div className="flex gap-4">
           <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit text-green-600"><AlertTriangle /></div>
           <div>
             <h5 className="font-bold">Инвертор и Электроника</h5>
             <p className="text-sm text-muted-foreground">Силовая электроника, преобразователи тока, контроллеры.</p>
           </div>
         </div>
         <div className="flex gap-4">
           <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg h-fit text-green-600"><MapPin /></div>
           <div>
             <h5 className="font-bold">Зарядка</h5>
             <p className="text-sm text-muted-foreground">Порты зарядного устройства, блоки согласования.</p>
           </div>
         </div>
       </div>
     </div>
   )
 }

 function OldDetails() {
   return (
     <div className="space-y-6">
       <p className="text-lg">
         Программа разработана специально для подержанных автомобилей, где вероятность поломки выше.
         Мы покрываем <span className="font-bold text-foreground">только самое дорогое</span>.
       </p>

       <div className="grid sm:grid-cols-2 gap-4">
         <Card>
           <CardContent className="p-4 pt-4">
             <div className="font-bold mb-1">Двигатель (ДВС)</div>
             <div className="text-sm text-muted-foreground">
                Основные механические части двигателя. Защита от капитального ремонта.
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4 pt-4">
             <div className="font-bold mb-1">Трансмиссия</div>
             <div className="text-sm text-muted-foreground">
                Механическая, автоматическая, роботизированная КПП и вариаторы.
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4 pt-4">
             <div className="font-bold mb-1">Рулевое управление</div>
             <div className="text-sm text-muted-foreground">
                Рулевая рейка и основные элементы управления.
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4 pt-4">
             <div className="font-bold mb-1">Тормозная система</div>
             <div className="text-sm text-muted-foreground">
                Основные узлы тормозной системы (кроме расходников).
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   )
 }
