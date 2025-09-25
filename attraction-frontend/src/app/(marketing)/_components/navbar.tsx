'use client'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import useLocales from '@/hooks/useLocales'

export const Navbar = () => {
  const { translate } = useLocales();
  
  return (
    <div className='fixed top-0 w-full h-16 px-4 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm flex items-center z-50'>
        <div className='md:max-w-7xl mx-auto w-full flex items-center justify-between'>
            <span className='hidden md:flex'>
                <Logo/>
            </span>
            <div className='hidden md:flex items-center space-x-8'>
                <Link href="#features" className='aadhunik text-gray-600 hover:text-gray-900 transition-colors'>
                    Features
                </Link>
                <Link href="#about" className='aadhunik text-gray-600 hover:text-gray-900 transition-colors'>
                    About
                </Link>
                <Link href="#contact" className='aadhunik text-gray-600 hover:text-gray-900 transition-colors'>
                    Contact
                </Link>
            </div>
            <div className='aadhunik flex items-center space-x-3'>
                <Button size='sm' variant='ghost' asChild className='font-semibold hidden sm:inline-flex'>
                    <Link href='/auth/signin'>
                        {String(translate('marketing.login'))}
                    </Link>
                </Button>
                <Button size='sm' asChild className='font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300'>
                    <Link href='/auth/signup'>
                        {String(translate('marketing.getAttractionForFree'))}
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  )
}

