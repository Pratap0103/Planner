import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Settings,
  LogOut as LogOutIcon,
  X,
  Users,
  LayoutGrid,
  Calendar,
  CalendarDays,
  Sparkles,
  BarChart2,
  ListTodo
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const adminMenuItems = [
    { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { path: '/planner', icon: Calendar, label: 'Today' },
    { path: '/all-tasks', icon: ListTodo, label: 'All Tasks' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/index', icon: LayoutGrid, label: 'Recurring Tasks' },
    { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const employeeMenuItems = [
    { path: '/dashboard', icon: BarChart2, label: 'Dashboard' },
    { path: '/planner', icon: Calendar, label: 'Planner' },
    { path: '/all-tasks', icon: ListTodo, label: 'All Tasks' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/index', icon: LayoutGrid, label: 'Recurring Tasks' },
    { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
  ];

  const menuItems = user?.role === 'ADMIN' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 sm:w-72 lg:w-56 2xl:w-60 bg-white border-r border-indigo-100 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-indigo-600 tracking-tight">Botivate</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-indigo-100/50 rounded-lg">
              <X size={20} className="text-indigo-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            {menuItems.map((item, idx) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                  ${isActive
                    ? 'bg-indigo-100/50 text-indigo-600 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-indigo-50/50 hover:text-indigo-600 border-l-4 border-transparent'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                  <span className="text-sm font-semibold leading-tight whitespace-nowrap">{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-indigo-100 bg-indigo-50/50">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white transition-all font-semibold shadow-sm"
            >
              <LogOutIcon size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;