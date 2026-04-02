"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { uploadImage, deleteImage } from "@/lib/storage"
import { getCachedImageUrl } from "@/lib/image-cache"
import { Button } from "@/components/ui/button"
import { Loader2, ImagePlus, Trash2, GripHorizontal, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import imageCompression from 'browser-image-compression'

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

interface UploadQueueItem {
  id: string
  file: File
  previewUrl: string
  status: 'uploading' | 'success' | 'error'
  serverPath?: string
  originalSize?: number
  convertedSize?: number
  error?: string
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function ImageUpload({
  onImageUploaded,
  onUpload,
  onMultipleUpload,
  path = 'general',
  currentImage,
  currentImages,
  className,
  multiple = false
}: ImageUploadProps) {

  // Состояния
  const [serverImages, setServerImages] = useState<string[]>(currentImages || (currentImage ? [currentImage] : []))
  const [queue, setQueue] = useState<UploadQueueItem[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [deletingUrls, setDeletingUrls] = useState<Set<string>>(new Set())

  const containerRef = useRef<HTMLDivElement>(null)

  // Инициализация (устанавливаем начальное значение только при монтировании или изменении пропсов)
  // Мы не добавляем serverImages в зависимости, чтобы избежать перезаписи при локальном обновлении (загрузке новых)
  useEffect(() => {
    if (currentImages) {
      setServerImages(prev => {
        const currentValid = currentImages.filter(url => url.trim() !== "")
        if (JSON.stringify(prev) !== JSON.stringify(currentValid)) {
          return currentValid;
        }
        return prev;
      });
    } else if (currentImage) {
      setServerImages(prev => {
        const currentValid = [currentImage].filter(url => url.trim() !== "")
        if (JSON.stringify(prev) !== JSON.stringify(currentValid)) {
          return currentValid;
        }
        return prev;
      });
    }
  }, [currentImages, currentImage]);

  // Очистка URL.createObjectURL для предотвращения утечек памяти
  // Используем useRef для сбора всех созданных previewUrl и отзываем их только при размонтировании
  const createdUrlsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    const urls = createdUrlsRef.current
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  // Обработка загрузки файлов
  const processFiles = useCallback(async (filesToProcess: File[]) => {
    if (!filesToProcess.length) return

    // Валидация
    const validFiles = filesToProcess.filter(file => {
      if (file.size > 10 * 1024 * 1024) return false;
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      const ext = file.name.toLowerCase().split('.').pop() || '';
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
      return (file.type.startsWith('image/') || allowedTypes.includes(file.type) || allowedExts.includes(ext));
    });

    if (!validFiles.length) return;

    const files = multiple ? validFiles : [validFiles[0]];

    // Создаем элементы очереди
    const newItems: UploadQueueItem[] = files.map(file => {
      const url = URL.createObjectURL(file)
      createdUrlsRef.current.add(url)
      return {
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: url,
        status: 'uploading'
      }
    });

    if (multiple) {
      setQueue(prev => [...prev, ...newItems]);
    } else {
      setQueue(newItems);
      setServerImages([]); // Очищаем старое фото при одиночной загрузке
    }

    // Последовательная обработка
    for (const item of newItems) {
      try {
        const options = {
          maxSizeMB: 3,
          maxWidthOrHeight: 2500,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.8
        }

        const compressedBlob = await imageCompression(item.file, options)
        const newFileName = item.file.name.replace(/\.[^/.]+$/, "") + ".webp"
        const compressedFile = new File([compressedBlob], newFileName, { type: "image/webp" })

        const uploadResult = await uploadImage(compressedFile, path, true) // autoWebP всегда true

        // 1. Обновляем статус на success в очереди (зеленая галочка и статистика сжатия)
        setQueue(prev => prev.map(qItem =>
          qItem.id === item.id
            ? {
                ...qItem,
                status: 'success',
                serverPath: uploadResult.path,
                originalSize: item.file.size,
                convertedSize: compressedFile.size
              }
            : qItem
        ));

        // 2. Сразу переносим путь загруженной картинки в основную галерею (serverImages)
        // Поскольку мы в асинхронном цикле и serverImages обновляется шаг за шагом,
        // мы используем setState с prev, чтобы всегда добавлять в конец актуального массива.
        setServerImages(prev => {
          const newImagesToExport = multiple ? [...prev, uploadResult.path] : [uploadResult.path];

          // Вызываем коллбеки родителя изнутри сеттера, но через setTimeout(..., 0),
          // чтобы избежать предупреждений React (bad setState) и гарантированно
          // передать родителю самый свежий стейт.
          setTimeout(() => {
            if (multiple && onMultipleUpload) {
              onMultipleUpload(newImagesToExport);
            } else if (!multiple) {
              if (onImageUploaded) onImageUploaded(newImagesToExport[0]);
              if (onUpload) onUpload(newImagesToExport[0]);
            }
          }, 0);

          return newImagesToExport;
        });

        // 3. Удаляем элемент из очереди через 2 секунды (визуальный эффект завершения загрузки)
        setTimeout(() => {
          setQueue(prev => prev.filter(qItem => qItem.id !== item.id));
        }, 2000);

      } catch (error) {
        // Обновляем статус на error
        setQueue(prev => prev.map(qItem =>
          qItem.id === item.id
            ? { ...qItem, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : qItem
        ));
      }
    }
  }, [multiple, path, onMultipleUpload, onImageUploaded, onUpload, serverImages]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, [processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".heic", ".heif"] },
    maxFiles: multiple ? undefined : 1,
    multiple: multiple,
    noClick: false, // Разрешаем клик по дропзоне
  });

  // Обработчик вставки из буфера обмена (на уровне документа или контейнера)
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Если пользователь печатает в input/textarea, не перехватываем
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        processFiles(imageFiles);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, [processFiles]);

  // Управление галереей (Drag & Drop)
  const removeImage = async (imageUrlToRemove: string) => {

    // Добавляем URL в список удаляемых для показа лоадера
    setDeletingUrls(prev => new Set(prev).add(imageUrlToRemove));

    // Физически удаляем файл из Cloudflare R2
    if (imageUrlToRemove && !imageUrlToRemove.startsWith('blob:')) {
      try {
        await deleteImage(imageUrlToRemove);
      } catch (error) {
        console.error("Ошибка при физическом удалении картинки из R2:", error);
      }
    }

    // Используем функциональное обновление стейта, чтобы избежать гонки данных при параллельных удалениях
    setServerImages(prevImages => {
      const finalImages = prevImages.filter(url => url !== imageUrlToRemove);

      // Убираем URL из списка удаляемых
      setDeletingUrls(prev => {
        const next = new Set(prev);
        next.delete(imageUrlToRemove);
        return next;
      });

      // Вызываем коллбеки родителя с новым массивом через setTimeout (чтобы не нарушать чистоту функции)
      setTimeout(() => {
        if (multiple && onMultipleUpload) onMultipleUpload(finalImages);
        if (!multiple) {
          if (onImageUploaded) onImageUploaded("");
          if (onUpload) onUpload("");
        }
      }, 0);

      return finalImages;
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newImages = [...serverImages];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    setServerImages(newImages);
    if (multiple && onMultipleUpload) onMultipleUpload(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Прозрачная картинка при перетаскивании для лучшего UX
    const img = new globalThis.Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index);
      setDraggedIndex(index); // Обновляем индекс перетаскиваемого элемента
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
  };


  return (
    <div ref={containerRef} className={`${className} space-y-6 outline-none`}>

      {/* 1. ЕДИНАЯ ЗОНА ЗАГРУЗКИ (The Monolith Dropzone) */}
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center min-h-[200px]
          border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
          ${isDragActive
            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
            : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-500"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className={`p-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 transition-transform duration-300 ${isDragActive ? "scale-110" : ""}`}>
            <ImagePlus className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              Перетащите фото сюда, нажмите или используйте Ctrl+V
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
              JPEG, PNG, WebP, HEIC до 10MB • Автоматическая конвертация в WebP
            </p>
          </div>
        </div>
      </div>

      {/* 3. ГАЛЕРЕЯ АВТОМОБИЛЕЙ + ОЧЕРЕДЬ ЗАГРУЗКИ */}
      {(serverImages.length > 0 || queue.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" onDragOver={handleDragOver} onDrop={handleDrop}>

          {/* Сначала показываем успешно загруженные (серверные) картинки */}
          {serverImages.map((imageUrl, index) => {
            const isKing = index === 0 && multiple;
            const isDragged = draggedIndex === index;

            const isDeleting = deletingUrls.has(imageUrl);

            // Если картинка уже добавлена в serverImages, но всё ещё висит в очереди (queue)
            // со статусом 'success' (показывает бейдж сжатия 2 секунды) — скрываем дубликат в галерее.
            const isRecentlyUploaded = queue.some(qItem => qItem.serverPath === imageUrl && qItem.status === 'success');

            return (
              <div
                key={`server-${imageUrl}`}
                draggable={!isDeleting}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={() => setDraggedIndex(null)}
                className={`
                  group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800
                  transition-all duration-300 transform-gpu
                  ${isKing ? "ring-2 ring-amber-500/70 shadow-lg shadow-amber-500/10" : "border border-zinc-200 dark:border-zinc-700/50"}
                  ${isDragged ? "opacity-30 scale-95" : "hover:scale-[1.02]"}
                  ${isDeleting ? "opacity-50 grayscale" : ""}
                  ${isRecentlyUploaded ? "hidden" : "block"}
                `}
              >
                <img
                  src={getCachedImageUrl(imageUrl)}
                  alt={`Gallery ${index}`}
                  className="w-full h-full object-cover"
                />

                {/* Король Галереи (Badge) */}
                {isKing && (
                  <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 text-black border-none text-[10px] px-2 shadow-sm z-10">
                    Главное фото
                  </Badge>
                )}

                {/* ИСПОЛЬЗУЙ GLASSMORPHISM НА HOVER или если удаляется */}
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity flex flex-col justify-between p-2 z-20
                  ${isDeleting ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}>

                  {/* Верхняя панель: Номер и Удаление */}
                  <div className="flex justify-between items-start w-full">
                    {!isKing ? (
                      <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-medium">
                        {index + 1}
                      </div>
                    ) : (
                      <div /> /* Spacer for King */
                    )}

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(imageUrl); }}
                      className={`p-1.5 rounded-lg text-white backdrop-blur-md transition-colors z-30 pointer-events-auto
                        ${isDeleting ? "bg-red-500/80 cursor-not-allowed" : "bg-white/10 hover:bg-red-500/90 hover:text-red-500"}
                      `}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Центр: Иконка Grip или Удаления */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white/80">
                      {isDeleting ? (
                         <span className="text-xs font-medium px-2 py-1">Удаление...</span>
                      ) : multiple ? (
                        <GripHorizontal className="h-6 w-6" />
                      ) : null}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {/* 2. МАГИЯ ЗАГРУЗКИ (Uploading State Queue) */}
          {queue.map((item) => {
            const isSuccess = item.status === 'success';
            const isError = item.status === 'error';

            return (
              <div
                key={item.id}
                className={`
                  relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800
                  border border-zinc-200 dark:border-zinc-700/50 transition-all duration-500
                `}
              >
                {/* Превью (с эффектами размытия/чб пока грузится) */}
                <img
                  src={item.previewUrl}
                  alt="Upload preview"
                  className={`
                    w-full h-full object-cover transition-all duration-700
                    ${!isSuccess ? "grayscale blur-[2px] opacity-60 scale-105" : "grayscale-0 blur-0 opacity-100 scale-100"}
                  `}
                />

                {/* Оверлей статуса в центре */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {!isSuccess && !isError && (
                    <div className="p-3 rounded-full bg-black/40 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                  {isSuccess && (
                    <div className="p-2 rounded-full bg-green-500/20 backdrop-blur-sm animate-in zoom-in duration-300">
                      <Check className="h-8 w-8 text-green-400 drop-shadow-md" />
                    </div>
                  )}
                  {isError && (
                    <div className="p-2 rounded-full bg-red-500/40 backdrop-blur-sm flex flex-col items-center">
                      <X className="h-8 w-8 text-red-200" />
                    </div>
                  )}
                </div>

                {/* Тонкий прогресс-бар внизу (Apple/iOS Style) */}
                {!isError && (
                  <div className={`absolute bottom-0 left-0 h-1 bg-blue-500 z-30 transition-all duration-300 ease-out
                    ${item.status === 'uploading' ? 'animate-optimistic-progress opacity-100' : ''}
                    ${isSuccess ? '!width-full !w-[100%] opacity-0 delay-500' : ''}
                  `}
                  style={{
                    boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
                    width: isSuccess ? '100%' : '0%' // fallback
                  }}
                  />
                )}

                {/* Плашка сжатия (Внизу слева, появляется после завершения прогресс-бара) */}
                {isSuccess && item.originalSize && item.convertedSize && (
                  <Badge className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-green-400 border-none text-[10px] px-2 py-0.5 animate-in slide-in-from-bottom-2 delay-300 duration-500 font-mono tracking-tight z-20">
                    {formatBytes(item.originalSize)} ➔ {formatBytes(item.convertedSize)} (-{((1 - item.convertedSize / item.originalSize) * 100).toFixed(0)}%)
                  </Badge>
                )}

                {/* Ошибка */}
                {isError && (
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-red-500/90 backdrop-blur-sm z-30">
                    <p className="text-[10px] text-white text-center leading-tight truncate">
                      {item.error || 'Ошибка загрузки'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      )}
    </div>
  )
}
