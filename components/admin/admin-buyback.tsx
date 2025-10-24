"use client"
import { useState, useEffect } from "react"
import { firestoreApi, FirestoreDocument } from "@/lib/firestore-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ellipsis, Trash2 } from "lucide-react"
import { format } from "date-fns"

export default function AdminBuyback() {
  const [requests, setRequests] = useState<FirestoreDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await firestoreApi.getCollection("buybackRequests")
      // Сортируем заявки по дате создания
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setRequests(data)
    } catch (error) {
      console.error("Ошибка при загрузке заявок на выкуп:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteRequest = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту заявку?")) {
      try {
        await firestoreApi.deleteDocument("buybackRequests", id)
        loadRequests()
      } catch (error) {
        console.error("Ошибка при удалении заявки:", error)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявки на выкуп авто</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p><strong>Имя:</strong> {request.name}</p>
                  <p><strong>Телефон:</strong> {request.phone}</p>
                  <p><strong>Авто:</strong> {request.car}</p>
                  <p><strong>Город:</strong> {request.city}</p>
                  <p><strong>Дата:</strong> {format(request.createdAt, "dd.MM.yyyy HH:mm")}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={request.status === "new" ? "default" : "secondary"}>
                    {request.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => deleteRequest(request.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
