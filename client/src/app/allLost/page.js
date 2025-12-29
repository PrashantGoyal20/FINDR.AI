"use client"
import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Calendar, Eye, Trash2, Edit, Sun, Moon, Plus, Clock, AlertCircle, CheckCircle, XCircle, Package, PlusIcon } from 'lucide-react';
import Header from '../components/Header';
import { useAppContext } from '../components/contexts';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const page = () => {
  const router=useRouter();
  const {isDarkMode, setIsDarkMode} = useAppContext()
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [sortBy, setSortBy] = useState('recent'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [lostItems, setLostItems] = useState([])
  

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
    input: isDarkMode
      ? "bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400 focus:ring-purple-400 focus:border-purple-400"
      : "bg-white/50 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:ring-blue-400 focus:border-blue-400",
    button: {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white",
      secondary: isDarkMode
        ? "bg-gray-700/50 hover:bg-gray-600/50 border-gray-600/30"
        : "bg-gray-100/50 hover:bg-gray-200/50 border-gray-300/30"
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-blue-500', text: 'Active', icon: Clock },
      found: { color: 'bg-green-500', text: 'Found', icon: CheckCircle }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${badge.color} text-white text-sm font-medium`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </div>
    );
  };

  useEffect(()=>{
    const fetchLostItems = async () => {
      await axios.get('/api/allLostItems',{withCredentials: true}).then((res)=>{
        setLostItems(res.data.lostItems);
      })
    }
    fetchLostItems();
  },[])


 
  const stats = {
    total: lostItems.length==0?'0':lostItems.length,
    active: lostItems.length==0?'0':lostItems.filter(i => i.status === 'active').length,
    found: lostItems.length==0?'0':lostItems.filter(i => i.status === 'found').length,
    totalMatches: lostItems.reduce((sum, item) => sum + item.matches, 0)
  };

  const handleDelete = (itemId) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setLostItems(items => items.filter(item => item.id !== itemId));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
    <Header/>
      <div className={`min-h-screen transition-all duration-500 ${themeClasses.background}`}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-4 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
          <div className={`absolute -bottom-8 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 ${isDarkMode ? 'bg-blue-500' : 'bg-purple-400'}`}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${themeClasses.text.primary} mb-2`}>
                My Lost Items
              </h1>
              <p className={`text-sm sm:text-base ${themeClasses.text.secondary}`}>
                Track and manage all your reported lost items
              </p>
            </div>

            <div className="flex items-center space-x-3">
              

              <button onClick={()=>router.push('/reportLost')} className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${themeClasses.button.primary} flex items-center text-sm sm:text-base`}>
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Report New Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            

            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl ${themeClasses.card}`}>
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${themeClasses.text.primary}`}>{stats.active}</div>
              <div className={`text-xs sm:text-sm ${themeClasses.text.secondary}`}>Active</div>
            </div>

            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl ${themeClasses.card}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              </div>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${themeClasses.text.primary}`}>{stats.found}</div>
              <div className={`text-xs sm:text-sm ${themeClasses.text.secondary}`}>Found</div>
            </div>

          </div>

          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl mb-6 sm:mb-8 ${themeClasses.card}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.text.muted}`} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 text-sm sm:text-base ${themeClasses.input}`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="found">Found</option>
                </select>
              </div>
            </div>

          </div>

          {lostItems.length === 0 ? (
            <div className={`p-12 sm:p-20 rounded-3xl border shadow-xl text-center ${themeClasses.card}`}>
              <AlertCircle className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${themeClasses.text.muted}`} />
              <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${themeClasses.text.primary}`}>
                No Items Found
              </h3>
              <p className={`${themeClasses.text.secondary} mb-6`}>
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t reported any lost items yet'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <button className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${themeClasses.button.primary}`}>
                  <Plus className="w-5 h-5 inline mr-2" />
                  Report Your First Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {lostItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xl transition-all duration-300 hover:scale-[1.02] ${themeClasses.card}`}
                >
                 
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg sm:text-xl font-bold ${themeClasses.text.primary}`}>
                          {item.name}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getStatusBadge(item.status)}
                        <span className={`text-xs sm:text-sm ${themeClasses.text.muted}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-2">
                      <button className={`p-2 rounded-lg transition-all duration-300 border ${themeClasses.button.secondary}`}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg transition-all duration-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-2">
                      {item.image_url.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <img
                            src={img}
                            alt={`${item.name} ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {idx === 2 && item.images.length > 3 && (
                            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">+{item.images.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className={`text-sm mb-4 line-clamp-2 ${themeClasses.text.secondary}`}>
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                      <MapPin className={`w-4 h-4 mr-2 flex-shrink-0 ${themeClasses.text.muted}`} />
                      <span className={`text-sm ${themeClasses.text.secondary}`}>{item.lastSeenLocation}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className={`w-4 h-4 mr-2 flex-shrink-0 ${themeClasses.text.muted}`} />
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        Lost on {new Date(item.dateTimeLost).toLocaleDateString()} • Posted {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <PlusIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${themeClasses.text.muted}`} />
                      <span className={`text-sm ${themeClasses.text.secondary}`}>{item.additionalNotes}</span>
                    </div>
                  </div>

                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                   

                    <button onClick={()=>router.push(`/lostMatches/${item.id}`)} className={`px-4 py-2 flex items-center rounded-lg font-medium text-sm transition-all duration-300 ${themeClasses.button.primary}`}>
                      
                        <Search className={`w-4 h-4 mr-1 ${themeClasses.text.muted}`} />View Matches
                    </button>
                  </div>

                  {item.reward && item.reward !== 'No reward' && (
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-yellow-500 text-xs font-semibold">🏆 Reward: {item.reward}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;