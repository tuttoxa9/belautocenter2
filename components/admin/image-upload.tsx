"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { uploadImage, UploadResult } from "@/lib/storage"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Loader2, MoveUp, MoveDown, HelpCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


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

interface UploadLog {
  message: string
  fileName: string
  type: 'error' | 'warning' | 'success' | 'info' | 'processing'
  timestamp: Date
  uploadSessionId?: string
  details?: {
    originalSize?: number
    convertedSize?: number
    compressionPercent?: string
    originalType?: string
    savedAs?: string
  }
}

export default function ImageUpload({ onImageUploaded, onUpload, onMultipleUpload, path = 'general', currentImage, currentImages, className, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [autoWebP, setAutoWebP] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [previews, setPreviews] = useState<string[]>(currentImages || [])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState<string>("")
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [activeUploads, setActiveUploads] = useState<Map<string, string>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)
  const pasteAreaRef = useRef<HTMLDivElement>(null)

  // Функции для управления логами
  const addLog = (log: Omit<UploadLog, 'timestamp'>) => {
    const newLog: UploadLog = {
      ...log,
      timestamp: new Date()
    }
    setUploadLogs(prev => [...prev, newLog])
    setShowLogs(true)

    // Автоматически скрываем старые логи (оставляем последние 20)
    setTimeout(() => {
      setUploadLogs(prev => prev.slice(-20))
    }, 100)
  }

  const clearLogs = () => {
    setUploadLogs([])
    setShowLogs(false)
  }

  const addProcessingLog = (fileName: string, message: string, uploadSessionId?: string) => {
    addLog({
      message,
      fileName,
      type: 'processing',
      uploadSessionId
    })
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return

      // Если не множественная загрузка, обрабатываем только первый файл
      const filesToProcess = multiple ? acceptedFiles : [acceptedFiles[0]]

      // Проверка размера и типа файлов
      for (const file of filesToProcess) {
        if (file.size > 10 * 1024 * 1024) {
          addLog({
            message: `Файл слишком большой. Максимальный размер: 10MB`,
            fileName: file.name,
            type: 'error'
          })
          return
        }

        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
          'image/heic', 'image/heif'
        ];
        const fileExtension = file.name.toLowerCase().split('.').pop();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

        if (!file.type.startsWith('image/') && !allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
          addLog({
            message: `Не является файлом изображения (поддерживаются форматы: JPEG, PNG, WebP, HEIC, HEIF)`,
            fileName: file.name,
            type: 'error'
          })
          return
        }
      }

      try {
        if (multiple) {
          // Множественная загрузка - каждый файл загружается независимо

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
              addProcessingLog(file.name, `Начинается загрузка файла (${(file.size / 1024 / 1024).toFixed(2)} MB)`)

              const uploadResult = await uploadImage(file, path, autoWebP)
              const imagePath = uploadResult.path

              // Добавляем детальный лог об успешной загрузке
              addLog({
                message: uploadResult.message || 'Файл успешно загружен',
                fileName: file.name,
                type: uploadResult.conversionResult?.status === 'FAILED' ? 'warning' : 'success',
                uploadSessionId: uploadResult.uploadSessionId,
                details: {
                  originalSize: uploadResult.conversionResult?.originalSize || uploadResult.originalSize,
                  originalType: uploadResult.originalType,
                  savedAs: uploadResult.savedAs,
                  compressionPercent: uploadResult.conversionResult?.status === 'SUCCESS' && uploadResult.conversionResult.originalSize && uploadResult.conversionResult.convertedSize ?
                    ((uploadResult.conversionResult.originalSize - uploadResult.conversionResult.convertedSize) / uploadResult.conversionResult.originalSize * 100).toFixed(1) + '%' :
                    undefined
                }
              })

              // Добавляем дополнительную информацию о конвертации, если есть
              if (uploadResult.conversionResult) {
                addLog({
                  message: `Результат конвертации: ${uploadResult.conversionResult.reason}`,
                  fileName: file.name,
                  type: uploadResult.conversionResult.status === 'SUCCESS' ? 'info' :
                       uploadResult.conversionResult.status === 'FAILED' ? 'warning' : 'info',
                  uploadSessionId: uploadResult.uploadSessionId
                })
              }

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
              addLog({
                message: `Ошибка загрузки: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                fileName: file.name,
                type: 'error'
              })

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

          setUploading(true)
          addProcessingLog(file.name, `Начинается загрузка файла (${(file.size / 1024 / 1024).toFixed(2)} MB)`)

          const uploadResult = await uploadImage(file, path, autoWebP)
          const imagePath = uploadResult.path

          addLog({
            message: uploadResult.message || 'Файл успешно загружен',
            fileName: file.name,
            type: uploadResult.conversionResult?.status === 'FAILED' ? 'warning' : 'success',
            uploadSessionId: uploadResult.uploadSessionId,
            details: {
              originalSize: uploadResult.conversionResult?.originalSize || uploadResult.originalSize,
              originalType: uploadResult.originalType,
              savedAs: uploadResult.savedAs,
              compressionPercent: uploadResult.conversionResult?.status === 'SUCCESS' && uploadResult.conversionResult.originalSize && uploadResult.conversionResult.convertedSize ?
                ((uploadResult.conversionResult.originalSize - uploadResult.conversionResult.convertedSize) / uploadResult.conversionResult.originalSize * 100).toFixed(1) + '%' :
                undefined
            }
          })

          // Добавляем дополнительную информацию о конвертации, если есть
          if (uploadResult.conversionResult) {
            addLog({
              message: `Результат конвертации: ${uploadResult.conversionResult.reason}`,
              fileName: file.name,
              type: uploadResult.conversionResult.status === 'SUCCESS' ? 'info' :
                   uploadResult.conversionResult.status === 'FAILED' ? 'warning' : 'info',
              uploadSessionId: uploadResult.uploadSessionId
            })
          }

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
        addLog({
          message: `Ошибка загрузки изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          fileName: 'Неизвестный файл',
          type: 'error'
        })
        setUploading(false)
      }
    },
    [onImageUploaded, onUpload, onMultipleUpload, path, multiple, previews, uploadingFiles, autoWebP, addLog, addProcessingLog],
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

  // Обработчик фокуса области вставки
  const handlePasteAreaFocus = useCallback(() => {
    // Просто фокусируемся без дополнительных действий
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
      {/* Панель логов загрузки */}
      {showLogs && uploadLogs.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Логи загрузки изображений</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearLogs}
              className="h-6 px-2 text-xs"
            >
              Очистить все
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 bg-muted/30 dark:bg-zinc-900/50 rounded-lg p-3 border border-border/50">
            {uploadLogs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm border ${
                  log.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300'
                    : log.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-300'
                    : log.type === 'processing'
                    ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300'
                    : log.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-900/50 dark:text-yellow-300'
                    : 'bg-muted border-border text-foreground'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-xs">{log.fileName}</p>
                      {log.uploadSessionId && (
                        <span className="text-xs px-1 py-0.5 bg-muted border border-border rounded text-muted-foreground font-mono">
                          {log.uploadSessionId.slice(-6)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs mt-1">{log.message}</p>
                    {log.details && (
                      <div className="text-xs mt-1 space-y-0.5 bg-background/50 dark:bg-black/20 rounded p-1 border border-border/20">
                        {log.details.originalSize && (
                          <div>Исходный размер: {(log.details.originalSize / 1024 / 1024).toFixed(2)} MB</div>
                        )}
                        {log.details.originalType && log.details.savedAs && (
                          <div>Конвертация: {log.details.originalType} → {log.details.savedAs}</div>
                        )}
                        {log.details.compressionPercent && (
                          <div>Экономия места: {log.details.compressionPercent}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setUploadLogs(prev => prev.filter((_, i) => i !== index))
                      if (uploadLogs.length <= 1) {
                        setShowLogs(false)
                      }
                    }}
                    className="h-4 w-4 p-0 ml-2 text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {multiple ? (
        <div className="space-y-4">
          {/* Область для множественной загрузки */}
          <Card
            {...getRootProps()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-border hover:border-muted-foreground/50 dark:bg-zinc-900/30"
            }`}
          >
            <input {...getInputProps()} />
{uploadingFiles.size > 0 ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">Загружается файлов: {uploadingFiles.size}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? "Отпустите файлы здесь" : "Перетащите изображения или нажмите для выбора"}
                </p>
                <p className="text-xs text-muted-foreground/70">Можно выбрать несколько файлов: PNG, JPG, WEBP, HEIC, HEIF до 10MB каждый</p>
              </div>
            )}
          </Card>

          {/* Настройки загрузки */}
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="webp-toggle-multiple" checked={autoWebP} onCheckedChange={(checked) => setAutoWebP(Boolean(checked))} disabled />
            <Label htmlFor="webp-toggle-multiple" className="text-sm font-medium text-muted-foreground/60">
              Оптимизировать в WebP
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Включает автоматическую конвертацию JPG/PNG в современный формат WebP. Уменьшает размер файла до 70% без видимой потери качества. Рекомендуется для всех фотографий. Отключите для схем или логотипов, если требуется сохранить исходный формат.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>


          {/* Отдельная область для вставки из буфера обмена */}
          <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-900/50 p-4 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="text-yellow-600 dark:text-yellow-500/80">
                <svg className="h-6 w-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div
                ref={pasteAreaRef}
                tabIndex={0}
                className="w-full max-w-md px-4 py-3 border border-yellow-400 dark:border-yellow-900/50 rounded-lg text-sm text-center bg-white dark:bg-zinc-900 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:bg-white dark:focus:bg-zinc-900 focus:border-yellow-500 focus:outline-none cursor-text transition-colors text-foreground"
                onFocus={handlePasteAreaFocus}
                onKeyDown={(e) => {
                  // Предотвращаем любые действия кроме Ctrl+V
                  if (!(e.ctrlKey && e.key === 'v') && !(e.metaKey && e.key === 'v')) {
                    e.preventDefault()
                  }
                }}
              >
                📋 Нажмите сюда и используйте Ctrl+V для вставки изображений
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-500/60">Быстрая вставка изображений из буфера обмена</p>
            </div>
          </Card>

          {/* Превью загруженных изображений */}
          {previews.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Загруженные изображения ({previews.length})</p>
                  <p className="text-xs text-muted-foreground">Перетащите для изменения порядка или кликните на номер</p>
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
                    className={`relative transition-transform overflow-hidden ${
                      imageUrl === 'loading' ? 'cursor-default' : 'cursor-move'
                    } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
                    draggable={imageUrl !== 'loading'}
                    onDragStart={imageUrl !== 'loading' ? (e) => handleDragStart(e, index) : undefined}
                    onDragOver={imageUrl !== 'loading' ? handleDragOver : undefined}
                    onDrop={imageUrl !== 'loading' ? (e) => handleDrop(e, index) : undefined}
                  >
                    {imageUrl === 'loading' ? (
                      <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
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
          <div className="space-y-4">
            {/* Область для одиночной загрузки */}
            <Card
              {...getRootProps()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-border hover:border-muted-foreground/50 dark:bg-zinc-900/30"
              }`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? "Отпустите файл здесь" : "Перетащите изображение или нажмите для выбора"}
                  </p>
                  <p className="text-xs text-muted-foreground/70">PNG, JPG, WEBP, HEIC, HEIF до 10MB (включая фото с iPhone)</p>
                </div>
              )}
            </Card>

            {/* Настройки загрузки */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="webp-toggle-single" checked={autoWebP} onCheckedChange={(checked) => setAutoWebP(Boolean(checked))} disabled />
              <Label htmlFor="webp-toggle-single" className="text-sm font-medium text-muted-foreground/60">
                Оптимизировать в WebP
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Включает автоматическую конвертацию JPG/PNG в современный формат WebP. Уменьшает размер файла до 70% без видимой потери качества. Рекомендуется для всех фотографий. Отключите для схем или логотипов, если требуется сохранить исходный формат.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Отдельная область для вставки из буфера обмена */}
            <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10 dark:border-yellow-900/50 p-4 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="text-yellow-600 dark:text-yellow-500/80">
                  <svg className="h-6 w-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div
                  ref={pasteAreaRef}
                  tabIndex={0}
                  className="w-full max-w-md px-4 py-3 border border-yellow-400 dark:border-yellow-900/50 rounded-lg text-sm text-center bg-white dark:bg-zinc-900 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:bg-white dark:focus:bg-zinc-900 focus:border-yellow-500 focus:outline-none cursor-text transition-colors text-foreground"
                  onFocus={handlePasteAreaFocus}
                  onKeyDown={(e) => {
                    // Предотвращаем любые действия кроме Ctrl+V
                    if (!(e.ctrlKey && e.key === 'v') && !(e.metaKey && e.key === 'v')) {
                      e.preventDefault()
                    }
                  }}
                >
                  📋 Нажмите сюда и используйте Ctrl+V для вставки изображения
                </div>
                <p className="text-xs text-yellow-700">Быстрая вставка изображения из буфера обмена</p>
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  )
}
