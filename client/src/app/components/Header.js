"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from './contexts'
import { Search, Camera, MapPin, Clock, Shield, Zap, Users, ChevronRight, Sun, Moon, Star, CheckCircle, ArrowRight,Menu } from 'lucide-react'


const Header = () => {

  const menuRef = useRef()
  const [menu, setMenu] = useState(false)
  const { user,isDarkMode, setIsDarkMode } = useAppContext()
  console.log(user)
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

  const handleToggle = () => {
    if (menu) {
      menuRef.current.classList.remove('hidden')
    }
    else {
      menuRef.current.classList.add('hidden')
    }
    setMenu(!menu)
  }


  return (
    <>
      <header class={`relative ${themeClasses.background}  z-10 px-4 sm:px-6 py-4 sm:py-4`}>
        <nav class="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <a href={user ? "/dashboard" : "/"} >
          <div class="flex items-center space-x-2 sm:space-x-3" >
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">

              <svg class="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"></path>
              </svg>
            </div>
            <div>
              <span class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                FINDR.AI
              </span>
              <p class="text-xs sm:text-sm text-white/70 hidden sm:block">AI-Powered Lost & Found</p>
            </div>
          </div>
          </a>

          <div class="hidden md:flex items-center space-x-6 lg:space-x-8" >
          {user?<>
            <a href="/allLost" class="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
              My Lost Items
            </a>
            <a href="/allReported" class="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
              Reported Items
            </a>
            <a href="#reviews" class="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
              Logout
            </a>
          </>:<><a href="#features" class="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
              Features
            </a>
            <a href="#how-it-works" class="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
              How It Works
            </a>
            <a href="#reviews" class="text-white/80 hover:text-white transition-colors text-sm lg:text-base">
              Reviews
            </a></>}
            
          </div>

          <div class="flex items-center space-x-2 sm:space-x-4">
            <button id="mobileMenuBtn" class="md:hidden p-2 rounded-xl transition-all duration-300 hover:bg-white/10" onClick={handleToggle}>

              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition-all duration-300 ${themeClasses.card} border cursor-pointer`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </nav>

        <div id="mobileMenu" class="md:border-t border-white/20 hidden" ref={menuRef} >
          <nav class="px-4 sm:px-6 py-3">
            <div class="flex flex-col space-y-3">
              {user?<>
                <a href="/allLost" class="text-white/80 hover:text-white transition-colors py-2 border-b border-white/20" onClick={handleToggle}>
                My Lost Items
              </a>
              <a href="/allReported" class="text-white/80 hover:text-white transition-colors py-2 border-b border-white/20" onClick={handleToggle}>
                Reported Items
              </a>
              <a href="#reviews" class="text-white/80 hover:text-white transition-colors py-2" onClick={handleToggle}>
                Reviews
              </a>
              </>:<><a href="#features" class="text-white/80 hover:text-white transition-colors py-2 border-b border-white/20" onClick={handleToggle}>
                Features
              </a>
              <a href="#how-it-works" class="text-white/80 hover:text-white transition-colors py-2 border-b border-white/20" onClick={handleToggle}>
                How It Works
              </a>
              <a href="#reviews" class="text-white/80 hover:text-white transition-colors py-2" onClick={handleToggle}>
                Reviews
              </a></>}
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}

export default Header