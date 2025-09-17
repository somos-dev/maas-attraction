import React from 'react'
import { Navbar } from './_components/navbar'
import { Footer } from './_components/footer'

const MarketingLayout = ({
    children
} : {
    children:React.ReactNode
}) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        {/* Navbar */}
        <Navbar/>
        <main className='relative min-h-screen pt-16'>
        {children}
        </main>
        {/* Footer */}
        <Footer/>
    </div>
  )
}

export default MarketingLayout