"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Star, User, Image as ImageIcon, MessageSquare, Calendar, Award } from "lucide-react"
import ImageUpload from "./image-upload"
import { getCachedImageUrl } from "@/lib/image-cache"

interface Review {
  id: string
  name: string
  rating: number
  text: string
  carModel?: string
  imageUrl?: string
  status: string
  createdAt: Date
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const cacheInvalidator = createCacheInvalidator('reviews')
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    text: "",
    carModel: "",
    imageUrl: "",
    status: "published",
  })

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(reviewsQuery)
      const reviewsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Review[]
      setReviews(reviewsData)
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const reviewData = {
        ...reviewForm,
        rating: Number(reviewForm.rating),
        createdAt: editingReview ? editingReview.createdAt : new Date(),
        updatedAt: new Date(),
      }

      if (editingReview) {
        await updateDoc(doc(db, "reviews", editingReview.id), reviewData)
        await cacheInvalidator.onUpdate(editingReview.id)
      } else {
        const docRef = await addDoc(collection(db, "reviews"), reviewData)
        await cacheInvalidator.onCreate(docRef.id)
      }

      setIsDialogOpen(false)
      setEditingReview(null)
      resetForm()
      loadReviews()
    } catch (error) {
      console.error("Ошибка сохранения:", error)
      alert("Ошибка сохранения отзыва")
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setReviewForm({
      name: review.name,
      rating: review.rating,
      text: review.text,
      carModel: review.carModel || "",
      imageUrl: review.imageUrl || "",
      status: review.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (reviewId: string) => {
    if (confirm("Удалить этот отзыв?")) {
      try {
        await deleteDoc(doc(db, "reviews", reviewId))
        await cacheInvalidator.onDelete(reviewId)
        loadReviews()
      } catch (error) {
        console.error("Ошибка удаления:", error)
        alert("Ошибка удаления отзыва")
      }
    }
  }

  const resetForm = () => {
    setReviewForm({
      name: "",
      rating: 5,
      text: "",
      carModel: "",
      imageUrl: "",
      status: "published",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Опубликован"
      case "pending":
        return "На модерации"
      case "rejected":
        return "Отклонен"
      default:
        return status
    }
  }

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${sizeClass} ${i < rating ? "text-amber-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const publishedReviews = reviews.filter(r => r.status === "published")
    if (publishedReviews.length === 0) return 0
    const sum = publishedReviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / publishedReviews.length).toFixed(1)
  }

  const getStatsCards = () => {
    const total = reviews.length
    const published = reviews.filter(r => r.status === "published").length
    const pending = reviews.filter(r => r.status === "pending").length
    const withImages = reviews.filter(r => r.imageUrl).length

    return [
      { title: "Всего отзывов", value: total, icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50" },
      { title: "Опубликовано", value: published, icon: Star, color: "text-emerald-600", bgColor: "bg-emerald-50" },
      { title: "На модерации", value: pending, icon: Calendar, color: "text-amber-600", bgColor: "bg-amber-50" },
      { title: "С фото", value: withImages, icon: ImageIcon, color: "text-purple-600", bgColor: "bg-purple-50" },
    ]
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const statsCards = getStatsCards()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Управление отзывами</h2>
            <p className="text-gray-600 text-sm">Модерация и управление отзывами клиентов</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingReview(null)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить отзыв
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>{editingReview ? "Редактировать" : "Добавить"} отзыв</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Имя клиента</span>
                  </Label>
                  <Input
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Введите имя клиента"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-700 flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Рейтинг</span>
                  </Label>
                  <Select
                    value={reviewForm.rating.toString()}
                    onValueChange={(value) => setReviewForm({ ...reviewForm, rating: Number(value) })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center space-x-2">
                            <span>{rating}</span>
                            <div className="flex">{renderStars(rating)}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 flex items-center space-x-2">
                  <span>Модель автомобиля (опционально)</span>
                </Label>
                <Input
                  value={reviewForm.carModel}
                  onChange={(e) => setReviewForm({ ...reviewForm, carModel: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Например: BMW X5, Mercedes-Benz C-Class"
                />
              </div>

              <div>
                <Label className="text-gray-700 flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Текст отзыва</span>
                </Label>
                <Textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                  placeholder="Отзыв клиента о покупке..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label className="text-gray-700 flex items-center space-x-2 mb-3">
                  <ImageIcon className="h-4 w-4" />
                  <span>Фото отзыва (опционально)</span>
                </Label>
                <ImageUpload
                  path="reviews"
                  currentImage={reviewForm.imageUrl}
                  onImageUploaded={(url) => setReviewForm({ ...reviewForm, imageUrl: url })}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-gray-700 flex items-center space-x-2">
                  <span>Статус публикации</span>
                </Label>
                <Select
                  value={reviewForm.status}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, status: value })}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="published">Опубликован</SelectItem>
                    <SelectItem value="pending">На модерации</SelectItem>
                    <SelectItem value="rejected">Отклонен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {editingReview ? "Сохранить изменения" : "Добавить отзыв"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Rating */}
      {reviews.length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Средний рейтинг</h3>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">{getAverageRating()}</span>
                  <div className="flex">{renderStars(Math.round(Number(getAverageRating())), "md")}</div>
                  <span className="text-gray-600">из {reviews.filter(r => r.status === "published").length} отзывов</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews && reviews.map((review) => (
          <Card key={review.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    {/* Review Image */}
                    {review.imageUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={getCachedImageUrl(review.imageUrl)}
                          alt="Фото отзыва"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{review.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-xs text-gray-500">{review.rating}/5</span>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(review.status)} border`}>
                          {getStatusText(review.status)}
                        </Badge>
                      </div>

                      {/* Car Model */}
                      {review.carModel && (
                        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 inline-block border border-gray-200">
                          <p className="text-sm text-gray-700">
                            <span className="text-gray-500">Автомобиль:</span> {review.carModel}
                          </p>
                        </div>
                      )}

                      {/* Review Text */}
                      <p className="text-gray-700 mb-3 leading-relaxed">{review.text}</p>

                      {/* Date */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{review.createdAt.toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 ml-4 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(review)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(review.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Отзывы не добавлены</h3>
            <p className="text-gray-600 mb-6">Начните с добавления первого отзыва клиента</p>
            <Button
              onClick={() => {
                resetForm()
                setEditingReview(null)
                setIsDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить первый отзыв
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
