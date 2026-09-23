import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet, LayoutDashboard, List, BarChart3, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-surface-200" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2" aria-label="Expense Tracker Home">
              <Wallet className="w-7 h-7 text-primary-600" aria-hidden="true" />
              <span className="font-bold text-xl tracking-tight text-surface-900">ExpenseTracker</span>
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isActive ? 'text-primary-600 bg-primary-50' : 'text-surface-700 hover:text-primary-600'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/expenses"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isActive ? 'text-primary-600 bg-primary-50' : 'text-surface-700 hover:text-primary-600'
                    }`
                  }
                >
                  <List className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  Expenses
                </NavLink>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                      isActive ? 'text-primary-600 bg-primary-50' : 'text-surface-700 hover:text-primary-600'
                    }`
                  }
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  Reports
                </NavLink>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-surface-600">
                <User className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{user.username}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 min-h-[44px]"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Mobile nav */}
      {user && (
        <div className="md:hidden border-t border-surface-200 pb-safe">
          <div className="flex justify-around py-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-xs font-medium transition-colors min-h-[44px] min-w-[64px] flex flex-col items-center gap-0.5 ${
                  isActive ? 'text-primary-600' : 'text-surface-500'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
              Dashboard
            </NavLink>
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-xs font-medium transition-colors min-h-[44px] min-w-[64px] flex flex-col items-center gap-0.5 ${
                  isActive ? 'text-primary-600' : 'text-surface-500'
                }`
              }
            >
              <List className="w-5 h-5" aria-hidden="true" />
              Expenses
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-xs font-medium transition-colors min-h-[44px] min-w-[64px] flex flex-col items-center gap-0.5 ${
                  isActive ? 'text-primary-600' : 'text-surface-500'
                }`
              }
            >
              <BarChart3 className="w-5 h-5" aria-hidden="true" />
              Reports
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
