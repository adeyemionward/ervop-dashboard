'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import clsx from 'clsx';
import { DollarSign, LayoutDashboard, Briefcase, FolderKanban, KanbanSquare, LogOut, Calendar, Users, FileText, CreditCard, Wallet, Palette, Settings } from 'lucide-react';

const sidebarNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },

  // Other single menus
  { title: 'Services', href: '/services', icon: Briefcase },
  { title: 'Forms', href: '/forms', icon: KanbanSquare },
    // Contact Manager
  {
    title: 'Contact Manager',
    icon: Users,
    items: [
      { title: 'Clients', href: '/contacts/clients', icon: Users },
      { title: 'Vendors', href: '/contacts/vendors', icon: Users },
      { title: 'Contractors', href: '/contacts/contractors', icon: Briefcase },
    ]
  },
  { title: 'Appointments', href: '/appointments', icon: Calendar },
  { title: 'Client Works', href: '/projects', icon: KanbanSquare },
  { title: 'Document Manager', href: '/docs-manager', icon: FolderKanban },




  // Financial Manager
  {
    title: 'Financial Manager',
    icon: Wallet,
    items: [
      { title: 'Invoices', href: '/financial/invoices', icon: FileText },
      { title: 'Income', href: '/financial/income', icon: Wallet },
      { title: 'Expenses', href: '/financial/expenses', icon: CreditCard },
      { title: 'Receipts', href: '/financial/receipts', icon: FileText },
    ]
  },

  { title: 'Subscriptions', href: '/subscriptions', icon: DollarSign },
  { title: 'Site Customizations', href: '/customizations', icon: Palette },
  { title: 'Settings', href: '/settings', icon: Settings },

    { title: 'Logout', href: '/logout', icon: LogOut },

  
  // General Toolkit
  // {
  //   title: 'General Toolkit',
  //   isCollapsible: false,
  //   items: [
     
  //   ]
  // }
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState('');

  useEffect(() => {
    let activeMenu = '';
    for (const item of sidebarNavItems) {
      if (item.items) {
        const isActive = item.items.some(sub => pathname.startsWith(sub.href));
        if (isActive) {
          activeMenu = item.title;
          break;
        }
      }
    }
    setOpenMenu(activeMenu);
  }, [pathname]);

  const handleMenuToggle = (title: string) => {
    if (!isCollapsed) setOpenMenu(openMenu === title ? '' : title);
  };

  return (
    <>
      <div
        onClick={onClose}
        className={clsx('fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden', { hidden: !isMobileOpen })}
      />

      <aside
        className={clsx(
          'bg-white text-gray-900 w-64 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-30',
          'md:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          { 'md:w-20': isCollapsed }
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="flex items-center">
            <Icons.logo className="h-8 w-8 text-primary-600" />
            {!isCollapsed && <span className="ml-2 text-2xl font-bold text-gray-800">Ervop</span>}
          </Link>
          <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-gray-100">
            <Icons.close className="w-6 h-6" />
          </button>
        </div>

       <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {sidebarNavItems
            .filter(item => item.title !== 'Logout') // Exclude Logout from scrollable area
            .map(item => {
              const hasSubmenu = item.items && item.items.length > 0;
              const IconComponent = item.icon;

              if (hasSubmenu) {
                return (
                  <div key={item.title}>
                    <button
                      onClick={() => handleMenuToggle(item.title)}
                      className={clsx(
                        'flex items-center w-full p-2 text-base rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors',
                        { 'justify-center': isCollapsed }
                      )}
                    >
                      {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                      {!isCollapsed && (
                        <Icons.chevronDown
                          className={clsx(
                            'h-4 w-4 ml-auto transform transition-transform duration-300',
                            { 'rotate-180': openMenu === item.title }
                          )}
                        />
                      )}
                    </button>

                    <div
                      className={clsx(
                        'ml-4 mt-1 space-y-1 overflow-hidden transition-[max-height] duration-300 ease-in-out',
                        { 'max-h-96': openMenu === item.title && !isCollapsed, 'max-h-0': openMenu !== item.title && !isCollapsed }
                      )}
                    >
                      {item.items.map(subItem => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={clsx(
                              'flex items-center p-2 text-md  rounded-lg hover:bg-gray-100 cursor-pointer transition-colors',
                              pathname.startsWith(subItem.href) || pathname === subItem.href
                                ? 'btn-side-menu-active text-white font-semibold'
                                : ''
                            )}
                          >
                            {SubIcon && <SubIcon className="h-4 w-4 flex-shrink-0" />}
                            {!isCollapsed && <span className="ml-2">{subItem.title}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href || '/'}
                  href={item.href || '/'}
                  className={clsx(
                    'flex items-center p-2 text-base rounded-lg transition-colors cursor-pointer hover:bg-gray-100',
                    { 'justify-center': isCollapsed },
                    pathname === item.href
                      ? 'btn-side-menu-active text-white font-semibold'
                      : 'text-gray-600'
                  )}
                >
                  {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              );
            })}
       </nav>

        {/* Logout button pinned at bottom */}
        <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200">
          {sidebarNavItems
            .filter(item => item.title === 'Logout')
            .map(item => (
              <Link
                key={item.href || '/'}
                href={item.href || '/'}
                className={clsx(
                  'flex items-center p-2 text-base rounded-lg hover:bg-red-200 transition-colors',
                  { 'justify-center': isCollapsed },
                  'bg-red-100 text-red-700'
                )}
              >
                {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            ))}
        </div>

      </aside>
    </>
  );
}
