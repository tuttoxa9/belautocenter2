"use client"

import React, { useState, useEffect, useCallback } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { createCacheInvalidator, purgeAllCache } from "@/lib/cache-invalidation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2, RefreshCw } from "lucide-react"

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [purgingCache, setPurgingCache] = useState(false)
  const cacheInvalidator = createCacheInvalidator('settings')
  const [settings, setSettings] = useState({
    main: {
      companyName: "Белавто Центр",
      phone: "+375 29 123-45-67",
      phone2: "",
      email: "info@belavto.by",
      address: "г. Минск, ул. Примерная, 123",
      workingHours: "Пн-Пт: 9:00-21:00",
      socialMedia: {
        instagram: "#",
        telegram: "#",
        avby: "#",
        tiktok: "#",
      },
      yandexMapsApiKey: "",
      showroomInfo: {
        title: "Где посмотреть",
        companyName: "Автохаус Белавто Центр",
        address: "г. Минск, ул. Большое Стиклево 83",
        phone: "+375 29 123-45-67",
        phone2: "",
        workingHours: {
          weekdays: "Пн-Пт: 9:00-21:00"
        }
      },
    },
    homepage: {
      heroTitle: "Найдите идеальный автомобиль с пробегом",
      heroSubtitle: "Более 500 проверенных автомобилей. Гарантия качества. Помощь в оформлении кредита.",
      heroBackgroundUrl: "/images/audi-hero.jpg",
      advantagesTitle: "Почему выбирают нас",
      ctaTitle: "Не нашли подходящий автомобиль?",
      ctaSubtitle: "Оставьте заявку, и мы подберем автомобиль специально для вас",
    },
    stories: {
      title: "Свежие поступления и новости",
      subtitle: "Следите за нашими обновлениями",
    },
  })

  const loadSettings = useCallback(async () => {
    try {
      const [mainDoc, homepageDoc, storiesDoc] = await Promise.all([
        getDoc(doc(db, "settings", "main")),
        getDoc(doc(db, "settings", "homepage")),
        getDoc(doc(db, "settings", "stories")),
      ])

      setSettings((prevSettings) => ({
        main: mainDoc.exists() ? mainDoc.data() : prevSettings.main,
        homepage: homepageDoc.exists() ? homepageDoc.data() : prevSettings.homepage,
        stories: storiesDoc.exists() ? storiesDoc.data() : prevSettings.stories,
      }))
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const saveSettings = async () => {
    setSaving(true)
    try {
      await Promise.all([
        setDoc(doc(db, "settings", "main"), settings.main),
        setDoc(doc(db, "settings", "homepage"), settings.homepage),
        setDoc(doc(db, "settings", "stories"), settings.stories),
      ])
      await cacheInvalidator.onUpdate('main')
      alert("Настройки сохранены!")
    } catch (error) {
      alert("Ошибка сохранения настроек")
    } finally {
      setSaving(false)
    }
  }

  const handlePurgeAllCache = async () => {
    if (!confirm('Вы уверены? Это очистит весь кэш сайта (Cloudflare + Vercel + Next.js ISR). Первые пользователи после очистки будут загружать данные из первоисточника.')) {
      return
    }

    setPurgingCache(true)
    try {
      const result = await purgeAllCache()

      if (result.success) {
        const details = result.details ? JSON.stringify(result.details, null, 2) : ''
        alert(`✅ Кэш успешно очищен!\n\nВсе страницы будут загружать свежие данные.\n\nДетали:\n${details}`)
      } else {
        // Показываем детальное сообщение об ошибке
        let errorMessage = result.error || 'Неизвестная ошибка'

        if (errorMessage.includes('API key не настроен')) {
          errorMessage += '\n\n📝 Инструкция:\n1. Откройте Vercel Dashboard\n2. Перейдите в Settings → Environment Variables\n3. Добавьте переменные:\n   - CACHE_INVALIDATION_API_KEY\n   - NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY\n4. Используйте любой случайный ключ (например: abc123xyz)\n5. Оба ключа должны быть одинаковыми'
        }

        alert(`❌ Ошибка очистки кэша:\n\n${errorMessage}`)
      }
    } catch (error) {
      alert(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    } finally {
      setPurgingCache(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Настройки сайта</h2>
        <div className="flex gap-2">
          <Button
            onClick={handlePurgeAllCache}
            disabled={purgingCache}
            variant="outline"
          >
            {purgingCache ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Сбросить весь кэш
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Сохранить все
          </Button>
        </div>
      </div>

      <Tabs defaultValue="main" className="w-full">
        <TabsList>
          <TabsTrigger value="main">Основные</TabsTrigger>
          <TabsTrigger value="homepage">Главная страница</TabsTrigger>
          <TabsTrigger value="stories">Новости</TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Название компании</Label>
                <Input
                  value={settings.main.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, companyName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Телефон 1</Label>
                  <Input
                    value={settings.main.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: { ...settings.main, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Телефон 2 (опционально)</Label>
                  <Input
                    value={settings.main.phone2}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: { ...settings.main, phone2: e.target.value },
                      })
                    }
                    placeholder="Второй номер телефона"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={settings.main.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, email: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Адрес</Label>
                <Input
                  value={settings.main.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, address: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Время работы</Label>
                <Input
                  value={settings.main.workingHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, workingHours: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>API ключ Яндекс.Карт</Label>
                <Input
                  type="password"
                  value={settings.main.yandexMapsApiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: { ...settings.main, yandexMapsApiKey: e.target.value },
                    })
                  }
                  placeholder="Введите API ключ Яндекс.Карт"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Социальные сети</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={settings.main.socialMedia.instagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, instagram: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Telegram</Label>
                  <Input
                    value={settings.main.socialMedia.telegram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, telegram: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>av.by</Label>
                  <Input
                    value={settings.main.socialMedia.avby}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, avby: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>TikTok</Label>
                  <Input
                    value={settings.main.socialMedia.tiktok}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          socialMedia: { ...settings.main.socialMedia, tiktok: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Информация об автосалоне (блок "Где посмотреть")</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок блока</Label>
                <Input
                  value={settings.main.showroomInfo.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: {
                        ...settings.main,
                        showroomInfo: { ...settings.main.showroomInfo, title: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Название автосалона</Label>
                <Input
                  value={settings.main.showroomInfo.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: {
                        ...settings.main,
                        showroomInfo: { ...settings.main.showroomInfo, companyName: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label>Адрес автосалона</Label>
                <Input
                  value={settings.main.showroomInfo.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      main: {
                        ...settings.main,
                        showroomInfo: { ...settings.main.showroomInfo, address: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Телефон автосалона 1</Label>
                  <Input
                    value={settings.main.showroomInfo.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          showroomInfo: { ...settings.main.showroomInfo, phone: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Телефон автосалона 2 (опционально)</Label>
                  <Input
                    value={settings.main.showroomInfo.phone2}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          showroomInfo: { ...settings.main.showroomInfo, phone2: e.target.value },
                        },
                      })
                    }
                    placeholder="Второй номер автосалона"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Время работы (будни)</Label>
                  <Input
                    value={settings.main.showroomInfo.workingHours.weekdays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          showroomInfo: {
                            ...settings.main.showroomInfo,
                            workingHours: {
                              ...settings.main.showroomInfo.workingHours,
                              weekdays: e.target.value
                            }
                          },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Время работы (выходные)</Label>
                  <Input
                    value={settings.main.showroomInfo.workingHours.weekends}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        main: {
                          ...settings.main,
                          showroomInfo: {
                            ...settings.main.showroomInfo,
                            workingHours: {
                              ...settings.main.showroomInfo.workingHours,
                              weekends: e.target.value
                            }
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Главный экран (Hero)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок</Label>
                <Input
                  value={settings.homepage.heroTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, heroTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Подзаголовок</Label>
                <Textarea
                  value={settings.homepage.heroSubtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, heroSubtitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>URL фонового изображения</Label>
                <Input
                  value={settings.homepage.heroBackgroundUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, heroBackgroundUrl: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Призыв к действию (CTA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок CTA</Label>
                <Input
                  value={settings.homepage.ctaTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, ctaTitle: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Подзаголовок CTA</Label>
                <Textarea
                  value={settings.homepage.ctaSubtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      homepage: { ...settings.homepage, ctaSubtitle: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Блок новостей</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Заголовок блока</Label>
                <Input
                  value={settings.stories.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stories: { ...settings.stories, title: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Подзаголовок</Label>
                <Input
                  value={settings.stories.subtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stories: { ...settings.stories, subtitle: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
