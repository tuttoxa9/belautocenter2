"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { uploadImage } from "@/lib/storage"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"

interface ImageUploadProps {
  onImageUploaded?: (url: string) => void
  onUpload?: (url: string) => void
  path?: string
  currentImage?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, onUpload, path = 'general', currentImage, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Проверка размера файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Файл слишком большой. Максимальный размер: 10MB")
        return
      }

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        alert("Пожалуйста, выберите файл изображения")
        return
      }

      setUploading(true)
      try {
        console.log('Начало загрузки файла:', file.name, 'размер:', file.size, 'путь:', path)
        const url = await uploadImage(file, path)
        console.log('Файл успешно загружен, URL:', url)
        setPreview(url)
        if (onImageUploaded) {
          onImageUploaded(url)
        }
        if (onUpload) {
          onUpload(url)
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error)
        alert(`Ошибка загрузки изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      } finally {
        setUploading(false)
      }
    },
    [onImageUploaded, onUpload, path],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  })

  const removeImage = () => {
    setPreview(null)
    if (onImageUploaded) {
      onImageUploaded("")
    }
    if (onUpload) {
      onUpload("")
    }
  }

  return (
    <div className={className}>
      {preview ? (
        <Card className="relative">
          <img src={getCachedImageUrl(preview || "/placeholder.svg")} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={removeImage}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive ? "Отпустите файл здесь" : "Перетащите изображение или нажмите для выбора"}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP до 10MB</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
