
import React from 'react';
import { User, UserRole } from '../types';
import { X, Settings, LogOut, UserCircle, PlusCircle, Store } from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onCreateShop: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, user, onLogout, onCreateShop }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 overflow-hidden z-[100]">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="absolute inset-y-0 right-0 max-w-full flex pointer-events-none">
        <div className="w-full max-w-[300px] bg-white shadow-2xl pointer-events-auto transform transition-transform flex flex-col h-full">
          {/* Header */}
          <div className="h-40 bg-emerald-700 p-6 flex flex-col justify-end text-white relative shrink-0">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-emerald-600 rounded-full">
               <X className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full">
                    <UserCircle className="h-10 w-10 text-emerald-700" />
                </div>
                <div>
                    <h2 className="text-lg font-bold truncate max-w-[150px]">{user.name}</h2>
                    <p className="text-emerald-200 text-xs">@{user.username}</p>
                </div>
            </div>
            <div className="absolute top-4 left-4 bg-emerald-900/30 px-2 py-0.5 rounded text-xs font-mono uppercase">
                {user.role}
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-6 flex-1 overflow-y-auto">
             {/* Personal Info */}
             <div className="space-y-1">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Information</h3>
                 <div className="py-2 border-b border-gray-100 text-sm text-gray-700">
                     <p><span className="font-medium">User ID:</span> {user.id}</p>
                     <p><span className="font-medium">Joined:</span> {new Date().toLocaleDateString()}</p>
                 </div>
             </div>

             {/* Actions */}
             <div className="space-y-2">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</h3>
                 
                 {user.role === UserRole.OWNER && (
                     <button 
                        onClick={() => { onClose(); onCreateShop(); }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors text-left"
                     >
                        <PlusCircle className="h-5 w-5" />
                        <span className="font-medium">Setup New Store</span>
                     </button>
                 )}

                 <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors text-left">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Settings</span>
                 </button>
                 
                 <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors text-left">
                    <Store className="h-5 w-5" />
                    <span className="font-medium">About GroceryNet</span>
                 </button>
             </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 text-red-600 font-bold py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
