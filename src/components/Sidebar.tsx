import React from 'react';
import { Room } from '../types';
import { Plus, Check, Filter, Settings, CheckSquare, Square, X } from 'lucide-react';
import { cn, getRoomDotColor } from '../lib/utils';

interface SidebarProps {
  rooms: Room[];
  selectedRooms: string[];
  onToggleRoom: (id: string) => void;
  onSelectAllRooms: () => void;
  onClearAllRooms: () => void;
  onNewBooking: () => void;
  onManageRooms: () => void;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({ 
  rooms, 
  selectedRooms, 
  onToggleRoom, 
  onSelectAllRooms,
  onClearAllRooms,
  onNewBooking, 
  onManageRooms,
  onCloseMobile
}: SidebarProps) {
  const allSelected = rooms.length > 0 && selectedRooms.length === rooms.length;

  return (
    <aside className="w-64 h-full bg-[#F8FAFC]/95 border-r border-slate-100 text-slate-800 flex flex-col shrink-0 backdrop-blur-3xl shadow-2xl md:shadow-none">
      <div className="p-6 border-b border-slate-100/80">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <CalendarIcon />
            </div>
            <span className="tracking-tight text-lg">旺角社區客廳</span>
          </div>
          {onCloseMobile && (
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 bg-slate-50/50 rounded-xl"
              onClick={onCloseMobile}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        <button 
          onClick={onNewBooking}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_theme('colors.indigo.200')] hover:shadow-[0_6px_16px_theme('colors.indigo.300')] hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} strokeWidth={3} />
          <span>新增預約 (New)</span>
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
            <Filter size={16} strokeWidth={2.5} />
            <span>房間篩選 (Rooms)</span>
          </div>
          <button 
            onClick={onManageRooms}
            className="text-slate-400 hover:text-indigo-500 hover:rotate-90 transition-all p-1"
            title="管理房間 (Manage Rooms)"
          >
            <Settings size={18} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <button 
            onClick={allSelected ? onClearAllRooms : onSelectAllRooms}
            className="flex flex-1 items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-lg transition-colors"
          >
            {allSelected ? (
              <><Square size={12} strokeWidth={2.5}/> 清除 (Clear All)</>
            ) : (
              <><CheckSquare size={12} strokeWidth={2.5}/> 全選 (Select All)</>
            )}
          </button>
        </div>
        
        <div className="space-y-3 pb-8">
          {rooms.map(room => {
            const isSelected = selectedRooms.includes(room.id);
            // Extract a simpler background color for the dot from the room's color class
            const dotColor = getRoomDotColor(room.color);

            return (
              <button
                key={room.id}
                onClick={() => onToggleRoom(room.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left font-semibold",
                  isSelected ? "bg-white text-slate-800 shadow-sm border border-slate-100" : "hover:bg-slate-100/50 text-slate-500"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  isSelected ? "bg-indigo-400 border-indigo-400" : "border-slate-300 bg-slate-50"
                )}>
                  {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
                </div>
                <div className={cn("w-3 h-3 rounded-full shrink-0 shadow-sm", dotColor)} />
                <span className="text-sm truncate">{room.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  );
}

// Simple internal icon for sidebar
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
