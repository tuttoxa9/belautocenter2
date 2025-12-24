"use client"

import React from "react"
import Image from "next/image"
import {
  Shield,
  Car,
  Wrench,
  Zap,
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/warranty-hero.jpg"
              alt="Гарантия и помощь на дороге"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Ваша уверенность на дороге:{" "}
              <span className="text-primary">Гарантия и техпомощь 24/7</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Официальная программа защиты автомобиля от БелАвтоЦентр и
              DrivePolis. Покрываем ремонт узлов и выручаем в пути.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full" asChild>
                <a href="#programs">Выбрать программу</a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <a href="#faq">Частые вопросы</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Navigation/Anchor - Just a visual separator or ID */}
      <div id="programs" className="py-8"></div>

      {/* Program 1: Drive-HELP */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Программа «Драйв-HELP» (Помощь на дороге)
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Круглосуточная помощь в любой ситуации. Эвакуация, подвоз топлива,
              замена колеса и многое другое.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <ProgramCard
              title="Стандарт"
              price="789 BYN"
              features={["Базовая помощь на дороге", "Эвакуация"]}
            />
            <ProgramCard
              title="Премиум"
              price="1 199 BYN"
              features={[
                "Расширенный сервис",
                "Подвоз топлива",
                "Такси",
                "Все опции Стандарт",
              ]}
              highlight
            />
            <ProgramCard
              title="VIP"
              price="1 599 BYN"
              features={[
                "Максимальный пакет услуг",
                "Трезвый водитель",
                "Безлимитная эвакуация",
                "Все опции Премиум",
              ]}
            />
          </div>

          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="rounded-full">
                  Полный список услуг программы Драйв-HELP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Услуги программы Драйв-HELP</DialogTitle>
                  <DialogDescription>
                    Детальное описание всех услуг, включенных в пакеты помощи на
                    дороге.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <DetailItem
                    title="Автосправка 24 часа"
                    desc="Консультации по любым вопросам."
                  />
                  <DetailItem
                    title="Горячая линия по Европротоколу"
                    desc="Помощь в оформлении ДТП без ГАИ."
                  />
                  <DetailItem
                    title="Консультация механика"
                    desc="По телефону в случае неисправности."
                  />
                  <DetailItem
                    title="Эвакуация при ДТП"
                    desc="Доставка авто до ближайшего СТО или в любую точку (в зависимости от тарифа)."
                  />
                  <DetailItem
                    title="Эвакуация при поломке"
                    desc="Лимит до 100 км (в VIP — в любую точку)."
                  />
                  <DetailItem
                    title="Замена колеса"
                    desc="Услуга по замене поврежденного колеса на запасное."
                  />
                  <DetailItem
                    title="Подвоз топлива / Зарядка электромобиля"
                    desc="Доставка 5–10 л топлива или зарядка до ближайшей станции (доступно в Премиум и VIP)."
                  />
                  <DetailItem
                    title="Запуск ДВС («прикуривание»)"
                    desc="Запуск от внешнего источника при разряженном аккумуляторе (доступно в Премиум и VIP)."
                  />
                  <DetailItem
                    title="Такси «Аэропорт, вокзал»"
                    desc="Одна поездка (доступно в Премиум и VIP)."
                  />
                  <DetailItem
                    title="Трезвый водитель"
                    desc="Перегон авто клиента до дома (доступно в VIP)."
                  />
                  <DetailItem
                    title="Такси с места ДТП"
                    desc="Трансфер водителя и пассажиров (доступно в VIP)."
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Program 2: Drive-PRO */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Программа «Драйв-PRO» (Гарантия на авто с ДВС)
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Защита от непредвиденных расходов на ремонт двигателя, КПП и
              других узлов.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <ProgramCard
              title="Стандарт"
              price="1 800 BYN"
              limit="27 000 BYN"
              features={["Двигатель", "КПП", "Мосты"]}
            />
            <ProgramCard
              title="Стандарт Плюс"
              price="2 500 BYN"
              limit="40 000 BYN"
              features={[
                "Двигатель, КПП, Мосты",
                "Рулевое",
                "Тормоза",
              ]}
              highlight
            />
            <ProgramCard
              title="Премиум"
              price="3 116 BYN"
              limit="58 000 BYN"
              features={[
                "Все основные узлы",
                "Электрика",
                "Климат",
                "Топливная система",
              ]}
            />
          </div>

          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="rounded-full">
                  Условия и покрытие Драйв-PRO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Детальная информация Драйв-PRO</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">Условия участия:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Автомобили зарубежного производства: до 20 лет, пробег до 200 000 км.</li>
                      <li>Российские автомобили: до 10 лет, пробег до 100 000 км.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Что включено в гарантию:</h4>
                    <div className="space-y-3">
                      <DetailItem title="Двигатель и топливная система" desc="Блок цилиндров, головка блока, поршневая группа, турбокомпрессор (в старших пакетах), топливный насос, форсунки." />
                      <DetailItem title="Трансмиссия" desc="Механическая, автоматическая, роботизированная КПП, вариатор (корпус, шестерни, валы, гидротрансформатор)." />
                      <DetailItem title="Мосты и раздаточная коробка" desc="Редуктор, дифференциал, полуоси, карданный вал." />
                      <DetailItem title="Рулевое управление и тормоза" desc="Рулевая рейка, насос ГУР/ЭУР, главный тормозной цилиндр, суппорты (для пакетов Стандарт+ и Премиум)." />
                      <DetailItem title="Охлаждение и Климат" desc="Радиаторы, помпа, компрессор кондиционера (для пакета Премиум)." />
                      <DetailItem title="Система электрики" desc="Стартер, генератор, катушки зажигания, моторы стеклоочистителей, ЭБУ (для пакета Премиум)." />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Program 3: Drive-EL */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Программа «Драйв-EL» (Электромобили и Гибриды)
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Специализированная защита для высокотехнологичных автомобилей.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <ProgramCard
              title="Стандарт"
              price="2 570 BYN"
              limit="57 985 BYN"
              batteryLimit="13 644 BYN"
              features={["Базовая защита электромобиля"]}
            />
            <ProgramCard
              title="Стандарт Плюс"
              price="3 370 BYN"
              limit="73 335 BYN"
              batteryLimit="17 055 BYN"
              features={["Расширенная защита"]}
              highlight
            />
            <ProgramCard
              title="Премиум"
              price="4 370 BYN"
              limit="90 390 BYN"
              batteryLimit="20 466 BYN"
              features={["Максимальная защита"]}
            />
          </div>

          <div className="flex justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="rounded-full">
                  Условия и покрытие Драйв-EL
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Детальная информация Драйв-EL</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">Условия участия:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Электро и гибридные авто: до 3 лет, пробег до 100 000 км.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Что включено в гарантию:</h4>
                    <div className="space-y-3">
                      <DetailItem title="Тяговые электродвигатели" desc="Ротор, статор, подшипники, корпус." />
                      <DetailItem title="Высоковольтная батарея (ВВБ)" desc="Элементы питания, модули, системы охлаждения ВВБ." />
                      <DetailItem title="Блоки управления" desc="Контроллеры двигателя, батареи (BMS)." />
                      <DetailItem title="Узел инвертора" desc="Силовая электроника, преобразователи тока." />
                      <DetailItem title="Трансмиссия (Редуктор)" desc="Шестерни, валы, дифференциал." />
                      <DetailItem title="Порты зарядного устройства" desc="Разъемы зарядки, блоки согласования." />
                      <DetailItem title="Для гибридов" desc="ДВС, генератор, КПП (ТС с последовательной гибридной силовой установкой)." />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Program 4: Drive-OLD */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Программа «Драйв-OLD» (Авто с пробегом)
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Бюджетное решение для защиты ключевых дорогостоящих узлов
              подержанных автомобилей.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="w-full max-w-md">
              <ProgramCard
                title="Единый тариф"
                price="1 650 BYN"
                limit="21 500 BYN"
                features={[
                  "Только ключевые дорогостоящие узлы",
                  "Неограниченное количество обращений (в рамках лимита)",
                ]}
                highlight
              />
            </div>
          </div>

          <div className="flex justify-center">
             <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg" className="rounded-full">
                  Условия и покрытие Драйв-OLD
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Детальная информация Драйв-OLD</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">Условия участия:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Автомобили зарубежного производства: до 20 лет, пробег до 375 000 км.</li>
                      <li>Российские модели ТС: до 15 лет, пробег до 250 000 км.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Что включено в гарантию:</h4>
                    <div className="space-y-3">
                      <DetailItem title="Двигатель" desc="Основные механические части ДВС." />
                      <DetailItem title="Трансмиссия" desc="Механическая, автоматическая, роботизированная, вариатор." />
                      <DetailItem title="Рулевое управление" desc="Рейка и основные элементы управления." />
                      <DetailItem title="Тормозная система" desc="Основные узлы тормозной системы." />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
            Как это работает
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <WorkStep
              icon={<CheckCircle className="h-10 w-10" />}
              title="1. Выбор и оформление"
              desc="Выберите и оплатите подходящий пакет услуг при покупке авто. Подпишите договор и получите сертификат."
            />
            <WorkStep
              icon={<Phone className="h-10 w-10" />}
              title="2. Связь при экстренной ситуации"
              desc="В случае поломки или ДТП позвоните по круглосуточному номеру. Сообщите оператору номер договора."
            />
            <WorkStep
              icon={<Wrench className="h-10 w-10" />}
              title="3. Получение поддержки"
              desc="Следуйте инструкциям оператора. Ремонт или эвакуация будут организованы за счет компании."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight mb-10 text-center">
            Часто задаваемые вопросы
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Как быстро приедет помощь?</AccordionTrigger>
              <AccordionContent>
                Время прибытия зависит от дорожной ситуации и вашего
                местоположения, но мы стараемся обеспечить максимально быструю
                реакцию.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Действует ли услуга за пределами моего города?
              </AccordionTrigger>
              <AccordionContent>
                Да, покрытие действует на всей территории Республики Беларусь.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Можно ли подключить услугу, когда попал в ДТП или при поломке?
              </AccordionTrigger>
              <AccordionContent>
                Нет, программа оформляется заранее как превентивная мера защиты.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Нужно ли заключать договор?</AccordionTrigger>
              <AccordionContent>
                Да, услуга предоставляется на основании официального договора,
                который вы подписываете при покупке.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                Какие автомобили не попадают под гарантию?
              </AccordionTrigger>
              <AccordionContent>
                Автомобили, используемые в такси, прокате, автошколах, а также
                авто с тюнингом, меняющим заводские характеристики.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}

function ProgramCard({
  title,
  price,
  features,
  limit,
  batteryLimit,
  highlight = false,
}: {
  title: string
  price: string
  features: string[]
  limit?: string
  batteryLimit?: string
  highlight?: boolean
}) {
  return (
    <Card
      className={`flex flex-col h-full border-2 transition-all duration-200 hover:shadow-lg ${
        highlight ? "border-primary shadow-md relative" : "border-border"
      }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          Популярный
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
        </div>
        {limit && (
           <CardDescription className="mt-1">
             Лимит ответственности: <span className="font-medium text-foreground">{limit}</span>
           </CardDescription>
        )}
        {batteryLimit && (
           <CardDescription>
             Лимит на батарею: <span className="font-medium text-foreground">{batteryLimit}</span>
           </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function DetailItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b pb-2 last:border-0">
      <h5 className="font-semibold text-sm">{title}</h5>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}

function WorkStep({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-full bg-primary-foreground/10 p-4 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="opacity-90 leading-relaxed">{desc}</p>
    </div>
  )
}
