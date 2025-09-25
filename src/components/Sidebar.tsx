'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import clsx from 'clsx';
import { 
    Package, ShoppingCart, BarChart2, Tag, CheckCircle, XCircle, DollarSign, Search, Edit, Trash2, Plus, 
    LayoutDashboard, Briefcase, FolderKanban, KanbanSquare, Calendar, Users, FileText, ArrowLeftRight, CreditCard,
    Megaphone, Wallet, Palette, Settings,
    Landmark
} from 'lucide-react';

// --- Navigation Data ---
const sidebarNavItems = [
  // { title: 'Dashboard', href: '/', icon: Icons.dashboard },
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  //{
   // title: 'Seller Toolkit',
    //items: [ 
     // { title: 'Products', href: '/products', icon: Package }, // CORRECTED: Using Lucide Icon
      // { title: 'Orders', href: '/orders', icon: ShoppingCart }, // CORRECTED: Using Lucide Icon
     // { title: 'Discounts', href: '/discounts', icon: Tag }, // CORRECTED: Using Lucide Icon
    // ],

    
  //},
  {
    title: 'Professional Toolkit',
    items: [
        { title: 'Services', href: '/services', icon: Briefcase },
        { title: 'Forms', href: '/forms', icon: KanbanSquare },
        { title: 'Appointments', href: '/appointments', icon: Calendar },
        { title: 'Client Works', href: '/projects', icon: KanbanSquare },
    ],
  },
  {
    title: 'General Toolkit',
    isCollapsible: false, // This flag prevents it from being a dropdown
    items: [
      { title: 'Analytics', href: '/analytics', icon: BarChart2 }, // CORRECTED: Using Lucide Icon
      { title: 'Document Manager', href: '/docs-manager', icon: FolderKanban },
      { title: 'Contact Manager', href: '/contacts', icon: Users },
      { title: 'Invoices', href: '/invoices', icon: FileText },
      { title: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
      { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
      // { title: 'Payouts', href: '/payouts', icon: Landmark },
      // { title: 'Campaigns', href: '/campaigns', icon: Megaphone },
      // { title: 'Payment Methods', href: '/payment-methods', icon: Wallet },
      { title: 'Site Customizations', href: '/customizations', icon: Palette },
      { title: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

// --- Component Props Interface ---
interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onClose: () => void;
}

// --- Main Sidebar Component ---
export default function Sidebar({ isCollapsed, isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState('');

  // Effect to automatically open the correct menu based on the current page
  useEffect(() => {
    let activeMenu = '';
    for (const item of sidebarNavItems) {
        // Check if the item is a toolkit and has sub-items
        if (item.items && item.isCollapsible !== false) {
            // Check if any sub-item's href is the start of the current pathname
            const isActive = item.items.some(subItem => 
                subItem.href !== '/' && pathname.startsWith(subItem.href)
            );
            if (isActive) {
                activeMenu = item.title;
                break; // Exit loop once the active toolkit is found
            }
        }
    }
    // If no active menu is found (e.g., on the dashboard), default to opening the Seller Toolkit
    setOpenMenu(activeMenu || 'Professional Toolkit');
  }, [pathname]); // This effect re-runs whenever the page URL changes

  // Toggles the accordion menu. If the clicked menu is already open, it closes it.
  // Otherwise, it opens the clicked menu (which closes any other open one).
  const handleMenuToggle = (title: string) => {
    if (!isCollapsed) {
      setOpenMenu(openMenu === title ? '' : title);
    }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden',
          { 'hidden': !isMobileOpen }
        )}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          'bg-white text-gray-900 w-64 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 transform transition-all duration-300 ease-in-out z-30',
          'md:relative',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          { 'md:w-20': isCollapsed }
        )}
      >
        {/* Logo & Close button */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="flex items-center">
            <Icons.logo className="h-8 w-8 text-primary-600" />
            {!isCollapsed && <span className="ml-2 text-2xl font-bold text-gray-800">Ervop</span>}
          </Link>
          <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-gray-100">
            <Icons.close className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto hide-scrollbar">
          {sidebarNavItems.map((item, index) => {
            const isCollapsible = item.items && item.isCollapsible !== false;

            return item.items ? (
              <div key={index}>
                {/* Render a button for collapsible items, otherwise render a static div */}
                {isCollapsible ? (
                  <button
                    onClick={() => handleMenuToggle(item.title)}
                    className={clsx(
                      'w-full flex items-center justify-between text-left text-xs font-semibold uppercase tracking-wider p-2 rounded-lg text-gray-400 cursor-pointer',
                      { 'justify-center': isCollapsed }
                    )}
                  >
                    {!isCollapsed && <span>{item.title}</span>}
                    {!isCollapsed && (
                      <Icons.chevronDown className={clsx('h-4 w-4 transform transition-transform duration-300', { 'rotate-180': openMenu === item.title })} />
                    )}
                  </button>
                ) : (
                  <div className={clsx('text-xs font-semibold uppercase tracking-wider p-2 text-gray-400', { 'text-center': isCollapsed })}>
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                )}

                {/* Sub-menu container with animation */}
                <div
                  className={clsx(
                    'mt-1 space-y-1 overflow-hidden transition-[max-height] duration-500 ease-in-out', 
                    {
                      'max-h-96': isCollapsible && !isCollapsed && openMenu === item.title,
                      'max-h-0': isCollapsible && !isCollapsed && openMenu !== item.title,
                    }
                  )}
                >
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={clsx(
                        'flex items-center p-2 text-base rounded-lg transition-colors hover:bg-gray-100',
                        { 'justify-center': isCollapsed },
                        (pathname.startsWith(subItem.href) && subItem.href !== '/') || pathname === subItem.href
                          ? 'btn-side-menu-active text-white font-semibold'
                          : 'text-gray-600'
                      )}
                    >
                      <subItem.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3">{subItem.title}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center p-2 text-base rounded-lg transition-colors hover:bg-gray-100',
                  { 'justify-center': isCollapsed },
                  pathname === item.href
                    ? 'btn-side-menu-active text-white font-semibold'
                    : 'text-gray-600'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            ); 
          })}
        </nav>
      </aside>
    </>
  );
}
