"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Check, Info, Phone, Shield, Truck, Zap, Wrench, Clock, FileText, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Block 1: Main Screen */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Image (Top Left, Rounded) */}
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/warranty-hero.jpg"
                  alt="Гарантия и техпомощь"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Info (Right) */}
            <div className="w-full lg:w-1/2 space-y-6">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-1.5 text-sm font-medium rounded-full mb-2">
                DrivePolis & БелАвтоЦентр
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Ваша уверенность на дороге: <span className="text-blue-600">Гарантия и техпомощь 24/7</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                Официальная программа защиты автомобиля от БелАвтоЦентр и DrivePolis.
                Покрываем ремонт узлов и выручаем в пути в любой ситуации.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-blue-600/20" asChild>
                  <Link href="#programs">Подобрать программу</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                  <Link href="#how-it-works">Как это работает</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100 dark:border-gray-800 mt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">24/7 Поддержка</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Вся Беларусь</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Защита ремонта</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="programs" className="container px-4 py-16 space-y-20">

        {/* Block 2: Drive-HELP */}
        <section>
          <SectionHeader
            title="Программа ДРАЙВ-HELP"
            subtitle="Помощь на дороге"
            description="Круглосуточная автосправка, консультация механика и техническая помощь, эвакуация при ДТП или поломке."
            icon={<Truck className="w-8 h-8 text-white" />}
            color="bg-amber-500"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TariffCard
              title="Стандарт"
              price="789 BYN"
              description="Базовый набор услуг помощи на дороге."
              features={[
                "Автосправка 24 часа",
                "Горячая линия по Европротоколу",
                "Консультация механика",
                "Эвакуация при ДТП",
                "Эвакуация при поломке (100 км)"
              ]}
              fullDetails={[
                { label: "Автосправка 24 часа", value: "Консультации по любым вопросам" },
                { label: "Горячая линия по Европротоколу", value: "Помощь в заполнении документов" },
                { label: "Консультация механика по телефону", value: "Включено" },
                { label: "Эвакуация при ДТП", value: "Без ограничений" },
                { label: "Эвакуация при поломке", value: "В пределах 100 км" },
              ]}
            />

            <TariffCard
              title="Премиум"
              price="1 199 BYN"
              description="Расширенный сервис с услугами такси и подвоза топлива."
              isPopular
              features={[
                "Все услуги «Стандарт»",
                "Замена колеса",
                "Подвоз топлива / Зарядка EV",
                "Запуск ДВС («прикуривание»)",
                "Такси «Аэропорт, вокзал»"
              ]}
              fullDetails={[
                { label: "Автосправка 24 часа", value: "Включено" },
                { label: "Горячая линия по Европротоколу", value: "Включено" },
                { label: "Консультация механика по телефону", value: "Включено" },
                { label: "Эвакуация при ДТП", value: "Включено" },
                { label: "Эвакуация при поломке", value: "В пределах 100 км" },
                { label: "Замена колеса", value: "На запасное" },
                { label: "Подвоз топлива / Зарядка", value: "Доставка 5–10 л топлива" },
                { label: "Запуск ДВС", value: "«Прикуривание» от внешнего источника" },
                { label: "Такси «Аэропорт, вокзал»", value: "Однократно" },
              ]}
            />

            <TariffCard
              title="VIP"
              price="1 599 BYN"
              description="Максимальная защита, безлимитная эвакуация и услуги личного водителя."
              features={[
                "Все услуги «Премиум»",
                "Эвакуация по всей РБ",
                "Трезвый водитель",
                "Такси с места ДТП",
              ]}
              fullDetails={[
                { label: "Автосправка 24 часа", value: "Включено" },
                { label: "Горячая линия по Европротоколу", value: "Включено" },
                { label: "Консультация механика по телефону", value: "Включено" },
                { label: "Эвакуация при ДТП", value: "Включено" },
                { label: "Эвакуация при поломке", value: "В любую точку Беларуси" },
                { label: "Замена колеса", value: "Включено" },
                { label: "Подвоз топлива / Зарядка", value: "Включено" },
                { label: "Запуск ДВС", value: "Включено" },
                { label: "Такси «Аэропорт, вокзал»", value: "Однократно" },
                { label: "Трезвый водитель", value: "Перегон авто клиента до дома, однократно" },
                { label: "Такси с места ДТП", value: "Трансфер пассажиров" },
              ]}
            />
          </div>
        </section>

        {/* Block 3: Drive-PRO */}
        <section>
          <SectionHeader
            title="Программа ДРАЙВ-PRO"
            subtitle="Гарантия на ДВС"
            description="Защита от непредвиденных расходов на ремонт двигателя, КПП и других узлов."
            extraInfo="Для авто: Иномарки до 20 лет (до 200 тыс. км), РФ авто до 10 лет (до 100 тыс. км)."
            icon={<Wrench className="w-8 h-8 text-white" />}
            color="bg-blue-600"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TariffCard
              title="Стандарт"
              price="1 800 BYN"
              limit="27 000 BYN"
              description="Покрытие основных узлов (Двигатель, КПП, Мосты)."
              features={[
                "Двигатель",
                "КПП (Механика/АКПП/Робот/Вариатор)",
                "Мосты и раздаточная коробка"
              ]}
              fullDetails={[
                { label: "Двигатель", value: "Блок цилиндров, головка блока, коленвал, шатуны, поршни, распредвалы, клапаны" },
                { label: "КПП", value: "Механическая, Автоматическая, Робот, Вариатор — внутренние детали" },
                { label: "Мосты и раздатка", value: "Редуктор, дифференциал, полуоси, карданный вал" },
              ]}
            />

            <TariffCard
              title="Стандарт Плюс"
              price="2 500 BYN"
              limit="40 000 BYN"
              description="Добавлена защита турбины, рулевого управления и тормозов."
              isPopular
              features={[
                "Все узлы «Стандарт»",
                "Турбонагнетатель",
                "Рулевое управление",
                "Тормозная система"
              ]}
              fullDetails={[
                { label: "Все узлы тарифа «Стандарт»", value: "Двигатель, КПП, Мосты" },
                { label: "Турбонагнетатель", value: "Турбина, перепускной клапан" },
                { label: "Рулевое управление", value: "Рейка, насос ГУР/ЭУР, тяги" },
                { label: "Тормозная система", value: "Главный цилиндр, вакуумный усилитель, суппорты" },
              ]}
            />

            <TariffCard
              title="Премиум"
              price="3 116 BYN"
              limit="58 000 BYN"
              description="Максимальное покрытие, включая электрику, климат и топливную систему."
              features={[
                "Все узлы «Стандарт Плюс»",
                "Система охлаждения и кондиционирования",
                "Топливная система",
                "Система электрики"
              ]}
              fullDetails={[
                { label: "Все узлы тарифа «Стандарт Плюс»", value: "Включено" },
                { label: "Система охлаждения", value: "Радиаторы, помпа, компрессор кондиционера" },
                { label: "Топливная система", value: "ТНВД, насос, форсунки" },
                { label: "Электрика", value: "Стартер, генератор, катушки, моторы стеклоочистителей, ЭБУ" },
              ]}
            />
          </div>
        </section>

        {/* Block 4: Drive-EL */}
        <section>
          <SectionHeader
            title="Программа ДРАЙВ-EL"
            subtitle="Электро и Гибриды"
            description="Техническая гарантия для электрических и гибридных автомобилей."
            extraInfo="Для авто: Возраст до 3 лет, пробег до 100 000 км."
            icon={<Zap className="w-8 h-8 text-white" />}
            color="bg-green-500"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TariffCard
              title="Стандарт"
              price="2 570 BYN"
              limit="57 985 BYN"
              subLimit="Батарея: 13 644 BYN"
              description="Базовая защита электродвигателя и батареи."
              features={[
                "Тяговый электродвигатель",
                "Высоковольтная батарея",
                "Редуктор, Инвертор",
                "Порты зарядки, Блоки управления"
              ]}
              fullDetails={[
                { label: "Покрываемые узлы", value: "Тяговый электродвигатель, Высоковольтная батарея (в рамках лимита), Редуктор, Инвертор, Порты зарядки, Блоки управления." },
              ]}
            />

            <TariffCard
              title="Стандарт Плюс"
              price="3 370 BYN"
              limit="73 335 BYN"
              subLimit="Батарея: 17 055 BYN"
              description="Увеличенные лимиты ответственности."
              isPopular
              features={[
                "Тяговый электродвигатель",
                "Высоковольтная батарея (↑ лимит)",
                "Редуктор, Инвертор",
                "Порты зарядки, Блоки управления"
              ]}
              fullDetails={[
                 { label: "Покрываемые узлы", value: "Тяговый электродвигатель, Высоковольтная батарея (в рамках увеличенного лимита), Редуктор, Инвертор, Порты зарядки, Блоки управления." },
              ]}
            />

            <TariffCard
              title="Премиум"
              price="4 370 BYN"
              limit="90 390 BYN"
              subLimit="Батарея: 20 466 BYN"
              description="Максимальная защита вашего электромобиля."
              features={[
                "Тяговый электродвигатель",
                "Высоковольтная батарея (max лимит)",
                "Редуктор, Инвертор",
                "Порты зарядки, Блоки управления"
              ]}
              fullDetails={[
                 { label: "Покрываемые узлы", value: "Тяговый электродвигатель, Высоковольтная батарея (в рамках максимального лимита), Редуктор, Инвертор, Порты зарядки, Блоки управления." },
              ]}
            />
          </div>
        </section>

        {/* Block 5: Drive-OLD */}
        <section>
          <SectionHeader
            title="Программа ДРАЙВ-OLD"
            subtitle="Авто с пробегом"
            description="Техническая гарантия на ключевые узлы для автомобилей с пробегом."
            extraInfo="Для авто: Иномарки до 20 лет (до 375 тыс. км), РФ авто до 15 лет (до 250 тыс. км)."
            icon={<Clock className="w-8 h-8 text-white" />}
            color="bg-slate-600"
          />

          <div className="max-w-md mx-auto">
             <TariffCard
              title="Единый тариф"
              price="1 650 BYN"
              limit="21 500 BYN"
              description="Защита двигателя, коробки передач и рулевого управления."
              isPopular
              features={[
                "Двигатель (Механические части)",
                "Трансмиссия (Все типы)",
                "Рулевое управление",
                "Тормозная система"
              ]}
              fullDetails={[
                { label: "Двигатель", value: "Основные механические части" },
                { label: "Трансмиссия", value: "Механическая, Автоматическая, Роботизированная, Вариатор" },
                { label: "Рулевое управление", value: "Рейка, основные элементы" },
                { label: "Тормозная система", value: "Включено" },
              ]}
            />
          </div>
        </section>

      </div>

      {/* Block 6: How it works */}
      <section id="how-it-works" className="bg-white dark:bg-gray-900 py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
            <p className="text-gray-600 dark:text-gray-400">Всего 3 простых шага для вашей защиты</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Выбор пакета и оформление"
              text="Выберите и оплатите подходящий пакет услуг. Подпишите договор и получите сертификат."
            />
            <StepCard
              number="2"
              title="Связь при экстренной ситуации"
              text="В случае поломки или ДТП позвоните по круглосуточному номеру. Сообщите оператору номер договора."
            />
            <StepCard
              number="3"
              title="Получение поддержки"
              text="Дождитесь помощи на месте или следуйте инструкциям оператора."
            />
          </div>
        </div>
      </section>

      {/* Block 7: FAQ */}
      <section className="container px-4 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Часто задаваемые вопросы</h2>
        <Accordion type="single" collapsible className="w-full">
          <FaqItem
            question="Как быстро приедет помощь?"
            answer="Время прибытия зависит от дорожной ситуации и местоположения, мы стараемся обеспечить максимально быструю реакцию."
          />
          <FaqItem
            question="Действует ли услуга за пределами моего города?"
            answer="Да, покрытие действует на всей территории Республики Беларусь."
          />
          <FaqItem
            question="Можно ли подключить услугу, когда попал в ДТП или при поломке?"
            answer="Нет, программа оформляется заранее."
          />
          <FaqItem
            question="Нужно ли заключать договор?"
            answer="Да, услуга предоставляется на основании договора."
          />
          <FaqItem
            question="Какие автомобили не попадают под гарантию?"
            answer="Автомобили такси, проката, автошкол, спецтранспорт, а также авто с тюнингом, меняющим заводские характеристики."
          />
        </Accordion>
      </section>

    </div>
  )
}

