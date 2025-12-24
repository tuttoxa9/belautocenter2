
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, Info, Phone } from 'lucide-react';

// Data for the page to keep the JSX cleaner
const driveHelpPlans = {
  subtitle: 'Ваша "Скорая помощь" для автомобиля. Эвакуация, запуск двигателя, такси.',
  plans: [
    {
      title: 'Стандарт',
      price: '789 BYN',
      description: 'Базовый набор для города и трассы',
      features: [
        { name: 'Автосправка 24/7', included: true },
        { name: 'Эвакуация при ДТП / Поломке (лимит 200 км)', included: true },
        { name: 'Запуск двигателя', included: true },
        { name: 'Подвоз топлива / Замена колеса', included: true },
        { name: 'Трезвый водитель', included: false },
        { name: 'Такси (при эвакуации)', included: false },
      ],
    },
    {
      title: 'Премиум',
      price: '1 199 BYN',
      description: 'Расширенные лимиты и комфорт',
      features: [
        { name: 'Автосправка 24/7', included: true },
        { name: 'Эвакуация при ДТП / Поломке (лимит 400 км)', included: true },
        { name: 'Запуск двигателя', included: true },
        { name: 'Подвоз топлива / Замена колеса', included: true },
        { name: 'Трезвый водитель (1 раз)', included: true },
        { name: 'Такси (при эвакуации, комфорт)', included: true },
      ],
    },
    {
      title: 'VIP',
      price: '1 599 BYN',
      description: 'Максимальная забота и сервисы',
      features: [
        { name: 'Автосправка 24/7', included: true },
        { name: 'Эвакуация при ДТП / Поломке (безлимит по РБ)', included: true },
        { name: 'Запуск двигателя', included: true },
        { name: 'Подвоз топлива / Замена колеса', included: true },
        { name: 'Трезвый водитель (3 раза)', included: true },
        { name: 'Такси (при эвакуации, бизнес-класс)', included: true },
      ],
    },
  ],
};

const driveProPlans = {
  subtitle: 'Защита от поломок двигателя, коробки и дорогостоящих узлов.',
  plans: [
    {
      title: 'Стандарт',
      limit: 'Ремонт до 27 000 BYN',
      price: '1 800 BYN',
      description: 'Двигатель + КПП + Мосты',
      details: ['ДВС (Бензин, Дизель)', 'Коробка передач (МКПП, АКПП)', 'Редуктор ведущего моста', 'Раздаточная коробка'],
      conditions: 'Для авто до 20 лет с пробегом до 200 000 км.'
    },
    {
      title: 'Стандарт +',
      limit: 'Ремонт до 40 000 BYN',
      price: '2 500 BYN',
      description: '+ Турбина, Рулевое, Тормоза',
      details: ['Все из "Стандарт"', 'Турбокомпрессор', 'Рулевое управление (ГУР, рейка)', 'Тормозная система (гл. цилиндр, вакуумный усилитель)'],
      conditions: 'Для авто до 15 лет с пробегом до 180 000 км.'
    },
    {
      title: 'Премиум',
      limit: 'Ремонт до 58 000 BYN',
      price: '3 116 BYN',
      description: '+ Электрика, Климат, Топливная',
      details: ['Все из "Стандарт +"', 'Электрооборудование (стартер, генератор, ЭБУ)', 'Климатическая установка (компрессор кондиционера)', 'Топливная система (ТНВД, форсунки)'],
      conditions: 'Для авто до 10 лет с пробегом до 150 000 км.'
    },
  ],
};

const driveElPlans = {
  subtitle: 'Специализированная защита батареи и электромоторов.',
  plans: [
    {
      title: 'Стандарт',
      limit: 'Ремонт до 57 985 BYN',
      price: '2 570 BYN',
      batteryLimit: 'Лимит выплаты на ВВБ: 13 600 BYN',
      details: ['Тяговая батарея (ВВБ)', 'Электродвигатель (тяговый)', 'Инвертор', 'Редуктор', 'Порты зарядки', 'DCDC преобразователь'],
      conditions: 'Для авто до 3 лет с пробегом до 100 000 км.'
    },
    {
      title: 'Стандарт +',
      limit: 'Ремонт до 73 335 BYN',
      price: '3 370 BYN',
      batteryLimit: 'Лимит выплаты на ВВБ: 17 000 BYN',
      details: ['Тяговая батарея (ВВБ)', 'Электродвигатель (тяговый)', 'Инвертор', 'Редуктор', 'Порты зарядки', 'DCDC преобразователь', 'Бортовое зарядное устройство'],
      conditions: 'Для авто до 3 лет с пробегом до 80 000 км.'
    },
    {
      title: 'Премиум',
      limit: 'Ремонт до 90 390 BYN',
      price: '4 370 BYN',
      batteryLimit: 'Лимит выплаты на ВВБ: 20 400 BYN',
      details: ['Тяговая батарея (ВВБ)', 'Электродвигатель (тяговый)', 'Инвертор', 'Редуктор', 'Порты зарядки', 'DCDC преобразователь', 'Бортовое зарядное устройство', 'Климатическая установка (компрессор)'],
      conditions: 'Для авто до 2 лет с пробегом до 60 000 км.'
    },
  ],
};

