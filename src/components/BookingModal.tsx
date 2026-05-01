import React, { useState, useEffect } from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { TIME_SLOTS } from '../constants';
import { Booking, Room } from '../types';
import { format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  initialDate?: string;
  initialTime?: string;
  initialRoomId?: string;
  rooms: Room[];
  bookings: Booking[];
  editingBooking?: Booking | null;
  onClose: () => void;
  onSave: (booking: Booking) => boolean;
}

export default function BookingModal({ isOpen, initialDate, initialTime, initialRoomId, rooms, bookings, editingBooking, onClose, onSave }: BookingModalProps) {
  const [formData, setFormData] = useState({
    roomId: rooms.length > 0 ? rooms[0].id : '',
    userName: '',
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    remarks: ''
  });
  
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        roomId: editingBooking.roomId,
        userName: editingBooking.userName,
        title: editingBooking.title,
        date: editingBooking.date,
        startTime: editingBooking.startTime,
        endTime: editingBooking.endTime,
        remarks: editingBooking.remarks || ''
      });
    } else {
      setFormData({
        roomId: initialRoomId || (rooms.length > 0 ? rooms[0].id : ''),
        userName: '',
        title: '',
        date: initialDate || format(new Date(), 'yyyy-MM-dd'),
        startTime: initialTime || '09:00',
        endTime: initialTime ? TIME_SLOTS[Math.min(TIME_SLOTS.indexOf(initialTime) + 2, TIME_SLOTS.length - 1)] : '10:00',
        remarks: ''
      });
    }
  }, [editingBooking, initialDate, initialTime, initialRoomId, rooms, isOpen]);

  const startIndex = TIME_SLOTS.indexOf(formData.startTime);
  const endIndex = TIME_SLOTS.indexOf(formData.endTime);
  const durationSlots = endIndex - startIndex;
  
  const isInvalidTimeRange = startIndex >= endIndex;

  const hasConflict = !isInvalidTimeRange && bookings.some(b => {
    if (editingBooking && b.id === editingBooking.id) return false;
    return b.roomId === formData.roomId && 
           b.date === formData.date && 
           formData.startTime < b.endTime && 
           formData.endTime > b.startTime;
  });

  const handleStartTimeChange = (newStartTime: string) => {
    const newStartIndex = TIME_SLOTS.indexOf(newStartTime);
    const currentEndIndex = TIME_SLOTS.indexOf(formData.endTime);
    
    // Smart time selection: if new start is after current end, or duration is negative, push end time forward
    if (newStartIndex >= currentEndIndex) {
      const nextEndIndex = Math.min(newStartIndex + 2, TIME_SLOTS.length - 1); // Default to 1 hr later
      setFormData(prev => ({ ...prev, startTime: newStartTime, endTime: TIME_SLOTS[nextEndIndex] }));
    } else {
      setFormData(prev => ({ ...prev, startTime: newStartTime }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isInvalidTimeRange || hasConflict) {
       return;
    }

    const newBooking: Booking = {
      id: editingBooking ? editingBooking.id : Math.random().toString(36).substr(2, 9),
      ...formData
    };

    onSave(newBooking);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {editingBooking ? '修改預約 (Edit Booking)' : '新增預約 (New Booking)'}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-white p-2 rounded-full transition-colors shadow-sm"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 relative">
          <form id="booking-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">房間 (Room) *</label>
              <select 
                required
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all cursor-pointer"
                value={formData.roomId}
                onChange={e => setFormData({...formData, roomId: e.target.value})}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">會議主題 (Meeting Title) *</label>
              <input 
                required
                type="text"
                placeholder="e.g. Project Sync"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">預約人姓名 (Your Name) *</label>
              <input 
                required
                type="text"
                placeholder="e.g. John Doe"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all"
                value={formData.userName}
                onChange={e => setFormData({...formData, userName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">日期 (Date) *</label>
              <input 
                required
                type="date"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all cursor-pointer"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">開始 (Start) *</label>
                <select 
                  required
                  className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all cursor-pointer"
                  value={formData.startTime}
                  onChange={e => handleStartTimeChange(e.target.value)}
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">結束 (End) *</label>
                <select 
                  required
                  className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all cursor-pointer"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">備註細節 (Remarks)</label>
              <textarea 
                rows={2}
                placeholder="額外需求或說明 (Optional)"
                className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm font-semibold text-slate-800 bg-slate-50/50 transition-all resize-none custom-scrollbar"
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>

            {hasConflict && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>此時段已被預約，請選擇其他時間或是房間。(This time slot is already booked.)</span>
              </div>
            )}
            {isInvalidTimeRange && (
              <div className="text-orange-500 text-sm font-bold bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>結束時間必須晚於開始時間。(End time must be after start time.)</span>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white">
           <button
             type="button"
             onClick={onClose}
             className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
           >
             取消 (Cancel)
           </button>
           <button
             type="submit"
             form="booking-form"
             disabled={isInvalidTimeRange || hasConflict}
             className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm rounded-2xl shadow-sm hover:shadow-[0_4px_12px_theme('colors.indigo.200')] hover:-translate-y-0.5 transition-all"
           >
             確認預約 (Confirm)
           </button>
        </div>
      </div>
    </div>
  );
}
