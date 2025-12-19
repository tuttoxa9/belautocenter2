"use client"

import { useSnow } from "@/components/providers/snow-provider"
import Snowfall from "@/components/snowfall"

export const SnowfallWrapper = () => {
  const { isSnowing } = useSnow()
  return isSnowing ? <Snowfall /> : null
}
