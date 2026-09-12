import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, PlusCircle } from 'lucide-react';
import { cn } from '@/src/utils/cn';

export const AppLayout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Complaints', href: '/complaints', icon: FileText },
    { name: 'Log Complaint', href: '/log-complaint', icon: PlusCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-bold text-blue-700 tracking-tight">AIVOA QMS</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-4">
          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-5 w-5 flex-shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                QA
             </div>
             <span className="text-sm font-medium text-gray-700">QA Manager</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
