"use client"
import React, { useState } from 'react'
import { Search, Eye, EyeOff, Mail, Lock, User, Phone, Sun, Moon, ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../components/contexts'
import { useRouter } from 'next/navigation'
import axios from 'axios';
import toast from 'react-hot-toast';

const Page = () => {
  const router = useRouter()
  const { isDarkMode, setIsDarkMode } = useAppContext()
  const [errors, setErrors] = useState({});
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage,setSuccessMessage]=useState('')
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };



  const handleSignup = async (e) => {
      e.preventDefault();
    setError({});
    setIsLoading(true);
    console.log('start')

    const newErrors = {};
    if (!signupForm.firstName) newErrors.firstName = 'First name is required';
    if (!signupForm.lastName) newErrors.lastName = 'Last name is required';
    if (!signupForm.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signupForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!signupForm.phone) newErrors.phone = 'Phone number is required';
    if (!signupForm.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(signupForm.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!signupForm.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      console.log(newErrors)
      setError(newErrors);
      setIsLoading(false);
      return;
      
    }

    await axios.post('/api/register', signupForm,{headers: {
          "Content-Type": "application/json",
        },}).then((res) => {
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
      setIsLoading(false);
      toast.success(res.data.message)
      setTimeout(()=>{
        router.push('/dashboard'),3000

      })
    }).catch((error)=>{
        setIsLoading(false);
        toast.error(error.response.data.message)
    })

  }
  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.background} flex items-center justify-center p-4`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-4 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse ${isDarkMode ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-8 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000 ${isDarkMode ? 'bg-blue-500' : 'bg-purple-400'}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500 ${isDarkMode ? 'bg-pink-500' : 'bg-cyan-400'}`}></div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg ${themeClasses.card} border`}
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-purple-600" />
          )}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className={`p-8 rounded-3xl shadow-2xl border backdrop-blur-lg ${themeClasses.card}`}>
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${isDarkMode ? 'from-purple-500 to-blue-500' : 'from-blue-500 to-purple-500'} rounded-2xl mb-4 shadow-xl`}>
                <Search className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text.primary}`}>
                Create Account
              </h1>
              <p className={`${themeClasses.text.secondary}`}>
                Join FINDR to start finding your lost items
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span className="text-green-500 text-sm">{successMessage}</span>
              </div>
            )}

            <form  className="space-y-6" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    First Name
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                    <input
                      type="text"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.firstName ? 'border-red-500 focus:ring-red-400' : ''}`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && (
                    <div className="mt-1 text-red-500 text-xs">{errors.firstName}</div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.lastName ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <div className="mt-1 text-red-500 text-xs">{errors.lastName}</div>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.email ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.email}
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
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.phone ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.phone}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.password ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.muted} hover:${themeClasses.text.primary}`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.password}
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.text.muted}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${themeClasses.input} ${errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.muted} hover:${themeClasses.text.primary}`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={signupForm.agreeTerms}
                    onChange={(e) => setSignupForm({ ...signupForm, agreeTerms: e.target.checked })}
                    className={`w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5 ${errors.agreeTerms ? 'border-red-500' : ''}`}
                  />
                  <span className={`ml-3 text-sm ${themeClasses.text.secondary}`}>
                    I agree to the{' '}
                    <button type="button" className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button type="button" className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}>
                      Privacy Policy
                    </button>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <div className="mt-2 flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.agreeTerms}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg ${themeClasses.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center">
                <span className={`${themeClasses.text.secondary}`}>Already have an account? </span>
                <button
                  onClick={()=>router.push('/login')}
                  className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-700'} font-medium transition-colors`}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-green-500 text-sm font-medium">256-bit SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );



}

export default Page