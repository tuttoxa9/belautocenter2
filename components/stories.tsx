"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import FadeInImage from "@/components/fade-in-image"
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Story {
  id: string
  mediaUrl: string
  mediaType: "image" | "video"
  caption: string
  subtitle?: string
  linkUrl?: string
  order: number
  createdAt: Date
}

interface StoriesSettings {
  title: string
  subtitle: string
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([])
  const [settings, setSettings] = useState<StoriesSettings>({
    title: "Свежие поступления и новости",
    subtitle: "Следите за нашими обновлениями",
  })
  const [selectedStory, setSelectedStory] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "stories"))
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as StoriesSettings)
      }
    } catch (error) {
      console.error("Error loading stories settings:", error)
    }
  }, [])

  const loadStories = useCallback(async () => {
    try {
      console.log("Loading stories from Firestore...")
      const storiesQuery = query(
        collection(db, "stories"),
        orderBy("order", "asc")
      )

      const snapshot = await getDocs(storiesQuery)
      console.log("Stories snapshot size:", snapshot.size)

      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Story[]

      console.log("Loaded stories:", storiesData)
      setStories(storiesData)
    } catch (error) {
      console.error("Error loading stories:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadStories(), loadSettings()])
    }
    loadData()
  }, [loadStories, loadSettings])

  const handleNext = React.useCallback(() => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setProgress(0)
      setViewedStories((prev) => new Set([...prev, stories[nextIndex]?.id]))
    } else {
      setSelectedStory(null)
    }
  }, [currentIndex, stories])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (selectedStory !== null && isPlaying && stories.length > 0) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext()
            return 0
          }
          return prev + 2
        })
      }, 100)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [selectedStory, isPlaying, handleNext, stories.length])

  const handleStoryClick = (index: number) => {
    console.log('Story clicked:', index, stories[index]?.id)

    // Сначала принудительно закрываем диалог если он открыт
    if (selectedStory !== null) {
      setSelectedStory(null)
      setProgress(0)
    }

    // Небольшая задержка для корректного закрытия перед открытием
    setTimeout(() => {
      setSelectedStory(index)
      setCurrentIndex(index)
      setProgress(0)
      setIsPlaying(true)
      setViewedStories((prev) => new Set([...prev, stories[index].id]))
    }, 50)
  }

  const handleFullscreenClick = () => {
    const story = stories[currentIndex]
    // Проверяем, что история существует и у неё есть ссылка
    if (story && story.linkUrl) {
      if (story.linkUrl.startsWith('http')) {
        window.open(story.linkUrl, '_blank')
      } else {
        window.location.href = story.linkUrl
      }
    }
    // если нет истории или ссылки - ничего не делаем
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setProgress(0)
    }
  }

  const handleClose = () => {
    console.log('Closing stories dialog')
    setSelectedStory(null)
    setCurrentIndex(0)
    setProgress(0)
    setIsPlaying(true)
  }

  if (loading) {
    return (
      <div className="container px-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="flex space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div className="text-center mt-2 max-w-16">
                  <div className="h-3 bg-gray-300 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stories.length === 0) return null

  return (
    <>
      {/* Лента историй */}
      <div className="container px-4">
        <div className="mb-2">
          <h2 className="text-lg md:text-xl font-display font-bold text-gray-900 tracking-tight">{settings.title}</h2>
        </div>
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          {stories.map((story, index) => (
            <button key={story.id} onClick={() => handleStoryClick(index)} className="flex-shrink-0 relative group">
              <div
                className={`w-16 h-16 rounded-full p-1 transition-all duration-300 border-2 ${
                  viewedStories.has(story.id) ? "border-gray-300" : "border-gradient-to-r from-purple-500 to-pink-500"
                } group-hover:scale-105`}
                style={!viewedStories.has(story.id) ? {
                  background: 'linear-gradient(45deg, #8B5CF6, #EC4899)',
                  padding: '2px'
                } : {}}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <FadeInImage
                    src={story.mediaUrl || "/placeholder.svg"}
                    alt={story.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {story.mediaType === "video" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="h-2.5 w-2.5 text-gray-800 ml-0.5" />
                  </div>
                </div>
              )}

              <div className="text-center mt-2 w-16">
                <p className="text-xs text-gray-600 font-medium leading-tight break-words hyphens-auto">{story.caption}</p>
                {story.subtitle && (
                  <p className="text-xs text-gray-500 mt-1 leading-tight break-words hyphens-auto">{story.subtitle}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Полноэкранный просмотрщик */}
      <Dialog open={selectedStory !== null} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-0 bg-black border-none">
          {selectedStory !== null && (
            <div className="relative h-[600px] w-full">
              {/* Индикаторы прогресса */}
              <div className="absolute top-4 left-4 right-4 z-10 flex space-x-1">
                {stories.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-100"
                      style={{
                        width: index < currentIndex ? "100%" : index === currentIndex ? `${progress}%` : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Контент истории */}
              {stories[currentIndex] && (
                <div
                  className={`relative h-full ${stories[currentIndex].linkUrl ? 'cursor-pointer' : ''}`}
                  onClick={stories[currentIndex].linkUrl ? handleFullscreenClick : undefined}
                >
                  {stories[currentIndex].mediaType === "image" ? (
                    <FadeInImage
                      src={stories[currentIndex].mediaUrl || "/placeholder.svg"}
                      alt={stories[currentIndex].caption}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={stories[currentIndex].mediaUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                    />
                  )}

                  {/* Подпись с затемнением */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{stories[currentIndex].caption}</p>
                    {stories[currentIndex].linkUrl && (
                      <div className="flex items-center mt-2">
                        <div className="w-6 h-6 bg-blue-500 bg-opacity-80 rounded-full flex items-center justify-center mr-2">
                          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Кнопки управления */}
              <div className="absolute inset-0 flex pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  className="flex-1 flex items-center justify-start pl-4 pointer-events-auto"
                  disabled={currentIndex === 0}
                >
                  {currentIndex > 0 && <ChevronLeft className="h-8 w-8 text-white/70 hover:text-white" />}
                </button>



                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="flex-1 flex items-center justify-end pr-4 pointer-events-auto"
                >
                  <ChevronRight className="h-8 w-8 text-white/70 hover:text-white" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
