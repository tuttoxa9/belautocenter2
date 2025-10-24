
import BuybackForm from "@/components/buyback-form";

export default function BuybackPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">Выкуп авто</h1>
      <p className="text-center text-gray-600 mb-8">
        Продайте ваш автомобиль быстро и выгодно. Заполните форму ниже, и мы свяжемся с вами в ближайшее время.
      </p>
      <div className="max-w-2xl mx-auto">
        <BuybackForm />
      </div>
    </div>
  );
}
