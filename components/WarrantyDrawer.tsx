"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UniversalDrawer } from "@/components/ui/UniversalDrawer"
import { useNotification } from "@/components/providers/notification-provider"

interface WarrantyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programTitle: string;
  programPrice?: string;
}

export function WarrantyDrawer({ open, onOpenChange, programTitle, programPrice }: WarrantyDrawerProps) {
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    name: "",
    phone: "+375",
    car: "",
    comment: ""
  });
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Basic formatting for BY +375
    const numbers = value.replace(/[^\d+]/g, "");
    if (numbers.startsWith("+375")) {
        return numbers.length > 13 ? numbers.slice(0, 13) : numbers;
    }
    return `+375${numbers.replace('+375', '').slice(0, 9)}`;
  };

  const isPhoneValid = (phone: string) => {
    return phone.length === 13 && phone.startsWith("+375");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        type: "warranty_request",
        program: programTitle,
        price: programPrice,
        name: formData.name,
        phone: formData.phone,
        car: formData.car,
        comment: formData.comment,
        status: "new",
        createdAt: new Date().toISOString(),
        source: "website_warranty"
      };

      // Send to Telegram (fire and forget for UI speed, but good to await for error handling if critical)
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      showSuccess("Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.");
      onOpenChange(false);
      setFormData({ name: "", phone: "+375", car: "", comment: "" });
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button
        onClick={handleSubmit}
        className="w-full h-12 text-base font-semibold rounded-xl"
        disabled={!isPhoneValid(formData.phone) || !formData.name || loading}
      >
        {loading ? "Отправка..." : "Отправить заявку"}
      </Button>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-primary">политикой обработки персональных данных</a>.
      </p>
    </>
  );

  return (
    <UniversalDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Оформление заявки"
      footer={footer}
    >
      <div className="space-y-6">
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Выбранная программа</h4>
          <div className="flex items-baseline justify-between">
             <span className="text-lg font-bold text-foreground">{programTitle}</span>
             {programPrice && <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">{programPrice}</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="w-name">Ваше имя</Label>
            <Input
              id="w-name"
              placeholder="Иван Иванов"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-phone">Телефон</Label>
            <Input
              id="w-phone"
              type="tel"
              placeholder="+375 (29) 000-00-00"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="w-car">Марка и модель авто</Label>
            <Input
              id="w-car"
              placeholder="Например: Audi A6, 2015"
              value={formData.car}
              onChange={(e) => setFormData({...formData, car: e.target.value})}
            />
          </div>

          <div className="space-y-2">
             <Label htmlFor="w-comment">Комментарий (необязательно)</Label>
             <Input
               id="w-comment"
               placeholder="Дополнительные вопросы..."
               value={formData.comment}
               onChange={(e) => setFormData({...formData, comment: e.target.value})}
             />
          </div>
        </div>
      </div>
    </UniversalDrawer>
  );
}
