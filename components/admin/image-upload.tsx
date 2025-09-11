"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { uploadImage } from "@/lib/storage"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2, MoveUp, MoveDown } from "lucide-react"

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
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [previews, setPreviews] = useState<string[]>(currentImages || [])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)
  const pasteAreaRef = useRef<HTMLDivElement>(null)

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

      try {
        if (multiple) {
          // Множественная загрузка - каждый файл загружается независимо
          console.log(`Начало загрузки ${filesToProcess.length} файлов`)

          // Добавляем временные превью с индикатором загрузки
          const tempPreviews = filesToProcess.map(() => 'loading')
          const newPreviews = [...previews, ...tempPreviews]
          setPreviews(newPreviews)

          // Добавляем имена файлов в множество загружающихся
          const newUploadingFiles = new Set(uploadingFiles)
          filesToProcess.forEach(file => newUploadingFiles.add(file.name))
          setUploadingFiles(newUploadingFiles)

          // Загружаем файлы параллельно
          filesToProcess.forEach(async (file, index) => {
            try {
              const imagePath = await uploadImage(file, path, true)
              console.log('Файл успешно загружен:', imagePath)

              // Обновляем превью для этого конкретного файла
              setPreviews(current => {
                const updated = [...current]
                const tempIndex = previews.length + index
                if (updated[tempIndex] === 'loading') {
                  updated[tempIndex] = imagePath
                }
                return updated
              })

              // Убираем из множества загружающихся
              setUploadingFiles(current => {
                const updated = new Set(current)
                updated.delete(file.name)
                return updated
              })

              // Обновляем родительский компонент
              if (onMultipleUpload) {
                setTimeout(() => {
                  setPreviews(current => {
                    const finalPreviews = current.filter(p => p !== 'loading')
                    onMultipleUpload(finalPreviews)
                    return finalPreviews
                  })
                }, 100)
              }
            } catch (error) {
              console.error("Ошибка загрузки файла:", file.name, error)
              alert(`Ошибка загрузки ${file.name}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)

              // Убираем неудачную загрузку из превью
              setPreviews(current => current.filter((_, i) => i !== previews.length + index))
              setUploadingFiles(current => {
                const updated = new Set(current)
                updated.delete(file.name)
                return updated
              })
            }
          })

        } else {
          // Одиночная загрузка
          const file = filesToProcess[0]
          console.log('Начало загрузки файла:', file.name, 'размер:', file.size, 'путь:', path)

          setUploading(true)
          const imagePath = await uploadImage(file, path, true)
          console.log('Файл успешно загружен, путь:', imagePath)

          setPreview(imagePath)

          if (onImageUploaded) {
            onImageUploaded(imagePath)
          }
          if (onUpload) {
            onUpload(imagePath)
          }
          setUploading(false)
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error)
        alert(`Ошибка загрузки изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
        setUploading(false)
      }
    },
    [onImageUploaded, onUpload, onMultipleUpload, path, multiple, previews, uploadingFiles],
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

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newPreviews = [...previews]
    const [movedItem] = newPreviews.splice(fromIndex, 1)
    newPreviews.splice(toIndex, 0, movedItem)
    setPreviews(newPreviews)
    if (onMultipleUpload) {
      onMultipleUpload(newPreviews)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleNumberClick = (index: number) => {
    setEditingIndex(index)
    setEditingValue((index + 1).toString())
  }

  const handleNumberSubmit = (currentIndex: number) => {
    const newPosition = parseInt(editingValue) - 1
    if (newPosition >= 0 && newPosition < previews.length && newPosition !== currentIndex) {
      moveImage(currentIndex, newPosition)
    }
    setEditingIndex(null)
    setEditingValue("")
  }

  const handleNumberKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      handleNumberSubmit(currentIndex)
    } else if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditingValue("")
    }
  }

  // Обработчик вставки из буфера обмена
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          imageFiles.push(file)
        }
      }
    }

    if (imageFiles.length > 0) {
      await onDrop(imageFiles)
    }
  }, [onDrop])

  // Обработчик клика по области вставки
  const handlePasteAreaClick = useCallback(() => {
    if (pasteAreaRef.current) {
      pasteAreaRef.current.focus()
    }
  }, [])

  // Добавляем и удаляем обработчик paste
  useEffect(() => {
    const container = containerRef.current
    const pasteArea = pasteAreaRef.current

    if (container) {
      container.addEventListener('paste', handlePaste)
      // Делаем контейнер фокусируемым для получения событий paste
      container.setAttribute('tabindex', '0')
    }

    if (pasteArea) {
      pasteArea.addEventListener('paste', handlePaste)
    }

    return () => {
      if (container) {
        container.removeEventListener('paste', handlePaste)
      }
      if (pasteArea) {
        pasteArea.removeEventListener('paste', handlePaste)
      }
    }
  }, [handlePaste])

  return (
    <div ref={containerRef} className={`${className} outline-none`}>
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
{uploadingFiles.size > 0 ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">Загружается файлов: {uploadingFiles.size}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? "Отпустите файлы здесь" : "Перетащите изображения или нажмите для выбора"}
                </p>
                <div
                  ref={pasteAreaRef}
                  onClick={handlePasteAreaClick}
                  tabIndex={0}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm text-center bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer transition-colors"
                >
                  Нажмите сюда и используйте Ctrl+V для вставки изображений
                </div>
                <p className="text-xs text-gray-500">Можно выбрать несколько файлов: PNG, JPG, WEBP, HEIC, HEIF до 10MB каждый</p>
                <p className="text-xs text-green-600">✓ Автоматическая конвертация в WebP для оптимизации</p>
              </div>
            )}
          </Card>

          {/* Превью загруженных изображений */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Загруженные изображения ({previews.length})</p>
                  <p className="text-xs text-gray-500">Перетащите для изменения порядка или кликните на номер</p>
                </div>
<Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllImages}
                  disabled={uploadingFiles.size > 0}
                >
                  Очистить все
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
{previews.map((imageUrl, index) => (
                  <Card
                    key={index}
                    className={`relative transition-transform ${
                      imageUrl === 'loading' ? 'cursor-default' : 'cursor-move'
                    } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
                    draggable={imageUrl !== 'loading'}
                    onDragStart={imageUrl !== 'loading' ? (e) => handleDragStart(e, index) : undefined}
                    onDragOver={imageUrl !== 'loading' ? handleDragOver : undefined}
                    onDrop={imageUrl !== 'loading' ? (e) => handleDrop(e, index) : undefined}
                  >
                    {imageUrl === 'loading' ? (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      </div>
                    ) : (
                      <img
                        src={getCachedImageUrl(imageUrl || "/placeholder.svg")}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
{imageUrl !== 'loading' && (
                      <>
                        {/* Счетчик порядка фотографии */}
                        <div
                          className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                          onClick={() => handleNumberClick(index)}
                          title="Нажмите для изменения позиции"
                        >
                          {editingIndex === index ? (
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => handleNumberSubmit(index)}
                              onKeyDown={(e) => handleNumberKeyDown(e, index)}
                              className="w-8 bg-transparent text-white text-center text-xs outline-none"
                              min="1"
                              max={previews.filter(p => p !== 'loading').length}
                              autoFocus
                            />
                          ) : (
                            previews.slice(0, index + 1).filter(p => p !== 'loading').length
                          )}
                        </div>

                        {/* Кнопки управления */}
                        <div className="absolute top-1 right-1 flex flex-col gap-1">
                          {/* Кнопка перемещения вверх */}
                          {index > 0 && previews[index - 1] !== 'loading' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              onClick={() => moveImage(index, index - 1)}
                              disabled={uploadingFiles.size > 0}
                              title="Переместить вверх"
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Кнопка перемещения вниз */}
                          {index < previews.length - 1 && previews[index + 1] !== 'loading' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              onClick={() => moveImage(index, index + 1)}
                              disabled={uploadingFiles.size > 0}
                              title="Переместить вниз"
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Кнопка удаления */}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0"
                            onClick={() => removeImageFromMultiple(index)}
                            disabled={uploadingFiles.size > 0}
                            title="Удалить изображение"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
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
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? "Отпустите файл здесь" : "Перетащите изображение или нажмите для выбора"}
                </p>
                <div
                  ref={pasteAreaRef}
                  onClick={handlePasteAreaClick}
                  tabIndex={0}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm text-center bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer transition-colors"
                >
                  Нажмите сюда и используйте Ctrl+V для вставки изображения
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP, HEIC, HEIF до 10MB (включая фото с iPhone)</p>
                <p className="text-xs text-green-600">✓ Автоматическая конвертация в WebP для оптимизации</p>
              </div>
            )}
          </Card>
        )
      )}
    </div>
  )
}
