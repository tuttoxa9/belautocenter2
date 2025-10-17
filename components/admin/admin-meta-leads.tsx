"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Phone, Mail, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminMetaLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      const leadsQuery = query(collection(db, "metaLeads"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(leadsQuery)
      const leadsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString(),
      }))
      setLeads(leadsData)
    } catch (error) {
      console.error("Error loading leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestLead = async () => {
    setIsSendingTest(true)
    try {
      const response = await fetch('/api/test-meta-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Успешно",
          description: "Тестовый лид отправлен в Telegram",
          variant: "default",
        })
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось отправить тестовый лид",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке тестового лида",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Лиды из Meta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-600">Загрузка...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-gray-900">Лиды из Meta (Facebook/Instagram)</CardTitle>
          <Button
            onClick={sendTestLead}
            disabled={isSendingTest}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isSendingTest ? 'Отправка...' : 'Отправить тестовый лид'}
          </Button>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              Нет лидов из Meta. Настройте webhook в Meta Business Suite.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-gray-700">Дата</TableHead>
                    <TableHead className="text-gray-700">Имя</TableHead>
                    <TableHead className="text-gray-700">Телефон</TableHead>
                    <TableHead className="text-gray-700">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: any) => (
                    <TableRow key={lead.id} className="bg-white hover:bg-gray-50">
                      <TableCell className="text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(lead.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{lead.name || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{lead.phone || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{lead.email || '-'}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
