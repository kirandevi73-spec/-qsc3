import React from 'react';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ toggleSidebar }) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="flex h-16 shrink-0 w-full items-center justify-between border-b border-white/5 glass px-4 md:px-6 lg:px-8 relative z-30">
      <button
        onClick={toggleSidebar}
        className="text-gray-400 hover:text-white lg:hidden"
      >
        <Menu size={24} />
      </button>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="hidden sm:flex items-center gap-4 text-sm font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Mainnet
          </div>
          <div className="h-4 w-px bg-gray-700"></div>
          <div>Block: <span className="text-neon-cyan">18,492,301</span></div>
        </div>
        
        <div className="h-6 w-px bg-gray-700 hidden sm:block mx-2"></div>
        
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
              <UserCircle size={16} className="text-neon-cyan" />
              <span className="font-mono truncate max-w-[150px]">
                {user.type === 'wallet' && user.address
                  ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` 
                  : user.email}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