const driveOldPlan = {
  subtitle: 'Бюджетная защита основных агрегатов для возрастных авто.',
  plan: {
    title: 'Единый тариф OLD',
    price: '1 650 BYN',
    limit: 'Ремонт на сумму до 21 500 BYN',
    description: 'Двигатель, Коробка (МКПП/АКПП/Робот/Вариатор), Рулевое управление.',
    conditions: 'Для авто до 20 лет с пробегом до 375 000 км.'
  }
};


const WarrantyPage = () => {
  return (
    <div className="bg-black text-white">
      {/* Block 1: Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center">
        <Image
          src="/MainPhoto.jpeg"
          alt="Современный автомобиль"
          fill
          className="absolute z-0 opacity-40 object-cover"
        />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            Гарантия и помощь на дороге для вашего авто
          </h1>
          <h2 className="mt-4 text-lg md:text-2xl max-w-4xl mx-auto">
            Совместная программа защиты от «БелАвтоЦентр» и «DrivePolis». Покрываем ремонт узлов и выручаем в пути 24/7.
          </h2>
          <div className="mt-6 flex justify-center items-center gap-8">
            <span className="text-xl font-semibold">БелАвтоЦентр</span>
            <span className="text-2xl font-bold text-gray-400">&</span>
            <span className="text-xl font-semibold">DrivePolis</span>
          </div>
        </div>
      </section>

      {/* Block 2: Programs */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <Tabs defaultValue="help" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-900">
              <TabsTrigger value="help">🆘 Драйв-HELP</TabsTrigger>
              <TabsTrigger value="pro">🚗 Драйв-PRO</TabsTrigger>
              <TabsTrigger value="el">⚡ Драйв-EL</TabsTrigger>
              <TabsTrigger value="old">🛠 Драйв-OLD</TabsTrigger>
            </TabsList>

            {/* Tab 1: Drive-HELP */}
            <TabsContent value="help" className="mt-8">
              <h3 className="text-2xl font-semibold text-center mb-2">Помощь на дороге</h3>
              <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">{driveHelpPlans.subtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {driveHelpPlans.plans.map((plan, index) => (
                  <Card key={index} className="bg-gray-900 border-gray-700 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.title}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-4xl font-bold mb-6">{plan.price}</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mb-4 border-gray-600 hover:bg-gray-800">
                              <Info className="mr-2 h-4 w-4" /> Что входит?
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 text-white border-gray-700">
                            <DialogHeader>
                              <DialogTitle>Что входит в тариф «{plan.title}»</DialogTitle>
                            </DialogHeader>
                            <ul className="space-y-3 py-4">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center">
                                  {feature.included ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-gray-500 mr-3" />
                                  )}
                                  <span>{feature.name}</span>
                                </li>
                              ))}
                            </ul>
                             <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Закрыть</Button>
                                </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700">Оформить</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab 2: Drive-PRO */}
            <TabsContent value="pro" className="mt-8">
                <h3 className="text-2xl font-semibold text-center mb-2">Классическая гарантия</h3>
                <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">{driveProPlans.subtitle}</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {driveProPlans.plans.map((plan, index) => (
                  <Card key={index} className="bg-gray-900 border-gray-700 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.title}</CardTitle>
                       <CardDescription className="font-semibold text-lg text-red-500">{plan.limit}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <div>
                            <p className="text-sm text-gray-300 mb-2">Покрытие:</p>
                            <p className="mb-4 font-semibold">{plan.description}</p>
                            <p className="text-4xl font-bold mb-6">{plan.price}</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full mb-4 border-gray-600 hover:bg-gray-800">
                                    <Info className="mr-2 h-4 w-4" /> Подробный список узлов
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 text-white border-gray-700">
                                    <DialogHeader>
                                    <DialogTitle>Покрытие тарифа «{plan.title}»</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <h4 className="font-semibold mb-2">Защищенные узлы:</h4>
                                        <ul className="space-y-2 list-disc list-inside">
                                            {plan.details.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                        <p className="mt-6 text-sm text-gray-400 border-t border-gray-700 pt-4">
                                            <strong>Условия:</strong> {plan.conditions}
                                        </p>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">Закрыть</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700">Оформить</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab 3: Drive-EL */}
            <TabsContent value="el" className="mt-8">
                 <h3 className="text-2xl font-semibold text-center mb-2">Электро и Гибриды</h3>
                <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">{driveElPlans.subtitle}</p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {driveElPlans.plans.map((plan, index) => (
                  <Card key={index} className="bg-gray-900 border-gray-700 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.title}</CardTitle>
                      <CardDescription className="font-semibold text-lg text-red-500">{plan.limit}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                         <div>
                            <p className="text-sm text-gray-300 mb-2">Батарея:</p>
                            <p className="mb-4 font-semibold">{plan.batteryLimit}</p>
                            <p className="text-4xl font-bold mb-6">{plan.price}</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full mb-4 border-gray-600 hover:bg-gray-800">
                                    <Info className="mr-2 h-4 w-4" /> Все условия
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 text-white border-gray-700">
                                    <DialogHeader>
                                    <DialogTitle>Покрытие тарифа «{plan.title}»</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <h4 className="font-semibold mb-2">Защищенные узлы:</h4>
                                        <ul className="space-y-2 list-disc list-inside">
                                            {plan.details.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                        <p className="mt-6 text-sm text-gray-400 border-t border-gray-700 pt-4">
                                            <strong>Условия:</strong> {plan.conditions}
                                        </p>
                                    </div>
                                     <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">Закрыть</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700">Оформить</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab 4: Drive-OLD */}
            <TabsContent value="old" className="mt-8">
              <h3 className="text-2xl font-semibold text-center mb-2">Авто с пробегом</h3>
              <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">{driveOldPlan.subtitle}</p>
              <div className="flex justify-center">
                  <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl">
                    <CardHeader className="text-center">
                      <CardTitle className="text-3xl">{driveOldPlan.plan.title}</CardTitle>
                      <CardDescription className="font-semibold text-xl text-red-500">{driveOldPlan.plan.limit}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-bold text-center mb-6">{driveOldPlan.plan.price}</p>
                      <div className="text-center mb-6">
                        <p className="text-sm text-gray-300 mb-1">Что защищено:</p>
                        <p className="font-semibold">{driveOldPlan.plan.description}</p>
                      </div>
                       <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" className="w-full mb-4 border-gray-600 hover:bg-gray-800">
                                  <Info className="mr-2 h-4 w-4" /> Подробнее об условиях
                              </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 text-white border-gray-700">
                              <DialogHeader>
                                <DialogTitle>Условия тарифа «{driveOldPlan.plan.title}»</DialogTitle>
                              </DialogHeader>
                               <div className="py-4">
                                <p className="text-lg">
                                  <strong>Условия:</strong> {driveOldPlan.plan.conditions}
                                </p>
                              </div>
                              <DialogFooter>
                                  <DialogClose asChild>
                                      <Button type="button" variant="secondary">Закрыть</Button>
                                  </DialogClose>
                              </DialogFooter>
                          </DialogContent>
                      </Dialog>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-lg py-6">Оформить защиту</Button>
                    </CardContent>
                  </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Block 3: How it works */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Процесс оформления прост</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-4xl font-bold text-red-500 mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Выбираете автомобиль</h3>
              <p className="text-gray-400">Выбираете подходящий автомобиль в нашем автоцентре «БелАвтоЦентр».</p>
            </div>
             <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-4xl font-bold text-red-500 mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Подбираем тариф</h3>
              <p className="text-gray-400">Наш менеджер помогает выбрать оптимальный тариф гарантии и включает его стоимость в договор.</p>
            </div>
             <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-4xl font-bold text-red-500 mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Уезжаете с защитой</h3>
              <p className="text-gray-400">Вы уезжаете на полностью защищенном автомобиле. При поломке просто звоните на горячую линию DrivePolis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Block 4: FAQ */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl">
           <h2 className="text-3xl font-bold mb-8 text-center">Частые вопросы</h2>
           <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-gray-700">
                <AccordionTrigger className="text-lg">Где чинить машину?</AccordionTrigger>
                <AccordionContent className="text-base text-gray-300">
                  На сертифицированных СТО-партнерах по всей Беларуси. Оператор горячей линии направит вас на ближайшую станцию для диагностики и ремонта.
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="item-2" className="border-gray-700">
                <AccordionTrigger className="text-lg">Нужно ли платить за эвакуатор самому?</AccordionTrigger>
                <AccordionContent className="text-base text-gray-300">
                  Нет, в рамках установленных лимитов по вашему тарифу услуги эвакуатора, технической помощи и такси оплачиваются компанией напрямую. Вы ничего не платите на месте.
                </AccordionContent>
              </AccordionItem>
               <AccordionItem value="item-3" className="border-gray-700">
                <AccordionTrigger className="text-lg">Действует ли гарантия в другом городе?</AccordionTrigger>
                <AccordionContent className="text-base text-gray-300">
                  Да, конечно. Покрытие по всем программам действует на всей территории Республики Беларусь, вне зависимости от того, где вы приобрели автомобиль.
                </AccordionContent>
              </AccordionItem>
                <AccordionItem value="item-4" className="border-gray-700">
                <AccordionTrigger className="text-lg">Можно ли оформить гарантию в кредит?</AccordionTrigger>
                <AccordionContent className="text-base text-gray-300">
                  Да, стоимость любого пакета гарантии можно включить в общую сумму кредита или лизинга при покупке автомобиля в «БелАвтоЦентр».
                </AccordionContent>
              </AccordionItem>
           </Accordion>
        </div>
      </section>

       {/* Block 5: Footer CTA */}
      <section className="py-16 bg-gray-950">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Не знаете, какой пакет выбрать?</h2>
            <p className="text-gray-400 mb-8 text-lg">Мы подскажем и подберем лучший вариант для вашего автомобиля!</p>
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg py-7 px-8">
              <Phone className="mr-3 h-5 w-5" /> Заказать звонок
            </Button>
        </div>
      </section>

    </div>
  );
};

export default WarrantyPage;
