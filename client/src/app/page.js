"use client";
import React,{useState} from "react";
import { Search, Camera, MapPin, Clock, Shield, Zap, Users, ChevronRight, Sun, Moon,Star, CheckCircle, ArrowRight } from 'lucide-react'
import Header from "./components/Header.js";
import { useAppContext } from "./components/contexts.js";
import { useRouter } from "next/navigation";

const Page=()=> {
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

  return(
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.background}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -right-4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
        <div className={`absolute top-1/3 -left-8 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 ${isDarkMode ? 'bg-blue-500' : 'bg-purple-400'}`}></div>
        <div className={`absolute bottom-10 right-1/3 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500 ${isDarkMode ? 'bg-pink-500' : 'bg-cyan-400'}`}></div>
      </div>

      <Header/>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${themeClasses.card} border mb-8`}>
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>AI-Powered Lost & Found</span>
            </div>
          </div>
          
          <h1 className={`text-6xl md:text-7xl font-bold mb-8 leading-tight`}>
            <span className={`bg-gradient-to-r ${isDarkMode ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'} bg-clip-text text-transparent`}>
              Lost Something?
            </span>
            <br />
            <span className={`bg-gradient-to-r ${isDarkMode ? 'from-purple-400 to-blue-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
              We&apos;ll Find It
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${themeClasses.text.secondary}`}>
            Upload a photo of your lost item and let our advanced AI match it with found items from locations across the city. Get reunited with your belongings faster than ever.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={()=>router.push('/login')}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-2xl ${themeClasses.button.primary} flex items-center justify-center`}
            >
              <Camera className="w-5 h-5 mr-3" />
              Find My Item Now
              <ArrowRight className="w-5 h-5 ml-3" />
            </button>
            <button className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}>
              Watch Demo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`}>10K+</div>
              <div className={themeClasses.text.secondary}>Items Recovered</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-purple-600'}`}>95%</div>
              <div className={themeClasses.text.secondary}>Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>24/7</div>
              <div className={themeClasses.text.secondary}>AI Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${themeClasses.text.primary}`}>
              Why Choose FINDR?
            </h2>
            <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto`}>
              Advanced technology meets human care to reunite you with your lost belongings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-2xl ${themeClasses.card} border shadow-xl hover:scale-105 transition-all duration-300`}>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>AI Visual Recognition</h3>
              <p className={themeClasses.text.secondary}>
                Our advanced computer vision AI analyzes your photo and matches it with found items with 95% accuracy
              </p>
            </div>

            <div className={`p-8 rounded-2xl ${themeClasses.card} border shadow-xl hover:scale-105 transition-all duration-300`}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>Location Network</h3>
              <p className={themeClasses.text.secondary}>
                Connected with hundreds of locations including parks, cafes, hotels, and transport hubs across the city
              </p>
            </div>

            <div className={`p-8 rounded-2xl ${themeClasses.card} border shadow-xl hover:scale-105 transition-all duration-300`}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>Secure & Private</h3>
              <p className={themeClasses.text.secondary}>
                Your data is encrypted and secure. We only share necessary contact information when a match is found
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${themeClasses.text.primary}`}>
              How It Works
            </h2>
            <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto`}>
              Three simple steps to get reunited with your lost items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-purple-500'} flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold`}>
                1
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>Upload Photo</h3>
              <p className={themeClasses.text.secondary}>
                Take a clear photo of your lost item and add a brief description with key details
              </p>
            </div>

            <div className="text-center">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-blue-500 to-cyan-500' : 'from-cyan-500 to-blue-500'} flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold`}>
                2
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>AI Analysis</h3>
              <p className={themeClasses.text.secondary}>
                Our AI instantly searches through thousands of found items across our partner network
              </p>
            </div>

            <div className="text-center">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${isDarkMode ? 'from-green-500 to-emerald-500' : 'from-emerald-500 to-green-500'} flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold`}>
                3
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>Get Connected</h3>
              <p className={themeClasses.text.secondary}>
                Receive instant notifications when matches are found with location and contact details
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${themeClasses.text.primary}`}>
              Success Stories
            </h2>
            <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto`}>
              Real people, real recoveries, real relief
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className={`p-6 rounded-2xl ${themeClasses.card} border shadow-xl`}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`mb-4 ${themeClasses.text.secondary}`}>
                &quot;Lost my wedding ring at the park. FINDR found it within 2 hours! The AI matched it perfectly with the park&apos;s lost & found database.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <div className={`font-semibold ${themeClasses.text.primary}`}>Sarah Chen</div>
                  <div className={`text-sm ${themeClasses.text.muted}`}>Recovered: Wedding Ring</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${themeClasses.card} border shadow-xl`}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`mb-4 ${themeClasses.text.secondary}`}>
                &quot;My laptop was stolen and somehow ended up at a coffee shop. FINDR&apos;s network helped me track it down. Amazing service!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <div className={`font-semibold ${themeClasses.text.primary}`}>Mike Rodriguez</div>
                  <div className={`text-sm ${themeClasses.text.muted}`}>Recovered: MacBook Pro</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl ${themeClasses.card} border shadow-xl`}>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`mb-4 ${themeClasses.text.secondary}`}>
                &quot;Left my keys at a restaurant. The AI matched them instantly and I had them back the same day. This app is a lifesaver!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  A
                </div>
                <div>
                  <div className={`font-semibold ${themeClasses.text.primary}`}>Amanda Foster</div>
                  <div className={`text-sm ${themeClasses.text.muted}`}>Recovered: House Keys</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-12 rounded-3xl ${themeClasses.card} border shadow-2xl`}>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${themeClasses.text.primary}`}>
              Ready to Find Your Lost Item?
            </h2>
            <p className={`text-xl mb-8 ${themeClasses.text.secondary}`}>
              Join thousands of people who have successfully recovered their belongings with FINDR
            </p>
            <button
              className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-2xl ${themeClasses.button.primary} flex items-center justify-center mx-auto`}
            >
              <Search className="w-6 h-6 mr-3" />
              Start Your Search
              <ChevronRight className="w-6 h-6 ml-3" />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 py-12 border-t border-gray-700/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${isDarkMode ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-purple-500'} flex items-center justify-center`}>
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-purple-300 to-blue-300' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
              FINDR
            </span>
          </div>
          <p className={`${themeClasses.text.muted} mb-4`}>
            Reuniting people with their lost belongings through AI-powered matching
          </p>
          <p className={`${themeClasses.text.muted} text-sm`}>
            © 2025 FINDR. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );

}

export default Page;