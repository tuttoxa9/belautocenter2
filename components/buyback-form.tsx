"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { useNotification } from "@/components/providers/notification-provider";

const buybackFormSchema = z.object({
  name: z.string().min(2, { message: "Имя должно быть не менее 2 символов." }),
  phone: z.string().regex(/^\+375\d{9}$/, { message: "Неверный формат номера телефона." }),
  car: z.string().min(2, { message: "Укажите марку и модель авто." }),
  city: z.string().min(2, { message: "Укажите ваш населенный пункт." }),
});

export default function BuybackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const form = useForm<z.infer<typeof buybackFormSchema>>({
    resolver: zodResolver(buybackFormSchema),
    defaultValues: {
      name: "",
      phone: "+375",
      car: "",
      city: "",
    },
  });

  async function onSubmit(values: z.infer<typeof buybackFormSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/buyback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showSuccess("Заявка на выкуп успешно отправлена!");
        form.reset();
      } else {
        showError("Произошла ошибка при отправке заявки.");
      }
    } catch (error) {
      showError("Произошла ошибка при отправке заявки.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваше имя</FormLabel>
              <FormControl>
                <Input placeholder="Иван" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Номер телефона</FormLabel>
              <FormControl>
                <Input placeholder="+375291234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="car"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Марка и модель авто</FormLabel>
              <FormControl>
                <Input placeholder="BMW X5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Населенный пункт</FormLabel>
              <FormControl>
                <Input placeholder="Минск" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Отправка..." : "Отправить заявку"}
        </Button>
      </form>
    </Form>
  );
}
