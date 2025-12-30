"use client"
import React from 'react'
import Header from '../components/Header'
import { useAppContext } from '../components/contexts';
import { useRouter } from 'next/navigation';
import { Search,ChevronRight } from 'lucide-react';

const Page = () => {

  const {user,isDarkMode,setIsDarkMode} =useAppContext()
    const router=useRouter();

   const themeClasses = {
    background: isDarkMode 
      ? "bg-gradient-to-br from-gray-900 via-black to-gray-800" 
      : "bg-gradient-to-br from-blue-50 via-white to-purple-50",
    card: isDarkMode 
      ? "bg-gray-800/40 backdrop-blur-lg border-gray-700/30" 
      : "bg-white/70 backdrop-blur-lg border-gray-200/30",
    text: {
      primary: isDarkMode ? "text-white" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-600",
      muted: isDarkMode ? "text-gray-400" : "text-gray-500"
    },
    button: {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white",
      secondary: isDarkMode 
        ? "bg-gray-700/50 hover:bg-gray-600/50 border-gray-600/30" 
        : "bg-gray-100/50 hover:bg-gray-200/50 border-gray-300/30"
    }
  };
  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.background}`}>
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
        <div className={`absolute top-1/3 -left-8 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 ${isDarkMode ? 'bg-blue-500' : 'bg-purple-400'}`}></div>
        <div className={`absolute bottom-10 right-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500 ${isDarkMode ? 'bg-pink-500' : 'bg-cyan-400'}`}></div>
      </div>
      <Header/>

      <section className="z-10 px-6 py-0">
              <div className="max-w-4xl mx-auto text-center">
                <div className={`p-12 rounded-3xl ${themeClasses.card} border shadow-2xl`}>
                  <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${themeClasses.text.primary}`}>
                    Ready to Find Your Lost Item?
                  </h2>
                  <p className={`text-xl mb-8 ${themeClasses.text.secondary}`}>
                    Join thousands of people who have successfully recovered their belongings with FINDR
                  </p>
                  <button  onClick={()=>router.push('/reportLost')}
                    className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-2xl ${themeClasses.button.primary} flex items-center justify-center mx-auto`}
                  >
                    <Search className="w-6 h-6 mr-3" />
                    Start Your Search
                    <ChevronRight className="w-6 h-6 ml-3" />
                  </button>
                </div>
              </div>
            </section>
            <section className="relative z-10 px-6 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                      <div className={`p-12 rounded-3xl ${themeClasses.card} border shadow-2xl`}>
                        <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${themeClasses.text.primary}`}>
                          Report An Lost Item?
                        </h2>
                        <p className={`text-xl mb-8 ${themeClasses.text.secondary}`}>
                          Help someone find their belongings with FINDR
                        </p>
                        <button onClick={()=>router.push('/foundLost')}
                          className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-2xl bg-gradient-to-r from-green-600 to-yellow-600 hover:from-green-700 hover:to-yellow-700 text-white flex items-center justify-center mx-auto`}
                        >
                          <Search className="w-6 h-6 mr-3" />
                          Report Search
                          <ChevronRight className="w-6 h-6 ml-3" />
                        </button>
                      </div>
                    </div>
                  </section>
    </div>
  )
}

export default Page