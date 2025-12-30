"use client"
import React, { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Calendar, Clock, Eye, Share2, Flag, Heart, MessageCircle, Phone, Mail, Sun, Moon, ChevronLeft, ChevronRight, X, CheckCircle, User, Package, DollarSign, AlertTriangle } from 'lucide-react';
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { useAppContext } from '../../components/contexts'
import Loader from '@/app/components/Loader';

const Page = () => {
  const [item,setItem]=useState([])
  const [loading,setLoading]=useState(true)
  const {isDarkMode, setIsDarkMode} = useAppContext()
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const {id}=useParams()
  const router=useRouter();

  useEffect(()=>{
    const fetchData=async()=>{
      setLoading(true)
      await axios.get(`/api/lostMatchDetail/${id}`,{withCredentials:true}).then((res)=>{
        setItem(res.data.foundItems[0])
      })
      .catch((err)=>[
        console.log(err)
      ]).finally(()=>{
        setLoading(false)
      })
    }
    fetchData()
  },[])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Your Found Item Match",
          text: "Check out this item that matches your founded item on Findr!",
          url: window.location.href,
        });
        console.log("Shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing not supported on this device.");
    }
  };

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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

   const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <>{loading ?<Loader/>:<div className={`min-h-screen transition-all duration-500 ${themeClasses.background}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-8 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 ${isDarkMode ? 'bg-blue-500' : 'bg-purple-400'}`}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button onClick={()=>router.push('/allReported')} className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}>
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Results</span>
          </button>

          <div className="flex items-center space-x-3">
            
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden ${themeClasses.card}`}>
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={item.image_url}
                  alt={`${item.name} ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                />
                
                {item.image_url.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm">
                  {currentImageIndex + 1} / {item.image_url.length}
                </div>

                <div className="absolute top-4 left-4 px-4 py-2 bg-blue-500 rounded-full text-white text-sm font-semibold flex items-center shadow-lg">
                  <Clock className="w-4 h-4 mr-2" />
                  {item.status}
                </div>
              </div>

              {item.image_url.length > 1 && (
                <div className="p-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {item.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        idx === currentImageIndex
                          ? 'border-purple-500 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-2xl ${themeClasses.card}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${themeClasses.text.primary}`}>
                    {item.name}
                  </h1>
                 
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                

                <button onClick={handleShare} className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}>
                  <Share2 className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </button>


                <button 
                  onClick={() => setShowContactModal(true)}
                  className={`flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${themeClasses.button.primary}`}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Contact</span>
                </button>
              </div>

              {item.reward && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                  <div className="flex items-center">
                    <DollarSign className="w-6 h-6 text-yellow-500 mr-3" />
                    <div>
                      <div className="font-bold text-yellow-500 text-lg">{item.reward} Reward Offered</div>
                      <div className={`text-sm ${themeClasses.text.secondary}`}>For safe return of this item</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-3 ${themeClasses.text.primary}`}>Description</h2>
                <p className={`leading-relaxed mb-4 ${themeClasses.text.secondary}`}>
                  {item.description}
                </p>
                <p className={`leading-relaxed ${themeClasses.text.secondary}`}>
                  {item.detailedDescription}
                </p>
              </div>

              {item.additional_notes? <>Key Features
              <div className="mb-6">
                <h2 className={`text-xl font-bold mb-3 ${themeClasses.text.primary}`}>Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.additional_notes?.split('\n').map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className={themeClasses.text.secondary}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div></>:<></>}

              <div className="space-y-4">
                <h2 className={`text-xl font-bold ${themeClasses.text.primary}`}>Location & Time Details</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`} />
                    <div>
                      <div className={`font-medium ${themeClasses.text.primary}`}>Last Seen Location</div>
                      <div className={themeClasses.text.secondary}>{item.location}</div>
                      <div className={`text-sm ${themeClasses.text.muted}`}>{item.found_near}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`} />
                    <div>
                      <div className={`font-medium ${themeClasses.text.primary}`}>Date & Time Lost</div>
                      <div className={themeClasses.text.secondary}>{formatDate(item.date_lost)}</div>
                      <div className={`text-sm ${themeClasses.text.muted}`}>{getTimeSince(item.date_lost)}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`} />
                    <div>
                      <div className={`font-medium ${themeClasses.text.primary}`}>Posted</div>
                      <div className={themeClasses.text.secondary}>{formatDate(item.created_at)}</div>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className={`p-6 rounded-2xl sm:rounded-3xl border shadow-2xl ${themeClasses.card}`}>
              <h2 className={`text-xl font-bold mb-4 ${themeClasses.text.primary}`}>Posted By</h2>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {item.name.charAt(0)}
                </div>
                
              </div>

              <button 
                onClick={() => setShowContactModal(true)}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${themeClasses.button.primary}`}
              >
                Contact Owner
              </button>
            </div>

          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`max-w-md w-full p-6 sm:p-8 rounded-3xl border shadow-2xl ${themeClasses.card} animate-scale-in`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${themeClasses.text.primary}`}>Contact Owner</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className={`p-2 rounded-xl transition-all duration-300 hover:bg-gray-700/30`}
              >
                <X className={`w-6 h-6 ${themeClasses.text.primary}`} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center p-4 rounded-xl bg-gray-700/30">
                <Mail className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <div className={`text-sm ${themeClasses.text.muted}`}>Email</div>
                  <div className={`font-medium ${themeClasses.text.primary}`}>{item.email}</div>
                </div>
              </div>

              <div className="flex items-center p-4 rounded-xl bg-gray-700/30">
                <Phone className={`w-5 h-5 mr-3 ${isDarkMode ? 'text-purple-400' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <div className={`text-sm ${themeClasses.text.muted}`}>Phone</div>
                  <div className={`font-medium ${themeClasses.text.primary}`}>{item.phone}</div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6`}>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                ⚠️ For your safety, meet in public places and verify the item before exchange
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className={`py-3 rounded-xl font-semibold transition-all duration-300 border ${themeClasses.button.secondary} ${themeClasses.text.primary}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <img
            src={item.image_url[currentImageIndex]}
            alt={item.description}
            className="max-w-full max-h-full object-contain"
          />

          {item.image_url.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>}</>
    


  )
}

export default Page