"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useUsdBynRate } from "@/components/providers/usd-byn-rate-provider"
import { parseFirestoreDoc } from "@/lib/firestore-parser"
import { Button } from "@/components/ui/button"
import { StatusButton } from "@/components/ui/status-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useButtonState } from "@/hooks/use-button-state"
import { useNotification } from "@/components/providers/notification-provider"
import { FinancialAssistantDrawer } from "@/components/FinancialAssistantDrawer"
import { Phone, ChevronRight, Calculator, Eye, AlertCircle, Check } from "lucide-react"
import CarDetailsSkeleton from "@/components/car-details-skeleton"
import { preloadImages } from "@/lib/image-preloader"

let staticDataCache: {
  contactPhones?: { main?: string, additional?: string }
  lastLoadTime?: number
} = {}
const CACHE_DURATION = 5 * 60 * 1000

const CarNotFoundComponent = ({ contactPhone }: { contactPhone: string }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Автомобиль не найден</h1>
          <p className="text-slate-600 mb-6">К сожалению, автомобиль с указанным ID не существует или произошла ошибка.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Нужна помощь?</h3>
          <p className="text-slate-600 mb-4">Свяжитесь с нами для получения информации.</p>
          <div className="flex flex-col items-center space-y-2 text-blue-600">
            <a href={`tel:${contactPhone.replace(/\\s/g, '')}`} className="font-semibold hover:text-blue-700 transition-colors flex items-center space-x-2"><Phone className="h-5 w-5" /><span>{contactPhone}</span></a>
          </div>
        </div>
        <Button onClick={() => window.location.href = '/catalog'} className="w-full bg-slate-900 hover:bg-slate-800 text-white">Перейти к каталогу</Button>
      </div>
    </div>
  );
};

interface Car {
  id: string; make: string; model: string; year: number; price: number; currency: string;
  mileage: number; engineVolume: number; fuelType: string; transmission: string;
  driveTrain: string; bodyType: string; color: string; description: string;
  imageUrls: string[]; isAvailable: boolean; features: string[];
  specifications: Record<string, string>; tiktok_url?: string; youtube_url?: string;
}

interface CarDetailsClientProps {
  carId: string;
}

