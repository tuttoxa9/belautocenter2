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
  onMultipleUpload?: (urls: string[]) => void
  path?: string
  currentImage?: string
  currentImages?: string[]
  className?: string
  multiple?: boolean
}

export default function ImageUpload({ onImageUploaded, onUpload, onMultipleUpload, path = 'general', currentImage, currentImages, className, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [previews, setPreviews] = useState<string[]>(currentImages || [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return

      // Если не множественная загрузка, обрабатываем только первый файл
      const filesToProcess = multiple ? acceptedFiles : [acceptedFiles[0]]

      // Проверка размера и типа файлов
      for (const file of filesToProcess) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой. Максимальный размер: 10MB`)
          return
        }

        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
          'image/heic', 'image/heif'
        ];
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

        if (!file.type.startsWith('image/') && !allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
          alert(`${file.name} не является файлом изображения (поддерживаются форматы: JPEG, PNG, WebP, HEIC, HEIF)`)
          return
        }
      }

      setUploading(true)
      try {
        if (multiple) {
          // Множественная загрузка
          console.log(`Начало загрузки ${filesToProcess.length} файлов`)
          const uploadPromises = filesToProcess.map(file => uploadImage(file, path))
          const imagePaths = await Promise.all(uploadPromises)
          console.log('Все файлы успешно загружены:', imagePaths)

          // Обновляем previews для множественной загрузки
          const newPreviews = [...previews, ...imagePaths]
          setPreviews(newPreviews)

          if (onMultipleUpload) {
            onMultipleUpload(newPreviews)
          }
        } else {
          // Одиночная загрузка
          const file = filesToProcess[0]
          console.log('Начало загрузки файла:', file.name, 'размер:', file.size, 'путь:', path)

          const imagePath = await uploadImage(file, path)
          console.log('Файл успешно загружен, путь:', imagePath)

          setPreview(imagePath)

          if (onImageUploaded) {
            onImageUploaded(imagePath)
          }
          if (onUpload) {
            onUpload(imagePath)
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error)
        alert(`Ошибка загрузки изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
      } finally {
        setUploading(false)
      }
    },
    [onImageUploaded, onUpload, onMultipleUpload, path, multiple, previews],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".heic", ".heif"],
    },
    maxFiles: multiple ? undefined : 1,
    multiple: multiple,
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

  const removeImageFromMultiple = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    setPreviews(newPreviews)
    if (onMultipleUpload) {
      onMultipleUpload(newPreviews)
    }
  }

  const clearAllImages = () => {
    setPreviews([])
    if (onMultipleUpload) {
      onMultipleUpload([])
    }
  }

  return (
    <div className={className}>
      {multiple ? (
        <div className="space-y-4">
          {/* Область для множественной загрузки */}
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
                  {isDragActive ? "Отпустите файлы здесь" : "Перетащите изображения или нажмите для выбора"}
                </p>
                <p className="text-xs text-gray-500">Можно выбрать несколько файлов: PNG, JPG, WEBP, HEIC, HEIF до 10MB каждый</p>
              </div>
            )}
          </Card>

          {/* Превью загруженных изображений */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Загруженные изображения ({previews.length})</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllImages}
                  disabled={uploading}
                >
                  Очистить все
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((imageUrl, index) => (
                  <Card key={index} className="relative">
                    <img
                      src={getCachedImageUrl(imageUrl || "/placeholder.svg")}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImageFromMultiple(index)}
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Одиночная загрузка (старое поведение)
        preview ? (
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
                <p className="text-xs text-gray-500">PNG, JPG, WEBP, HEIC, HEIF до 10MB (включая фото с iPhone)</p>
              </div>
            )}
          </Card>
        )
      )}
    </div>
  )
}
