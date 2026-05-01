import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Trash2, Edit2, FileText } from 'lucide-react';
import { Booking, Room } from '../types';
import { getRoomDotColor } from '../lib/utils';

interface BookingDetailsModalProps {
  isOpen: boolean;
  booking: Booking | null;
  room: Room | null;
  onClose: () => void;
  onDelete: (bookingId: string) => void;
  onEdit: (booking: Booking) => void;
}

export default function BookingDetailsModal({ isOpen, booking, room, onClose, onDelete, onEdit }: BookingDetailsModalProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen || !booking || !room) {
    if (isConfirmingDelete) setIsConfirmingDelete(false);
    return null;
  }

  const handleClose = () => {
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">預約詳情 (Booking Details)</h2>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-white p-2 rounded-full transition-colors shadow-sm"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
             <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-3 h-3 rounded-full shrink-0 shadow-sm ${getRoomDotColor(room.color)}`} />
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-0.5">房間 (Room)</div>
                   <div className="font-bold text-slate-800">{room.name}</div>
                </div>
             </div>

             <div className="flex items-start gap-3">
                <CalendarIcon size={16} className="mt-0.5 text-slate-400 shrink-0" />
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-0.5">日期與時間 (Date & Time)</div>
                   <div className="font-bold text-slate-800">{booking.date}</div>
                   <div className="font-semibold text-slate-600">{booking.startTime} - {booking.endTime}</div>
                </div>
             </div>

             <div className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 text-slate-400 shrink-0" />
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-0.5">會議主題 (Meeting Title)</div>
                   <div className="font-bold text-slate-800">{booking.title}</div>
                </div>
             </div>

             <div className="flex items-start gap-3">
                <User size={16} className="mt-0.5 text-slate-400 shrink-0" />
                <div>
                   <div className="text-sm font-bold text-slate-500 mb-0.5">預約人姓名 (Name)</div>
                   <div className="font-bold text-slate-800">{booking.userName}</div>
                </div>
             </div>

             {booking.remarks && (
               <div className="flex items-start gap-3">
                  <FileText size={16} className="mt-0.5 text-slate-400 shrink-0" />
                  <div>
                     <div className="text-sm font-bold text-slate-500 mb-0.5">備註細節 (Remarks)</div>
                     <div className="font-medium text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">{booking.remarks}</div>
                  </div>
               </div>
             )}
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
             {isConfirmingDelete ? (
               <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col gap-3 animate-in fade-in zoom-in-95">
                 <span className="text-sm font-bold text-red-600 text-center">確定要取消這個預約嗎？(Are you sure?)</span>
                 <div className="flex justify-between gap-2">
                   <button
                     onClick={() => setIsConfirmingDelete(false)}
                     className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                   >
                     返回 (Back)
                   </button>
                   <button
                     onClick={() => {
                        setIsConfirmingDelete(false);
                        onDelete(booking.id);
                     }}
                     className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-[0_4px_12px_theme('colors.red.200')]"
                   >
                     確定取消 (Confirm)
                   </button>
                 </div>
               </div>
             ) : (
               <div className="flex justify-between gap-3">
                 <button
                   onClick={() => setIsConfirmingDelete(true)}
                   className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
                 >
                   <Trash2 size={16} strokeWidth={2.5} />
                   取消預約 (Cancel Booking)
                 </button>
                 
                 <div className="flex gap-2">
                   <button
                     onClick={() => onEdit(booking)}
                     className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-colors"
                   >
                     <Edit2 size={16} strokeWidth={2.5} />
                     修改 (Edit)
                   </button>
                   <button
                     onClick={handleClose}
                     className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
                   >
                     關閉 (Close)
                   </button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
