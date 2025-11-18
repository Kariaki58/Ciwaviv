'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  PackageSearch,
  CloudUpload
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admindashboard', icon: Home, current: true },
  { name: 'customer', href: '/admindashboard/customers', icon: Users, current: false },
  { name: 'Upload', href: '/admindashboard/product-upload', icon: CloudUpload, current: false },
  { name: 'Products', href: '/admindashboard/product', icon: PackageSearch, current: false },
  { name: 'Orders', href: '/admindashboard/orders', icon: Package, current: false },
  { name: 'Settings', href: '/admindashboard/settings', icon: Settings, current: false },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on medium screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      className={`
        sidebar-transition 
        bg-gray-800 
        border-r 
        border-gray-700 
        flex 
        flex-col
        fixed
        left-0
        top-0
        h-screen
        z-50
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Dashboard</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`
                flex 
                items-center 
                px-3 
                py-2 
                text-sm 
                font-medium 
                rounded-lg 
                transition-colors 
                group
                ${item.current
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } 
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.name : ''}
            >
              <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && item.name}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </a>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-gray-700 ${collapsed ? 'text-center' : ''}`}>
        <div className="flex items-center space-x-3">
          <img
            className="w-8 h-8 rounded-full"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
            alt="User profile"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Ciwaviv</p>
              <p className="text-sm text-gray-400 truncate">admin@ciwaviv.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}