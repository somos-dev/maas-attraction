"use client"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useTransform } from "framer-motion"

const CLOUDS = [
  // [left, top, size, floatOffset]
  { left: '10%', top: '5%', size: 180, floatOffset: 600 },    // big top left
  { left: '60%', top: '3%', size: 160, floatOffset: 600 },  // big top right
  { left: '25%', top: '28%', size: 100, floatOffset: 600 }, // small lower left
  { left: '75%', top: '25%', size: 90, floatOffset: 600 },  // small lower right
]

export default function AnimatedIllustration() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const btlY = useMotionValue(0)
  const btrY = useMotionValue(0)
  const sllY = useMotionValue(0)
  const slrY = useMotionValue(0)

  const [time, setTime] = useState(0)
  useEffect(() => {
    let frame: number
    const animate = () => {
      setTime(performance.now())
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Boat float
  const floatY = useTransform(
    y,
    (v) => 4 * Math.sin((time + v) / 500)
  )
  const floatbtlY = useTransform(
    btlY,
    (v) => 2 * Math.sin((time + v) / 500)
  )
  const floatbtrY = useTransform(
    btrY,
    (v) => 3 * Math.sin((time + v) / 500)
  )
  const floatsllY = useTransform(
    sllY,
    (v) => 2 * Math.sin((time + v) / 500)
  )
  const floatslrY = useTransform(
    slrY,
    (v) => 3 * Math.sin((time + v) / 500)
  )

  // Cloud float (returns array of y values)
  const cloudYs = CLOUDS.map((cloud, i) =>
    4 * Math.sin((time + cloud.floatOffset) / 500)
  )

  const allCloudYs = [
    floatbtlY,
    floatbtrY,
    floatsllY,
    floatslrY,
  ]

  return (
    <div className="w-full max-w-4xl min-h-full mx-auto overflow-hidden ">
      {/* sky overlay: moving cloud pattern */}

      {/* Animated clouds */}
      {CLOUDS.map((cloud, i) => (
        <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          key={i}
          style={{
            position: 'absolute',
            left: cloud.left,
            top: cloud.top,
            y: allCloudYs[i],
            zIndex: 3,
          }}
          className="cursor-grab"
        >
          <Image
            src="/images/cloud-pattern.png"
            alt="Cloud"
            width={cloud.size}
            height={cloud.size / 2}
            draggable={false}
            priority
          />
        </motion.div>
      ))}


      {/* draggable boat */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        style={{ 
          x, 
          y: floatY, 
          left: '25%', 
          zIndex: 3 
        }}
        className="absolute bottom-3 cursor-grab"
      >
        <Image
          src="/images/boat.png"
          alt="Boat"
          width={350}
          height={100}
          draggable={false}
        />
      </motion.div>
    </div>
  )
}