export default function CarDetailsClient({ carId }: CarDetailsClientProps) {
  const router = useRouter()
  const [car, setCar] = useState<Car | null>(null)
  const [contactPhone, setContactPhone] = useState<string>("")
  const [carNotFound, setCarNotFound] = useState(false)
  const usdBynRate = useUsdBynRate()
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isCallbackOpen, setIsCallbackOpen] = useState(false)
  const [isFinancialAssistantOpen, setFinancialAssistantOpen] = useState(false)
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "+375", message: "" })
  const [callbackForm, setCallbackForm] = useState({ name: "", phone: "+375" })

  const bookingButtonState = useButtonState()
  const callbackButtonState = useButtonState()
  const { showSuccess } = useNotification()

  useEffect(() => {
    if (carId) loadCarData(carId)
  }, [carId])

  useEffect(() => {
    loadStaticData()
  }, [])

  const loadStaticData = async () => {
    const now = Date.now();
    if (staticDataCache.lastLoadTime && (now - staticDataCache.lastLoadTime) < CACHE_DURATION) {
      setContactPhone(staticDataCache.contactPhones?.main || "+375 29 123-45-67");
      return;
    }
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
      const contactsResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pages/contacts`);
      const contactsRawData = await contactsResponse.json();
      const contacts = parseFirestoreDoc(contactsRawData);
      staticDataCache = { contactPhones: { main: contacts.phone, additional: contacts.phone2 }, lastLoadTime: now };
      setContactPhone(contacts.phone || "+375 29 123-45-67");
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const loadCarData = async (carId: string) => {
    setLoading(true);
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'belauto-f2b93';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cars/${carId}`;
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const doc = await response.json();
        const carData = parseFirestoreDoc(doc);
        setCar(JSON.parse(JSON.stringify(carData)) as Car);
        if (carData.imageUrls?.length > 1) preloadImages(carData.imageUrls.slice(0, 3));
      } else {
        setCarNotFound(true);
      }
    } catch (error) {
      setCarNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => `+375${value.replace(/[^\\d]/g, "").slice(3, 12)}`;
  const isPhoneValid = (phone: string) => phone.length === 13;

  const createLead = async (data: any) => {
    try {
      const { collection, addDoc, db } = await import('@/lib/firebase');
      await addDoc(collection(db, "leads"), data);
    } catch (error) { console.error("Firestore error:", error); }
  };

  const sendTelegramNotification = async (data: any) => {
    await fetch('/api/send-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookingButtonState.execute(async () => {
      const leadData = { ...bookingForm, carId, carInfo: `${car?.make} ${car?.model} ${car?.year}`, type: "booking", status: "new", createdAt: new Date() };
      const telegramData = { ...bookingForm, carMake: car?.make, carModel: car?.model, carYear: car?.year, carId, type: 'car_booking' };
      createLead(leadData);
      sendTelegramNotification(telegramData);
      setIsBookingOpen(false);
      setBookingForm({ name: "", phone: "+375", message: "" });
      showSuccess("Заявка на бронирование отправлена!");
    });
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await callbackButtonState.execute(async () => {
      const leadData = { ...callbackForm, carId, carInfo: `${car?.make} ${car?.model} ${car?.year}`, type: "callback", status: "new", createdAt: new Date() };
      const telegramData = { ...callbackForm, carMake: car?.make, carModel: car?.model, carYear: car?.year, carId, type: 'callback' };
      createLead(leadData);
      sendTelegramNotification(telegramData);
      setIsCallbackOpen(false);
      setCallbackForm({ name: "", phone: "+375" });
      showSuccess("Заявка на обратный звонок отправлена!");
    });
  };

  if (loading) return <CarDetailsSkeleton />;
  if (carNotFound) return <CarNotFoundComponent contactPhone={contactPhone} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-1 sm:px-2 lg:px-4 py-4 sm:py-6 max-w-7xl">
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-slate-500">
            <li><button onClick={() => router.push('/')} className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100">Главная</button></li>
            <li><ChevronRight className="h-4 w-4 text-slate-400" /></li>
            <li><button onClick={() => router.push('/catalog')} className="hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100">Каталог</button></li>
            <li><ChevronRight className="h-4 w-4 text-slate-400" /></li>
            <li className="text-slate-900 font-medium px-2 py-1 bg-slate-100 rounded-md">{`${car?.make} ${car?.model}`}</li>
          </ol>
        </nav>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50 p-3 sm:p-6">
            <div className="flex items-start justify-between gap-3 lg:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-lg sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{car?.make} {car?.model}</h1>
                  <div className={`self-start sm:self-auto px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white ${car?.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>{car?.isAvailable ? 'В наличии' : 'Продан'}</div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.year}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.color}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs sm:text-sm font-medium">{car?.bodyType}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 leading-tight">
                    {car?.price ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(car.price) : 'Цена по запросу'}
                  </div>
                  {usdBynRate && car?.price && (
                    <div className="text-sm sm:text-base lg:text-lg font-semibold text-slate-600">
                      ≈ {new Intl.NumberFormat("ru-BY", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(car.price * usdBynRate)}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-8 lg:border-r border-slate-200/50">
              {/* Gallery and other content removed for brevity as they are not relevant to the task */}
            </div>
            <div className="lg:col-span-4">
              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">Финансирование</h4>
                  <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/50">
                    <Button onClick={() => setFinancialAssistantOpen(true)} className="w-full bg-slate-900 hover:bg-black text-white font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base">
                      <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Рассчитать кредит/лизинг
                    </Button>
                  </div>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-slate-200/50">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base"><Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Записаться на просмотр</Button></DialogTrigger>
                       <DialogContent>
                          <DialogHeader><DialogTitle>Записаться на просмотр</DialogTitle></DialogHeader>
                          <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div><Label htmlFor="bookingName">Ваше имя</Label><Input id="bookingName" value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} required/></div>
                            <div><Label htmlFor="bookingPhone">Номер телефона</Label><div className="relative"><Input id="bookingPhone" value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: formatPhoneNumber(e.target.value) })} placeholder="+375XXXXXXXXX" required className="pr-10"/>{isPhoneValid(bookingForm.phone) && (<Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />)}</div></div>
                            <div><Label htmlFor="bookingMessage">Комментарий</Label><Textarea id="bookingMessage" value={bookingForm.message} onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })} placeholder="Удобное время для просмотра..."/></div>
                            <StatusButton type="submit" className="w-full" state={bookingButtonState.state} loadingText="Отправляем..." successText="Заявка отправлена!" errorText="Ошибка">Записаться на просмотр</StatusButton>
                          </form>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen}>
                      <DialogTrigger asChild><Button className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-semibold rounded-xl py-2 sm:py-3 text-sm sm:text-base"><Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Заказать звонок</Button></DialogTrigger>
                       <DialogContent>
                          <DialogHeader><DialogTitle>Заказать обратный звонок</DialogTitle></DialogHeader>
                          <form onSubmit={handleCallbackSubmit} className="space-y-4">
                            <div><Label htmlFor="callbackName">Ваше имя</Label><Input id="callbackName" value={callbackForm.name} onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })} required/></div>
                            <div><Label htmlFor="callbackPhone">Номер телефона</Label><div className="relative"><Input id="callbackPhone" value={callbackForm.phone} onChange={(e) => setCallbackForm({ ...callbackForm, phone: formatPhoneNumber(e.target.value) })} placeholder="+375XXXXXXXXX" required className="pr-10"/>{isPhoneValid(callbackForm.phone) && (<Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />)}</div></div>
                            <StatusButton type="submit" className="w-full" state={callbackButtonState.state} loadingText="Отправляем..." successText="Заявка отправлена!" errorText="Ошибка">Заказать звонок</StatusButton>
                          </form>
                        </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FinancialAssistantDrawer
          open={isFinancialAssistantOpen}
          onOpenChange={setFinancialAssistantOpen}
          car={car}
        />

      </div>
    </div>
  )
}