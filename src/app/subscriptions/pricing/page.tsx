'use client';

import DashboardLayout from "@/components/DashboardLayout";
import HeaderTitleCard from "@/components/HeaderTitleCard";
import { useGoBack } from "@/hooks/useGoBack";



// --- MAIN PAGE COMPONENT ---
export default function SubscriptionPage() {
     const handleGoBack = useGoBack();
  return (
     <DashboardLayout> 


    {/* <!-- Main Container --> */}
    {/* <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24"> */}

        {/* <!-- Header Section --> */}
         <HeaderTitleCard onGoBack={handleGoBack} title=" Find the perfect plan" description="Choose the plan that's right for you. All plans come with a 14-day free trial."/>
       

        {/* <!-- Billing Toggle --> */}
        <div className="flex items-center justify-center space-x-4 mb-12">
            <span id="monthly-label" className="font-semibold text-gray-900">Monthly</span>
            <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="billing-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 appearance-none cursor-pointer"/>
                <label htmlFor="billing-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
            <span id="yearly-label" className="font-medium text-gray-500">Yearly</span>
            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">SAVE 25%</span>
        </div>

        {/* <!-- Pricing Cards Grid --> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

            {/* <!-- Basic Plan Card --> */}
            <div id="plan-basic" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-500">Basic</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight price" data-monthly="12" data-yearly="9">$12</span>
                        <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                    </div>
                    <p className="mt-4 text-gray-600">Perfect for individuals and small teams just getting started.</p>
                    
                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">10 projects</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">5 GB storage</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Basic analytics</span>
                        </li>
                    </ul>
                </div>
                <a href="#" className="mt-8 block w-full bg-purple-700 text-white text-center py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300">Choose Basic</a>
            </div>

            {/* <!-- Pro Plan Card (Highlighted) --> */}
            <div id="plan-pro" className="bg-white rounded-2xl shadow-lg border-2 border-purple-700 p-8 flex flex-col relative">
                <div className="absolute top-0 -translate-y-1/2 bg-purple-700 text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</div>
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-purple-700">Pro</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight price" data-monthly="25" data-yearly="19">$25</span>
                        <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                    </div>
                    <p className="mt-4 text-gray-600">For growing businesses that need more power and features.</p>
                    
                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Unlimited projects</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">50 GB storage</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Advanced analytics</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Priority support</span>
                        </li>
                    </ul>
                </div>
                <a href="#" className="mt-8 block w-full bg-purple-700 text-white text-center py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300">Choose Pro</a>
            </div>

            {/* <!-- Enterprise Plan Card --> */}
            <div id="plan-enterprise" className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
                <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-500">Enterprise</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight">Custom</span>
                    </div>
                    <p className="mt-4 text-gray-600">For large organizations with custom needs and dedicated support.</p>
                    
                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Everything in Pro</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Dedicated account manager</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Custom integrations</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            <span className="text-gray-700">Advanced security & compliance</span>
                        </li>
                    </ul>
                </div>
                <a href="#" className="mt-8 block w-full bg-gray-800 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-300">Contact Sales</a>
            </div>

        </div>

    {/* </div> */}

 

      </DashboardLayout>
  );
}
