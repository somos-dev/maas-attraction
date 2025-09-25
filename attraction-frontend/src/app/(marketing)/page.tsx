'use client'
import { Medal, ArrowRight, Play, Users, Route, Leaf, Globe, Zap, Shield, Smartphone, BarChart3, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import localFont from 'next/font/local'
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";
import useLocales from '@/hooks/useLocales';




const MarketingPage = () => {
  const { translate, currentLang, onChangeLang } = useLocales();
  
  return (
    <div className="relative">
      {/* Language Switch Button */}
      <div className="fixed top-20 right-4 flex items-center space-x-2 z-40">
        <button 
          onClick={() => onChangeLang('en')} 
          className={`border p-2 rounded-lg text-sm cursor-pointer transition-all duration-300 ${
            currentLang.value === 'en' 
              ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
              : 'bg-white/80 backdrop-blur-sm hover:bg-gray-50 border-gray-200'
          }`}
        >
          {String(translate('language.engShort'))}
        </button>
        <button 
          onClick={() => onChangeLang('it')} 
          className={`border p-2 rounded-lg text-sm cursor-pointer transition-all duration-300 ${
            currentLang.value === 'it' 
              ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
              : 'bg-white/80 backdrop-blur-sm hover:bg-gray-50 border-gray-200'
          }`}
        >
          {String(translate('language.itaShort'))}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Logo and Badge */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 mt-3 relative">
              <Image
                src="/images/Official-logos/UI-detailed/logo-png.png"
                alt="Attraction Logo"
                width={120}
                height={120}
                className="drop-shadow-2xl"
              />
            </div>
            <div className="font-description inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-medium text-sm border border-amber-200 shadow-lg">
              <Medal className="h-4 w-4 mr-2" />
              {String(translate('marketing.flexibleMobilityManagement'))}
            </div>
          </div>

          {/* Main Heading */}
          <div className={cn("space-y-6")}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
              {String(translate('marketing.heroTitle'))}
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {String(translate('marketing.heroSubtitle'))}
              </span>
            </h1>
          </div>

          <div className={cn("max-w-3xl mx-auto mt-8")}>
            <p className="text-xl text-gray-600 leading-relaxed">
              {String(translate('marketing.heroDescription'))}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Button 
              size="lg" 
              asChild 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Link href='/auth/signup' className="flex items-center">
                {String(translate('marketing.getStarted'))}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              {String(translate('marketing.watchDemo'))}
            </Button>
          </div>

          {/* Trust Indicator */}
          <div className="mt-16">
            <p className="text-sm text-gray-500 mb-8">
              {String(translate('marketing.trustedBy'))}
            </p>
              {/* Add company logos here */}
            {/* <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={cn("text-3xl lg:text-4xl font-bold text-gray-900 mb-4")}>
              {String(translate('marketing.stats.title'))}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">{String(translate('marketing.stats.users'))}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">2M+</div>
              <div className="text-gray-600">{String(translate('marketing.stats.routes'))}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">15K</div>
              <div className="text-gray-600">{String(translate('marketing.stats.co2Saved'))}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-indigo-600 mb-2">200+</div>
              <div className="text-gray-600">{String(translate('marketing.stats.cities'))}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={cn("text-3xl lg:text-4xl font-bold text-gray-900 mb-4")}>
              {String(translate('marketing.features.title'))}
            </h2>
            <p className={cn("text-xl text-gray-600 max-w-3xl mx-auto")}>
              {String(translate('marketing.features.subtitle'))}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {String(translate('marketing.features.smartPlanning.title'))}
              </h3>
              <p className="text-gray-600">
                {String(translate('marketing.features.smartPlanning.description'))}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {String(translate('marketing.features.realTimeUpdates.title'))}
              </h3>
              <p className="text-gray-600">
                {String(translate('marketing.features.realTimeUpdates.description'))}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Route className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {String(translate('marketing.features.multiModal.title'))}
              </h3>
              <p className="text-gray-600">
                {String(translate('marketing.features.multiModal.description'))}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {String(translate('marketing.features.carbonFootprint.title'))}
              </h3>
              <p className="text-gray-600">
                {String(translate('marketing.features.carbonFootprint.description'))}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {String(translate('marketing.features.offlineAccess.title'))}
              </h3>
              <p className="text-gray-600">
                {String(translate('marketing.features.offlineAccess.description'))}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {String(translate('marketing.features.teamCollaboration.title'))}
              </h3>
              <p className="text-gray-600">
                {String(translate('marketing.features.teamCollaboration.description'))}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className={cn("text-3xl lg:text-5xl font-bold text-white mb-6")}>
            {String(translate('marketing.cta.title'))}
          </h2>
          <p className={cn("text-xl text-blue-100 mb-10")}>
            {String(translate('marketing.cta.subtitle'))}
          </p>
          <Button 
            size="lg" 
            asChild 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href='/auth/signup' className="flex items-center">
              {String(translate('marketing.cta.button'))}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
