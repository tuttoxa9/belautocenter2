"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { firestoreApi } from "@/lib/firestore-api"
import { deleteImage } from "@/lib/storage"

export default function AdminData() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeletePhotos = async () => {
    if (!confirm('Вы уверены, что хотите удалить все фотографии, кроме заглавных, у проданных автомобилей? Это действие необратимо.')) {
      return
    }

    setIsDeleting(true)
    toast({
      title: "Начинаем удаление...",
      description: "Получаем список автомобилей. Это может занять некоторое время.",
    })

    try {
      const allCars = await firestoreApi.getCollection('cars')
      const soldCars = allCars.filter(car => car.isAvailable === false)

      if (soldCars.length === 0) {
        toast({
          title: "Нечего удалять",
          description: "Не найдено проданных автомобилей.",
        })
        return
      }

      let deletedCount = 0
      const deletionPromises = []
      const carsToUpdate = []

      for (const car of soldCars) {
        if (car.images && Array.isArray(car.images) && car.images.length > 1) {
          const imagesToDelete = car.images.slice(1) // Все, кроме первого
          for (const imageUrl of imagesToDelete) {
            deletionPromises.push(deleteImage(imageUrl))
            deletedCount++
          }
          // Готовим обновление документа в Firestore
          carsToUpdate.push({
            id: car.id,
            data: { images: [car.images[0]] } // Оставляем только первое изображение
          });
        }
      }

      if (deletionPromises.length === 0) {
        toast({
          title: "Нечего удалять",
          description: "У проданных автомобилей нет дополнительных фотографий для удаления.",
        })
        return
      }

      toast({
        title: "Удаление фотографий...",
        description: `В процессе удаления ${deletedCount} фотографий. Не закрывайте страницу.`,
      })

      await Promise.all(deletionPromises)

      // Обновляем документы в Firestore
      const updatePromises = carsToUpdate.map(car =>
        firestoreApi.updateDocument('cars', car.id, car.data)
      );
      await Promise.all(updatePromises);


      toast({
        title: "Успех!",
        description: `Удалено ${deletedCount} фотографий и обновлены записи в базе данных.`,
        variant: "default",
      })

    } catch (error) {
      console.error("Ошибка при удалении фотографий:", error)
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление данными</CardTitle>
        <CardDescription>
          Операции с данными, которые могут повлиять на производительность и хранилище.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Внимание</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Эта функция удалит **ВСЕ**, кроме заглавной, фотографии у автомобилей со статусом "Продан" или "Не в наличии". Это действие необратимо. Рекомендуется создать резервную копию перед продолжением.</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDeletePhotos}
            variant="destructive"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Удаление..." : "Удалить старые фотографии"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
