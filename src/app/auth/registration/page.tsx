'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Calendar, Briefcase, Eye, EyeOff, ArrowLeft, Phone, Mail } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
// import { useRouter } from 'next/router';
import { useRouter } from 'next/navigation';
import Select from "react-select";
import { industryOptions, customStyles as industryStyles } from "@/components/IndustryOptions";
import { currencyOptions, customStyles as currencyStyles } from "@/components/CurrencyOptions";

// --- TYPE DEFINITIONS ---
type BusinessType = 'seller' | 'professional' | 'hybrid' | null;

// --- INDUSTRY OPTIONS ---


// --- MAIN PAGE COMPONENT ---
export default function RegistrationPage() {
    // State to manage the current step of the form
    const [step, setStep] = useState(1);
    // State to manage the selected business type
    const [businessType, setBusinessType] = useState<BusinessType>(null);

    // State for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [industry, setIndustry] = useState(''); // New state for industry
    const [currency, setCurrency] = useState(''); // New state for industry
    const [businessDescription, setBusinessDescription] = useState(''); // New state for industry
    const [ervopUrl, setErvopUrl] = useState('');
    const [phone, setPhone] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // State for OTP verification
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpMessage, setOtpMessage] = useState('');

    // New states for form submission status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    
    const router = useRouter();
    // rediredct to dashboard after successful registration
    useEffect(() => {
        if (step === 5) {
            const timeout = setTimeout(() => {
                router.push('/dashboard');
            }, 3000);

            return () => clearTimeout(timeout); // cleanup on unmount
        }
    }, [step]);
    // end rediredct to dashboard after successful registration

    const handleContinue = (nextStep:any) => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setStep(nextStep);
        }, 1000); // Simulated delay
    };
    const SuccessMessage = () => {
        return (
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-purple-500 mx-auto mb-4 animate-bounce"
            viewBox="0 0 20 20"
            fill="currentColor"
            >
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
            />
            </svg>
            <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-2">Welcome Aboard!</h2>
            <p className="text-gray-600 text-lg mb-6">Your account has been successfully created & verified.</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
        );
            
    };

    // Function to auto-generate a URL-friendly slug from the business name
    const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setBusinessName(name);
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setErvopUrl(slug);
    };

    // Function to handle moving from Step 3 to Step 4 and generating OTP
     const handleStepThreeContinue = () => {
      

        // Set message based on business type
        if (businessType === 'seller') {
            setOtpMessage(`A 4-digit code whas been sent to your phone number: ${phone}`);
        } else if (businessType === 'professional' || businessType === 'hybrid') {
            setOtpMessage(`A 4-digit code has been senwwt to your email address: ${email}`);
        }
        setStep(4);
    };

    // step 2 form validation
    const handleStepTwoSubmit = async (e:React.FormEvent) => {
        e.preventDefault();

        if (!isStepTwoComplete) return;
        setIsLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/auth/secondStepValidation', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, phone }),
            });

            const data = await res.json();;
            if (res.ok && data.status === true) {
            setEmailError('');
            setPhoneError('');
            handleContinue(3); // ✅ proceed to Step 3
        } else if (data.errors) {
            // Show only the specific field errors returned
            setEmailError(data.errors.email || '');
            setPhoneError(data.errors.phone || '');
            setIsLoading(false);
        } else {
            toast.error(data.message || 'Validation failed.');
            setIsLoading(false);
        }
        
        } catch (err) {
            console.error('Email check failed:', err);
            toast.error('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };


    // Function to handle form submission on the final step (Step 4)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setSuccessMessage('');
        setOtpError('');
        setFieldErrors({});
        setIsSubmitting(true);
        setIsLoading(true);
        
            const payload = {
                firstName,
                lastName,
                email,
                phone,
                password,
                businessName,
                businessType,
                industry,
                ervopUrl,
                currency,
                businessDescription,
            };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || 'Something went wrong during registration.');
            // }

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
                    setFieldErrors(extractedErrors);
                }

                throw new Error(result.message || 'Registration failed. Please fix the errors.');
            }
             handleContinue(4); 

        } catch (error: any) {
            setIsSubmitting(false);
            console.error('Registration failed:', error);
            setSubmitError(error.message);
            setIsLoading(false);
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    };

     // Function to handle form submission on the final step (Step 4)
    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setSuccessMessage('');
        setOtpError('');
        
        setIsSubmitting(true);
        setIsLoading(true);
            const payload = {
                otp,
                email
            };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/auth/otpVerification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong during otp verification.');
            }

            const result = await response.json();
            console.log('Verification successful:', result);
            if (result.status === true) {

                localStorage.setItem('user', JSON.stringify(result.user));
                // If the OTP is correct, set the step to 5.
                handleContinue(5); // ✅ proceed to Step 4
            } else {
                setSubmitError('Invalid OTMMP. Please try again.');
                setIsLoading(false);
            }
            // setSuccessMessage('Account created successfully! You can now log in.');

        } catch (error: any) {
            console.error('Verification failed:', error);
            setSubmitError(error.message);
            setIsLoading(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation logic for each step
    const isStepOneComplete = businessType !== null;
    const isStepTwoComplete =
        firstName &&
        lastName &&
        password &&
        agreedToTerms &&
        (businessType === 'professional' ? email : phone); // Email is required for professional, phone for seller/hybrid

    const isStepThreeComplete = businessName && ervopUrl && industry &&  currency && businessDescription;

    // Check if OTP is a valid 4-digit number
    const isOtpValid = otp.length === 4;

    const getVerificationMethod = () => {
        if (businessType === 'seller') {
            return {
                icon: <Phone className="w-12 h-12 text-purple-500 mb-4" />,
                text: `A 4-digit code has been sent to your phone number ending in ${phone.slice(-4)}.`,
            };
        }
        return {
            icon: <Mail className="w-12 h-12 text-purple-500 mb-4" />,
            text: `A 4-digit code has been sent to your email address: ${email}.`,
        };
    };

    const verificationMethod = getVerificationMethod();

    return (
        <div className="min-h-screen font-sans lg:grid lg:grid-cols-2">
            {/* Left Column: Image */}
            <div className="hidden lg:block relative">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop"
                    alt="Professionals working"
                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x1800/e2e8f0/4a5568?text=Ervop'; }}
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
                <div className="w-full max-w-xl">
                    <div className="text-center mb-8 lg:hidden">
                        <h1 className="text-3xl font-bold text-purple-600">Ervop</h1>
                    </div>
                    <div className="p-8 rounded-xl border border-white shadow-sm">
                        <div className="text-left mb-8 flex items-center justify-between">
                            <div>
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(step - 1)}
                                        className="mb-4 text-gray-500 hover:text-gray-900 transition-colors"
                                        aria-label="Go back to previous step">
                                        {step !== 4 && step !== 5 && <ArrowLeft className="w-6 h-6" />}


                                    </button>
                                )}
                                <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
                                    {step === 1 ? 'What kind of business are you building?' :
                                        step === 2 ? 'Create your account' :
                                            step === 3 ? 'Tell us about your business' :
                                              step === 4 ?  'Verify your account'
                                                : ''}
                                </h2>
                                {(step != 4) && (
                                    <p className="mt-2 text-gray-500">
                                        Step {step} of 4. Already have an account?{' '}
                                        <Link href="/auth/login" className="font-semibold text-purple-600 hover:underline">
                                            Log in
                                        </Link>
                                    </p>
                                )}


                                
                            </div>
                        </div>

                        {/* Step 1: Business Type Selection */}
                        {step === 1 && (
                            <form>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                                        {/* Professional Option */}
                                        <button type="button" onClick={() => setBusinessType('professional')} className={clsx('w-full flex items-center p-3 border rounded-lg text-left transition-all duration-200', businessType === 'professional' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500' : 'bg-white border-gray-300 hover:border-purple-400')}>
                                            <Calendar className="w-6 h-6 text-purple-600 mr-4 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">I offer services</p>
                                                <p className="text-xs text-gray-500">For consultants, lawyers, medics, media, techies, surveyors etc.</p>
                                            </div>
                                        </button>
                                        {/* hybrid Option */}
                                        <button type="button" onClick={() => setBusinessType('hybrid')} className={clsx('w-full flex items-center p-3 border rounded-lg text-left transition-all duration-200', businessType === 'hybrid' ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500' : 'bg-white border-gray-300 hover:border-purple-400')}>
                                            <Briefcase className="w-6 h-6 text-purple-600 mr-4 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-800">Hybrid</p>
                                                <p className="text-xs text-gray-500">I offer services & also sell physical or digital products (e.g., books, supplements)</p>
                                            </div>
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        onClick={() => handleContinue(2)}
                                        disabled={!isStepOneComplete || isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        ) : (
                                            'Continue'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 2: Personal Details */}
                        {step === 2 && (
                            <form onSubmit={handleStepTwoSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            name="first-name"
                                            id="first-name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="e.g., Chioma"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input
                                            type="text"
                                            name="last-name"
                                            id="last-name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="e.g., Nwosu"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={email}
                                            
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (emailError) {
                                                    setEmailError('');
                                                }
                                            }}
                                            placeholder="you@example.com"
                                            required={businessType === 'professional'}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                                        
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            value={phone}
                                            // 
                                            onChange={(e) => {
                                                setPhone(e.target.value);
                                                if (phoneError) {
                                                    setPhoneError('');
                                                }
                                            }}
                                            
                                            
                                            placeholder="e.g., 08012345678"
                                            required={businessType === 'seller' || businessType === 'hybrid'}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
                                    </div>
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
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="font-medium text-gray-700">
                                            I agree to the Ervop{' '}
                                            <Link href="/terms" className="text-purple-600 hover:underline">
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link href="/privacy" className="text-purple-600 hover:underline">
                                                Privacy Policy
                                            </Link>
                                            .
                                        </label>
                                    </div>
                                </div>
                                <div>
                                  
                                    <button
                                        type="submit"
                                        disabled={!isStepTwoComplete || isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        ) : (
                                            'Continue'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Business Details */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">Business Name</label>
                                        <input
                                            type="text"
                                            name="business-name"
                                            id="business-name"
                                            value={businessName}
                                            onChange={(e) => {
                                                handleBusinessNameChange(e); // ✅ Correct: pass the full event
                                                setFieldErrors(prev => ({ ...prev, businessName: '' }));
                                            }}
                                            placeholder="e.g., Chioma's Designs"
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        {fieldErrors.businessName && (
                                            <p className="text-red-500 text-sm">{fieldErrors.businessName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="ervop-url" className="block text-sm font-medium text-gray-700">Your Ervop URL</label>
                                        <div className="flex rounded-lg shadow-sm mt-1">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                                ervop.com/
                                            </span>
                                            <input
                                                type="text"
                                                name="ervop-url"
                                                id="ervop-url"
                                                value={ervopUrl}
                                                onChange={(e) =>  setErvopUrl(e.target.value)}
                                                readOnly
                                                required
                                                className="flex-1 block w-full rounded-r-lg border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
                                            />
                                            
                                        </div>
                                    </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Industry */}
                                        <div>
                                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                                            Industry
                                            </label>
                                            <Select
                                            id="industry"
                                            name="industry"
                                            value={industryOptions.find((opt) => opt.value === industry) || null}
                                            onChange={(selectedOption) => setIndustry(selectedOption?.value || "")}
                                            options={industryOptions}
                                            styles={industryStyles}
                                            placeholder="Select an industry"
                                            isClearable
                                            />
                                            {fieldErrors.industry && (
                                            <p className="text-red-500 text-sm">{fieldErrors.industry}</p>
                                            )}
                                        </div>

                                        {/* Currency */}
                                        <div>
                                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                            Currency
                                            </label>
                                            <Select
                                                id="currency"
                                                name="currency"
                                                value={currencyOptions.find((opt) => opt.value === currency) || null}
                                                onChange={(selectedOption) => setCurrency(selectedOption?.value || "")}
                                                options={currencyOptions}
                                                styles={currencyStyles}
                                                placeholder="Select a currency"
                                                isClearable
                                            />
                                            {fieldErrors.currency && (
                                            <p className="text-red-500 text-sm">{fieldErrors.currency}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2 mt-4">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Description
                                        </label>
                                        <textarea
                                        
                                            id="description"
                                            rows={3}
                                            placeholder="Briefly describe your business..."
                                            value={businessDescription}
                                            onChange={(e) => setBusinessDescription(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        ></textarea>

                                        {fieldErrors.description && (
                                            <p className="text-red-500 text-sm">{fieldErrors.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div>

                                    <button
                                        type="submit"
                                        disabled={!isStepThreeComplete || isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        ) : (
                                            'Continue'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step 4: OTP Verification */}
                        {step === 4 && (
                            <form onSubmit={handleOTPSubmit}  className="space-y-6">
                                <div className="flex flex-col items-center justify-center text-center">
                                    {verificationMethod.icon}
                                    <p className="text-sm text-gray-500 mb-4">{verificationMethod.text}</p>
                                    {otpError && <p className="text-red-500 text-sm mb-4">{otpError}</p>}
                                    {submitError && <p className="text-red-500 text-sm mb-4">{submitError}</p>}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="otp" className="sr-only">OTP Code</label>
                                        <input
                                            type="text"
                                            name="otp"
                                            id="otp"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter 4-digit code"
                                            maxLength={4}
                                            required
                                            className="w-full text-center border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 tracking-widest text-lg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    {/* <button
                                        type="submit"
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={!isOtpValid}
                                    >
                                        Verify and Create Account
                                    </button> */}

                                    <button
                                        type="submit"
                                        disabled={!isOtpValid || isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                            </svg>
                                        ) : (
                                            'Verify and Create Account'
                                        )}
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleStepThreeContinue} // Re-use this function to resend OTP
                                        className="mt-4 w-full text-center text-sm font-medium text-purple-600 hover:underline"
                                    >
                                        Resend code
                                    </button>
                                </div>
                            </form>

                        )}
                        {/* Step 5: Success Message */}

                        {step === 5 && (
                            <div>
                                <div className="flex flex-col items-center justify-center text-center">
                                    {/* Now, this component will simply render and stay */}
                                    <SuccessMessage />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
