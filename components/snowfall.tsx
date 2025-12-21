"use client"

import React, { useRef, useEffect } from "react"

// --- Animation Constants ---
const SNOWFLAKE_DENSITY_DIVISOR = 10000 // Lower number = more snowflakes
const MIN_RADIUS = 0.5
const MAX_RADIUS = 2.5
const BASE_SPEED_MULTIPLIER = 5.0 // Higher number = faster snowflakes
const SWAY_FREQUENCY = 50 // Lower number = more frequent sway
const SWAY_AMPLITUDE = 0.5 // Higher number = wider sway

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let snowflakes: {
      x: number
      y: number
      radius: number
      speed: number
    }[] = []

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const snowflakeCount = Math.floor(
        (canvas.width * canvas.height) / SNOWFLAKE_DENSITY_DIVISOR
      )
      snowflakes = []
      for (let i = 0; i < snowflakeCount; i++) {
        const radius = Math.random() * MAX_RADIUS + MIN_RADIUS
        snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: radius,
          speed: (1 / (radius + 1)) * BASE_SPEED_MULTIPLIER, // Smaller radius = higher speed
        })
      }
    }

    const draw = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.beginPath()
      for (const flake of snowflakes) {
        ctx.moveTo(flake.x, flake.y)
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2, true)
      }
      ctx.fill()
      update()
    }

    const update = () => {
      for (const flake of snowflakes) {
        // Update position
        flake.y += flake.speed
        // Add a slight horizontal sway
        flake.x += Math.sin(flake.y / SWAY_FREQUENCY) * SWAY_AMPLITUDE

        // If snowflake reaches the bottom, reset it to the top
        if (flake.y > canvas.height) {
          flake.y = -10
          flake.x = Math.random() * canvas.width
        }
      }
    }

    const animate = () => {
      draw()
      animationFrameId.current = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas() // Initial setup
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  const [opacity, setOpacity] = React.useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 100) // Small delay for transition to trigger
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: opacity,
        transition: "opacity 2s ease-in-out",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}

export default Snowfall
