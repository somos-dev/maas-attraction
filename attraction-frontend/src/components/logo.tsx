import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils'
import localFont from 'next/font/local';

type Props = {}

const headingFont = localFont({
    src: "../../public/fonts/font.woff2"
  })

const logo = (props: Props) => {
  return (
    <Link href='/'>
      <div className="hover:opacity-70 transition items-center gap-x-2 md:flex">
            <Image
            src="/images/Official-logos/UI-detailed/logo-with-name-png.png"
            alt='Logo'
            width={170}
            height={40}
            priority
            />
        {/* <p className={cn("text-xl text-neutral-700 mt-2", headingFont.className)}>Attraction</p> */}
        </div>
    </Link>
  )
}

export default logo