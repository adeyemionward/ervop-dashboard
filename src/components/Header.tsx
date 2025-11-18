'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icons } from './icons';
import Image from 'next/image';
// Update the import path below to the correct relative path based on your project structure.
// For example, if 'auth.ts' is in 'src/utils/', use:
import {logout} from '@/app/utils/auth'
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { useRouter } from 'next/navigation';


interface HeaderProps {
  onDesktopToggle: () => void;
  onMobileToggle: () => void;
}

export default function Header({ onDesktopToggle, onMobileToggle }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  //autologout hook
  useAutoLogout();


  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push('/auth/login');
    }
  }, [router]);

  // Effect to handle clicks outside of the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-20 px-6">
        <div className="flex items-center">
          {/* Sidebar Toggles */}
          <button
            onClick={onDesktopToggle}
            className="hidden md:block p-2 rounded-full text-gray-500 bg-gray-100"
          >
            <Icons.menu className="w-6 h-6" />
          </button>
          <button
            onClick={onMobileToggle}
            className="md:hidden p-2 rounded-full text-gray-500 bg-gray-100"
          >
            <Icons.menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* "My Website" Button */}
          <button className="bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 mr-4">
            My Website
          </button>

          {/* Profile Dropdown */}
          <div className="relative " ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none cursor-pointer bg-gray-100"
            >
              <Image
                className="h-10 w-10 rounded-full object-cover"
                src="https://i.pravatar.cc/150?u=ervop-admin"
                alt="User avatar"
                width={40}
                height={40}
              />
              <span className="hidden font-medium md:block text-gray-700 ">Ervop Vendor</span>
              <Icons.chevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => logout(router)}
                  className="w-full cursor-pointer text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
