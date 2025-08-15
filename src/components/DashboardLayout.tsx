'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import clsx from 'clsx';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    // The root container for the entire page layout
    <div className="relative flex h-screen  overflow-hidden bg-gray-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileSidebarOpen}
        onClose={toggleMobileSidebar}
      />

      {/* Main Content Wrapper */}
      {/* FIX: Removed margin classes (md:ml-*) to let flexbox handle the width correctly. */}
      <div className={clsx(
        "flex-1 flex flex-col overflow-hidden min-w-0"
      )}>
        <Header 
          onDesktopToggle={toggleSidebar} 
          onMobileToggle={toggleMobileSidebar}
        />
        
        {/* Main content area that scrolls */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
