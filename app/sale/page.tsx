import { redirect } from "next/navigation"

export default function SalePage() {
  // Мгновенный серверный редирект без лоадера
  redirect("/?sale=true")
}