function SectionHeader({ title, subtitle, description, extraInfo, icon, color }: { title: string, subtitle: string, description: string, extraInfo?: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="mb-10 text-center md:text-left">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-4">
        <div className={`p-4 rounded-2xl shadow-lg ${color} shrink-0`}>
          {icon}
        </div>
        <div>
           <Badge variant="outline" className="mb-2 text-base px-3 py-1 border-gray-300 dark:border-gray-700">{subtitle}</Badge>
           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-2">{description}</p>
      {extraInfo && (
        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg inline-block border border-gray-200 dark:border-gray-700">
          {extraInfo}
        </p>
      )}
    </div>
  )
}

function TariffCard({ title, price, limit, subLimit, description, features, fullDetails, isPopular }: any) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className={`relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isPopular ? 'border-blue-500 shadow-blue-100 dark:shadow-none border-2' : 'border-gray-200 dark:border-gray-800'}`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          ХИТ
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-1">{title}</CardTitle>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{price}</span>
        </div>
        {limit && (
           <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
             Лимит: <span className="text-gray-900 dark:text-white">{limit}</span>
             {subLimit && <div className="text-xs mt-0.5">{subLimit}</div>}
           </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-600 dark:text-gray-300 mb-6 min-h-[3rem]">{description}</p>
        <ul className="space-y-3">
          {features.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Check className="w-5 h-5 text-green-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant={isPopular ? "default" : "outline"} className={`w-full ${isPopular ? "bg-blue-600 hover:bg-blue-700" : ""}`}>
              Подробнее
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Тариф «{title}»
                <Badge variant="secondary" className="text-blue-600">{price}</Badge>
              </DialogTitle>
              <DialogDescription>
                Подробный список включенных услуг и покрываемых узлов.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
               {fullDetails.map((item: any, i: number) => (
                 <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                   <div className="font-semibold text-gray-900 dark:text-white mb-1">{item.label}</div>
                   <div className="text-sm text-gray-600 dark:text-gray-300">{item.value}</div>
                 </div>
               ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button className="w-full" onClick={() => setIsOpen(false)}>Понятно</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

function StepCard({ number, title, text }: { number: string, title: string, text: string }) {
  return (
    <div className="relative p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="absolute -top-5 left-8 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-600/30">
        {number}
      </div>
      <h3 className="text-xl font-bold mt-4 mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{text}</p>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <AccordionItem value={question} className="border-b border-gray-200 dark:border-gray-800">
      <AccordionTrigger className="text-left text-lg font-medium hover:text-blue-600 transition-colors py-4">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-gray-600 dark:text-gray-300 pb-4 text-base leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
