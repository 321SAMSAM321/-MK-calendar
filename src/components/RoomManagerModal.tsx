import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Room } from '../types';
import { PRESET_COLORS } from '../constants';
import { cn, getRoomDotColor } from '../lib/utils';

interface RoomManagerModalProps {
  isOpen: boolean;
  rooms: Room[];
  onClose: () => void;
  onUpdateRooms: (rooms: Room[]) => void;
}

export default function RoomManagerModal({ isOpen, rooms, onClose, onUpdateRooms }: RoomManagerModalProps) {
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomColor, setNewRoomColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom: Room = {
      id: `room-${Math.random().toString(36).substr(2, 9)}`,
      name: newRoomName.trim(),
      color: newRoomColor,
    };

    setLocalRooms([...localRooms, newRoom]);
    setNewRoomName('');
  };

  const handleRemoveRoom = (id: string) => {
    setLocalRooms(localRooms.filter(r => r.id !== id));
  };

  const handleSave = () => {
    onUpdateRooms(localRooms);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">房間管理 (Room Management)</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-white p-2 rounded-full transition-colors shadow-sm"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6">
          {/* Room List */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3 block">現有房間 (Existing Rooms)</h3>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {localRooms.length === 0 && (
                <div className="text-sm font-bold text-slate-400 text-center py-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  尚無房間 (No rooms added yet)
                </div>
              )}
              {localRooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-slate-100 bg-white shadow-sm hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-4 h-4 rounded-full border border-slate-900/5 shadow-sm", getRoomDotColor(room.color))} />
                    <span className="text-sm font-bold text-slate-700">{room.name}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveRoom(room.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="移除房間 (Remove Room)"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Room Form */}
          <form onSubmit={handleAddRoom} className="bg-slate-50/50 p-5 rounded-2xl border-2 border-slate-100">
             <h3 className="text-sm font-bold text-slate-700 mb-3">新增房間 (Add New Room)</h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1.5">房間名稱 (Room Name)</label>
                   <input 
                     required
                     type="text"
                     placeholder="e.g. 會議室 C (Meeting Room C)"
                     className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-white transition-all"
                     value={newRoomName}
                     onChange={e => setNewRoomName(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-2.5">選擇顏色識別 (Choose Color Theme)</label>
                   <div className="flex flex-wrap gap-3">
                      {PRESET_COLORS.map(colorClass => {
                         // Extract bg color class for display
                         const isSelected = newRoomColor === colorClass;
                         const bgDisplayClass = getRoomDotColor(colorClass);
                         
                         return (
                            <button
                               key={colorClass}
                               type="button"
                               onClick={() => setNewRoomColor(colorClass)}
                               className={cn(
                                  "w-9 h-9 rounded-full border-2 transition-transform",
                                  bgDisplayClass,
                                  isSelected ? "border-indigo-400 scale-110 shadow-md ring-2 ring-white" : "border-transparent hover:scale-105 shadow-sm"
                               )}
                               title="Select Color"
                            />
                         );
                      })}
                   </div>
                </div>
                <div className="pt-2">
                   <button
                     type="submit"
                     className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-indigo-400 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm hover:translate-y-[-1px] active:translate-y-0"
                   >
                     <Plus size={18} strokeWidth={3} /> 增加房間 (Add Room)
                   </button>
                </div>
             </div>
          </form>

          <div className="pt-6 mt-6 flex justify-end gap-3 border-t border-slate-100">
             <button
               onClick={onClose}
               className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
             >
               取消 (Cancel)
             </button>
             <button
               onClick={handleSave}
               className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
             >
               儲存設定 (Save Changes)
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
