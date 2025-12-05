'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import  config  from '@/config/env';

// --- MAIN PAGE COMPONENT ---
export default function LoginPage() {

  // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8000/api/v1';
    const BASE_URL = config.baseUrl;
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          setIsLoading(true);
          
              const payload = {
                  email,
                  password,
              };
  
          try {
              const response = await fetch(`${BASE_URL}/auth/login`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload),
              });

              const result = await response.json();
  
              if (!response.ok || result.status === false) {
                  // Handle field-specific errors
                  if (result.errors) {
                      const extractedErrors: { [key: string]: string } = {};
                      for (const key in result.errors) {
                          if (result.errors[key]?.length > 0) {
                              extractedErrors[key] = result.errors[key][0]; // take first error
                          }
                      }
                      console.log('Setting fieldErrors:', extractedErrors); // ✅
                  }
  
                  throw new Error(result.message || 'Login failed. Please fix the errors.');
              }else{
                toast.success(result.message || "Login successful!");

                localStorage.setItem("user", JSON.stringify(result.user));
                localStorage.setItem("token", result.token);
                localStorage.setItem("refresh_token", result.refresh_token);

                const redirectTo = localStorage.getItem("redirectAfterLogin") || "/dashboard";
                localStorage.removeItem("redirectAfterLogin");

                router.push(redirectTo);

                setIsSubmitting(false);
                setIsLoading(false);

              }
  
          } catch (error: unknown) {
            setIsSubmitting(false);
            setIsLoading(false);

            if (error instanceof Error) {
                console.error('Registration failed:', error);
                toast.error(error.message || 'Registration failed. Please try again.');
            } else {
                console.error('Registration failed:', error);
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }

      };

  const isFormFilled = email && password ;


  return (
    <div className="min-h-screen font-sans lg:grid lg:grid-cols-2">
      {/* Left Column: Image */}
      <div className="hidden lg:block relative">
        <Image
            className="absolute inset-0 object-cover bg-center w-full h-full"
            src="/assets/images/hero_image.png?height=1080&width=1920"
            alt="background"
            width={1920}
            height={1080}
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-purple-600/30"></div>
        <div className="relative flex flex-col justify-center h-full p-12 text-white">
            <h1 className="text-4xl font-bold">Ervop</h1>
            <p className="mt-4 text-2xl font-semibold">The Operating System for Your Business.</p>
            <p className="mt-2 text-lg text-purple-200">Join thousands of Nigerian entrepreneurs turning their hustle into a real business.</p>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="bg-white-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full">
            <div className="text-center mb-8 lg:hidden">
                 <h1 className="text-3xl font-bold text-purple-600">Ervop</h1>
            </div>
            <div className="p-8 rounded-xl border border-white shadow-lg">
                <div className="text-left mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Login your account</h2>
                    <p className="mt-2 text-gray-500">
                       {`Don't have an account? `}
                        <Link href="/auth/registration" className="font-semibold text-purple-600 hover:underline">
                        Create a New Account
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                     
                    {/* Step 2: Account Details */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div> 
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="relative mt-1">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    name="password" 
                                    id="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••" 
                                    required 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                   

                    {/* Submit Button */}
                    <div>
                    <button
                        type="submit"
                        disabled={!isFormFilled || isLoading || isSubmitting} // use isSubmitting here
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                        {isSubmitting ? 'Submitting...' : 'Login Account'}
                    </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
