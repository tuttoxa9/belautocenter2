"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"

interface ReviewTextProps {
  text: string
  maxLength?: number
}

export default function ReviewText({ text, maxLength = 200 }: ReviewTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isLongText = useMemo(() => text.length > maxLength, [text, maxLength])

  const displayText = isLongText && !isExpanded ? `${text.substring(0, maxLength)}...` : text

  return (
    <div>
      <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
        {displayText}
      </p>
      {isLongText && (
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 h-auto p-0 mt-2 text-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Свернуть" : "Показать полностью"}
        </Button>
      )}
    </div>
  )
}