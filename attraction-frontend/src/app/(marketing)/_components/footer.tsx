'use client'
import Logo from '@/components/logo'
import { Button } from '@/components/ui/button'
import React from 'react'
import useLocales from '@/hooks/useLocales'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import Image from 'next/image'

export const Footer = () => {
  const { translate } = useLocales();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-400 text-sm">
              Transforming mobility for a better tomorrow. Connect, plan, and travel smarter with our innovative platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#api" className="text-gray-400 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#careers" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#news" className="text-gray-400 hover:text-white transition-colors">News</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                  {String(translate('marketing.privacyPolicy'))}
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                  {String(translate('marketing.termsOfService'))}
                </a>
              </li>
              <li><a href="#cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#gdpr" className="text-gray-400 hover:text-white transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg border-t border-gray-800 mt-12 p-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-black text-sm">
              © 2025 Attraction. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
              <Image
                src="/images/Official-logos/ATTRACTION_IDENTITY_DEF/3.png"
                alt='Logo'
                className="object-contain mx-4"
                width={120}
                height={40}
                priority
              />
                <div className="sm:h-8 sm:border-l border-gray-700" />
              <Image
                src="/images/Official-logos/ATTRACTION_IDENTITY_DEF/4-removebg-preview.png"
                alt='Logo'
                className="object-contain mx-4"
                width={120}
                height={40}
                priority
              />
                <div className="sm:h-8 sm:border-l border-gray-700" />
              <Image
                src="/images/Official-logos/ATTRACTION_IDENTITY_DEF/5-removebg-preview.png"
                alt='Logo'
                className="object-contain mx-4"
                width={100}
                height={40}
                priority
              />
                <div className="sm:h-8 sm:border-l border-gray-700" />
              <Image
                src="/images/Official-logos/ATTRACTION_IDENTITY_DEF/6-removebg-preview-2.png"
                alt='Logo'
                className="object-contain mx-4"
                width={105}
                height={40}
                priority
              />
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
    </footer>
  )
}

