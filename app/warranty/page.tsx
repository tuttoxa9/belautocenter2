"use client"

import Image from "next/image"
import { useState } from "react"
import {
  Shield,
  Car,
  Zap,
  Clock,
  CheckCircle2,
  HelpCircle,
  Phone,
  FileText,
  Wrench,
  ChevronRight,
  Info,
  Battery,
  AlertTriangle,
  MapPin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function WarrantyPage() {
  const [activeTab, setActiveTab] = useState("help")

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20 xl:py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent dark:from-primary/10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur-lg opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] lg:aspect-square">
                <Image
                  src="/warranty-hero.jpg"
                  alt="Гарантия и техпомощь"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                    <span className="font-medium text-sm tracking-wider uppercase text-yellow-400">Официальная защита</span>
                  </div>
                  <p className="text-lg md:text-xl font-light opacity-90">
                    Ваше спокойствие — наша ответственность.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Поддержка 24/7
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                Ваша уверенность <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  на дороге
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Официальная программа защиты автомобиля от БелАвтоЦентр и DrivePolis.
                Мы покрываем ремонт узлов и выручаем в любой ситуации в пути.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border shadow-sm">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">100+</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">СТО-партнеров</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm p-4 rounded-2xl border shadow-sm">
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">15 мин</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Время реакции</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Tabs Section */}
      <section className="py-16 md:py-24 bg-muted/30 relative">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Выберите вашу программу защиты</h2>
            <p className="text-muted-foreground text-lg">
              Мы разработали специальные тарифы для разных типов автомобилей и потребностей водителей.
            </p>
          </div>

          <Tabs defaultValue="help" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto w-full max-w-4xl gap-2 bg-transparent p-0">
                <TabTrigger value="help" icon={<AlertTriangle />} label="Драйв-HELP" color="orange" isActive={activeTab === "help"} />
                <TabTrigger value="pro" icon={<Shield />} label="Драйв-PRO" color="blue" isActive={activeTab === "pro"} />
                <TabTrigger value="el" icon={<Zap />} label="Драйв-EL" color="green" isActive={activeTab === "el"} />
                <TabTrigger value="old" icon={<Clock />} label="Драйв-OLD" color="gray" isActive={activeTab === "old"} />
              </TabsList>
            </div>

            <div className="relative min-h-[500px]">
              <TabsContent value="help" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProgramSection
                  title="Помощь на дороге"
                  subtitle="Оперативная помощь в экстренных ситуациях 24/7"
                  colorClass="text-orange-600 dark:text-orange-400"
                  bgClass="bg-orange-50 dark:bg-orange-950/20"
                >
                  <PricingCard
                    title="Стандарт"
                    price="789 BYN"
                    description="Базовая помощь на дороге и эвакуация."
                    features={["Базовая помощь", "Эвакуация"]}
                    color="orange"
                  />
                  <PricingCard
                    title="Премиум"
                    price="1 199 BYN"
                    description="Расширенный сервис для комфорта в пути."
                    features={["Расширенный сервис", "Подвоз топлива", "Такси"]}
                    popular
                    color="orange"
                  />
                  <PricingCard
                    title="VIP"
                    price="1 599 BYN"
                    description="Максимальная защита и комфорт."
                    features={["Максимальный пакет", "Трезвый водитель", "Безлимитная эвакуация"]}
                    color="orange"
                  />
                </ProgramSection>
                <div className="flex justify-center mt-12">
                  <DetailsDialog
                    title="Детали программы Драйв-HELP"
                    triggerText="Посмотреть полный список услуг"
                    color="orange"
                  >
                     <HelpDetails />
                  </DetailsDialog>
                </div>
              </TabsContent>

              <TabsContent value="pro" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProgramSection
                  title="Гарантия на авто с ДВС"
                  subtitle="Защита от непредвиденных расходов на ремонт основных узлов"
                  colorClass="text-blue-600 dark:text-blue-400"
                  bgClass="bg-blue-50 dark:bg-blue-950/20"
                >
                  <PricingCard
                    title="Стандарт"
                    price="1 800 BYN"
                    limit="27 000 BYN"
                    features={["Двигатель", "КПП", "Мосты"]}
                    color="blue"
                  />
                  <PricingCard
                    title="Стандарт Плюс"
                    price="2 500 BYN"
                    limit="40 000 BYN"
                    features={["Двигатель, КПП, Мосты", "Рулевое управление", "Тормозная система"]}
                    popular
                    color="blue"
                  />
                  <PricingCard
                    title="Премиум"
                    price="3 116 BYN"
                    limit="58 000 BYN"
                    features={["Все основные узлы", "Электрика", "Климат-контроль", "Топливная система"]}
                    color="blue"
                  />
                </ProgramSection>
                <div className="flex justify-center mt-12">
                  <DetailsDialog
                    title="Условия и покрытие Драйв-PRO"
                    triggerText="Подробнее об условиях гарантии"
                    color="blue"
                  >
                     <ProDetails />
                  </DetailsDialog>
                </div>
              </TabsContent>

              <TabsContent value="el" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProgramSection
                  title="Электромобили и Гибриды"
                  subtitle="Специализированная защита высоковольтных систем и батареи"
                  colorClass="text-green-600 dark:text-green-400"
                  bgClass="bg-green-50 dark:bg-green-950/20"
                >
                  <PricingCard
                    title="Стандарт"
                    price="2 570 BYN"
                    limit="57 985 BYN"
                    features={["Лимит на батарею: 13 644 BYN", "Тяговые двигатели", "Редуктор"]}
                    color="green"
                  />
                  <PricingCard
                    title="Стандарт Плюс"
                    price="3 370 BYN"
                    limit="73 335 BYN"
                    features={["Лимит на батарею: 17 055 BYN", "Инвертор", "Порты зарядки"]}
                    popular
                    color="green"
                  />
                  <PricingCard
                    title="Премиум"
                    price="4 370 BYN"
                    limit="90 390 BYN"
                    features={["Лимит на батарею: 20 466 BYN", "Максимальное покрытие", "Блоки управления"]}
                    color="green"
                  />
                </ProgramSection>
                <div className="flex justify-center mt-12">
                  <DetailsDialog
                    title="Покрытие для Электро и Гибридов"
                    triggerText="Что входит в гарантию?"
                    color="green"
                  >
                     <ElDetails />
                  </DetailsDialog>
                </div>
              </TabsContent>

              <TabsContent value="old" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-10">
                    <h3 className="text-2xl font-bold mb-2">Программа «Драйв-OLD»</h3>
                    <p className="text-muted-foreground">Для автомобилей с пробегом</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Clock className="w-32 h-32" />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-3xl font-bold">Единый тариф</CardTitle>
                        <CardDescription className="text-lg">Оптимальная защита возрастных авто</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-primary">1 650 BYN</span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between py-2 border-b">
                             <span className="text-muted-foreground">Лимит ответственности</span>
                             <span className="font-semibold">21 500 BYN</span>
                           </div>
                           <div className="flex justify-between py-2 border-b">
                             <span className="text-muted-foreground">Возраст иномарки</span>
                             <span className="font-semibold">до 20 лет</span>
                           </div>
                           <div className="flex justify-between py-2 border-b">
                             <span className="text-muted-foreground">Пробег иномарки</span>
                             <span className="font-semibold">до 375 000 км</span>
                           </div>
                        </div>
                        <ul className="space-y-2 pt-2">
                           {["Двигатель", "Трансмиссия", "Рулевое управление", "Тормозная система"].map((item, i) => (
                             <li key={i} className="flex items-center gap-2">
                               <CheckCircle2 className="w-5 h-5 text-gray-500" />
                               <span>{item}</span>
                             </li>
                           ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <DetailsDialog
                          title="Условия Драйв-OLD"
                          triggerText="Подробные условия"
                          variant="outline"
                          color="gray"
                        >
                          <OldDetails />
                        </DetailsDialog>
                      </CardFooter>
                    </Card>

                    <div className="space-y-8 p-6">
                       <div className="space-y-4">
                         <h4 className="text-xl font-semibold flex items-center gap-2">
                           <Shield className="w-6 h-6 text-gray-500" />
                           Только ключевые узлы
                         </h4>
                         <p className="text-muted-foreground">
                           Мы понимаем, что в автомобилях с пробегом риски выше. Поэтому программа фокусируется на защите самых дорогостоящих агрегатов, ремонт которых может существенно ударить по бюджету.
                         </p>
                       </div>

                       <div className="space-y-4">
                         <h4 className="text-xl font-semibold flex items-center gap-2">
                           <Wrench className="w-6 h-6 text-gray-500" />
                           Без ограничений обращений
                         </h4>
                         <p className="text-muted-foreground">
                           В рамках общего лимита ответственности количество обращений не ограничено. Сломалось — починили. Сломалось снова — снова починили.
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Как это работает</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Простой и прозрачный процесс от покупки до получения помощи.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

            {[
              {
                icon: FileText,
                title: "1. Выбор и оформление",
                desc: "Выберите подходящий пакет при покупке авто. Подпишите договор и получите сертификат участника."
              },
              {
                icon: Phone,
                title: "2. Звонок при проблеме",
                desc: "Случилась поломка или ДТП? Просто позвоните по круглосуточному номеру и назовите номер договора."
              },
              {
                icon: Wrench,
                title: "3. Помощь в пути",
                desc: "Следуйте инструкциям оператора. Эвакуация или ремонт будут организованы за счет компании."
              }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 border-background relative">
                  <step.icon className="w-10 h-10 text-primary" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Часто задаваемые вопросы</h2>
          </div>

          <div className="bg-card rounded-[2rem] shadow-xl p-6 md:p-8 border">
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Как быстро приедет помощь?", a: "Время прибытия зависит от дорожной ситуации и вашего местоположения, но мы стараемся обеспечить максимально быструю реакцию. В среднем по городу — 30-40 минут." },
                { q: "Действует ли услуга за пределами моего города?", a: "Да, покрытие действует на всей территории Республики Беларусь." },
                { q: "Можно ли подключить услугу после поломки?", a: "Нет, программа оформляется заранее как превентивная мера защиты. Это работает как страховка: нужно купить полис до наступления страхового случая." },
                { q: "Нужно ли заключать договор?", a: "Да, услуга предоставляется на основании официального договора, который вы подписываете при покупке. Это ваша юридическая гарантия." },
                { q: "Какие авто не попадают под гарантию?", a: "Автомобили, используемые в такси, прокате, автошколах, а также авто с тюнингом, меняющим заводские характеристики." }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b-0 mb-4 last:mb-0">
                  <AccordionTrigger className="hover:no-underline py-4 px-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left font-medium text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pt-4 pb-2 text-muted-foreground text-base leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper Components

function TabTrigger({ value, icon, label, color, isActive }: any) {
  const colorStyles: any = {
    orange: isActive ? "text-orange-600 bg-orange-100 dark:bg-orange-900/30" : "hover:bg-orange-50 dark:hover:bg-orange-900/10",
    blue: isActive ? "text-blue-600 bg-blue-100 dark:bg-blue-900/30" : "hover:bg-blue-50 dark:hover:bg-blue-900/10",
    green: isActive ? "text-green-600 bg-green-100 dark:bg-green-900/30" : "hover:bg-green-50 dark:hover:bg-green-900/10",
    gray: isActive ? "text-gray-600 bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900/10",
  }

  return (
    <TabsTrigger
      value={value}
      className={`
        data-[state=active]:shadow-none data-[state=active]:bg-transparent
        h-auto py-4 flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent transition-all duration-300
        ${isActive ? "border-primary/10 scale-105 shadow-lg bg-card" : "text-muted-foreground opacity-70 hover:opacity-100"}
        ${colorStyles[color]}
      `}
    >
      <div className={`p-2 rounded-full ${isActive ? "bg-white dark:bg-black/20" : "bg-transparent"}`}>
        {icon}
      </div>
      <span className="font-semibold">{label}</span>
    </TabsTrigger>
  )
}

function ProgramSection({ title, subtitle, children, colorClass, bgClass }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h3 className={`text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${colorClass}`}>
          {title}
        </h3>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  )
}

function PricingCard({ title, price, limit, description, features, popular, color }: any) {
  const colorStyles: any = {
    orange: "border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600",
    blue: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600",
    green: "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600",
    gray: "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600",
  }

  const badgeColors: any = {
    orange: "bg-orange-500 hover:bg-orange-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    gray: "bg-gray-500 hover:bg-gray-600",
  }

  return (
    <Card className={`relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-[2rem] overflow-hidden border-2 ${colorStyles[color]} ${popular ? 'shadow-lg ring-1 ring-primary/20' : ''}`}>
      {popular && (
        <div className={`absolute top-0 inset-x-0 h-1.5 ${badgeColors[color]}`} />
      )}
      {popular && (
        <Badge className={`absolute top-4 right-4 ${badgeColors[color]}`}>Популярный</Badge>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="min-h-[40px]">{description || "Оптимальный выбор"}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-6">
        <div>
          <div className="text-3xl font-bold tracking-tight">{price}</div>
          {limit && (
            <p className="text-xs text-muted-foreground mt-1">
              Лимит: <span className="font-medium text-foreground">{limit}</span>
            </p>
          )}
        </div>

        <ul className="space-y-2.5">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${popular ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="leading-tight">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function DetailsDialog({ title, triggerText, children, color, variant = "default" }: any) {
  const btnStyles: any = {
    orange: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20",
    blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    green: "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20",
    gray: "bg-gray-800 hover:bg-gray-900 text-white shadow-gray-500/20",
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant={variant === "outline" ? "outline" : "default"}
          className={`rounded-full px-8 h-12 shadow-lg transition-all hover:scale-105 ${variant !== "outline" ? btnStyles[color] : ""}`}
        >
          {triggerText} <Info className="ml-2 w-4 h-4" />
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Двигатель (ДВС)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Основные механические части двигателя. Защита от капитального ремонта.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Трансмиссия</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Механическая, автоматическая, роботизированная КПП и вариаторы.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Рулевое управление</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Рулевая рейка и основные элементы управления.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Тормозная система</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
             Основные узлы тормозной системы (кроме расходников).
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
