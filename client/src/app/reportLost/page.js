"use client"
import React, { useState, useRef } from 'react';
import { Camera, Upload, MapPin, Calendar, Clock, Tag, User, Mail, Phone, ArrowLeft, CheckCircle, AlertCircle, X, Sun, Moon } from 'lucide-react';
import Header from '../components/Header';
import { useAppContext } from '../components/contexts';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

const Page = () => {
  const { user, isDarkMode, setIsDarkMode } = useAppContext();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const router = useRouter()
  const [formData, setFormData] = useState({
    description: '',
    lastSeenLocation: '',
    dateTimeLost: '',
    name: '',
    email: '',
    phone: '',
    reward: '',
    additionalNotes: ''
  });

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
    },
    uploadArea: {
      default: isDarkMode
        ? "border-gray-600 hover:border-purple-400 hover:bg-purple-400/5"
        : "border-gray-300 hover:border-blue-400 hover:bg-blue-400/5",
      dragOver: isDarkMode
        ? "border-purple-400 bg-purple-400/10"
        : "border-blue-400 bg-blue-400/10",
      uploaded: isDarkMode
        ? "border-green-400 bg-green-400/10"
        : "border-green-500 bg-green-500/10"
    }
  };

  const handleFileUpload = (files) => {
    const newImages = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && uploadedImages.length + newImages.length < 5) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            name: file.name
          });
          if (newImages.length === Math.min(files.length, 5 - uploadedImages.length)) {
            setUploadedImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.lastSeenLocation.trim()) newErrors.lastSeenLocation = 'Last seen location is required';
    if (!formData.dateTimeLost) newErrors.dateTimeLost = 'Date and time lost is required';
    if (!formData.name.trim()) newErrors.name = 'Contact name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (uploadedImages.length === 0) newErrors.images = 'At least one photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFormData = (dataObject, filesArray) => {
    const formDataToSend = new FormData();

    Object.entries(dataObject).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    filesArray.forEach((img) => {
      formDataToSend.append('item', img.file, img.name,img.preview);
    });

    return formDataToSend;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data=buildFormData(formData,uploadedImages)
    for (let [key, value] of data.entries()) {
  console.log(key, value);
}
    if (!validateForm()) return;
    setIsSubmitting(true)
    await axios.post('/api/lostItem', data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }).then((res) => {
      if(res.data.success){
        toast.success("Lost Item Reported..!")
        router.push('/allLost')
        setIsSubmitting(false)
      }
      else{
      setIsSubmitting(false)
      toast.error("Error reporting lost item")
    }
    }).catch((err) => {
      console.log(err)
      toast.error("Error reporting lost item")
      setIsSubmitting(false)
      console.log('bad')
    })
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.background}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-8 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 ${isDarkMode ? 'bg-blue-500' : 'bg-purple-400'}`}></div>
      </div>

      <Header />

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center max-w-4xl mx-auto">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <span className="text-green-500">{successMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${themeClasses.card}`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${themeClasses.text.primary}`}>
              <Camera className="w-6 h-6 mr-3" />
              Upload Photos
            </h2>

            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${dragOver
                ? themeClasses.uploadArea.dragOver
                : uploadedImages.length > 0
                  ? themeClasses.uploadArea.uploaded
                  : themeClasses.uploadArea.default
                }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              <Upload className={`w-12 h-12 mx-auto mb-4 ${themeClasses.text.muted}`} />
              <p className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
                Drop photos here or click to browse
              </p>
              <p className={`${themeClasses.text.muted}`}>
                Upload up to 5 photos • JPG, PNG, GIF up to 10MB each
              </p>
            </div>

            {errors.images && (
              <div className="mt-3 flex items-center text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.images}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-24 object-cover rounded-xl shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${themeClasses.card}`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${themeClasses.text.primary}`}>
              <Tag className="w-6 h-6 mr-3" />
              Item Details
            </h2>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${themeClasses.input} ${errors.description ? 'border-red-500 focus:ring-red-400' : ''}`}
                placeholder="Describe your item in detail (color, brand, size, unique features, condition, etc.)"
              />
              {errors.description && (
                <div className="mt-2 flex items-center text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.description}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Last Seen Location *
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type="text"
                    value={formData.lastSeenLocation}
                    onChange={(e) => handleInputChange('lastSeenLocation', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.lastSeenLocation ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="e.g., Central Park, Starbucks on 5th Ave"
                  />
                </div>
                {errors.lastSeenLocation && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.lastSeenLocation}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Date & Time Lost *
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type="datetime-local"
                    value={formData.dateTimeLost}
                    onChange={(e) => handleInputChange('dateTimeLost', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.dateTimeLost ? 'border-red-500 focus:ring-red-400' : ''}`}
                  />
                </div>
                {errors.dateTimeLost && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.dateTimeLost}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className={`p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${themeClasses.card}`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${themeClasses.text.primary}`}>
              <User className="w-6 h-6 mr-3" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.contactName ? 'border-red-500 focus:ring-red-400' : ''}`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.name}
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input}`}
                    placeholder="Your phone number (optional)"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.contactEmail ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${themeClasses.card}`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${themeClasses.text.primary}`}>
              <Clock className="w-6 h-6 mr-3" />
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Reward Offered (Optional)
                </label>
                <input
                  type="text"
                  value={formData.reward}
                  onChange={(e) => handleInputChange('reward', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input}`}
                  placeholder="e.g., $50, No questions asked"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${themeClasses.input}`}
                placeholder="Any additional information that might help find your item..."
              />
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl ${themeClasses.button.primary} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Submitting Report...
                </div>
              ) : (
                'Submit Lost Item Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Page