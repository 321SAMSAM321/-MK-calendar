import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Booking, Room } from '../types';
import { cn, getRoomDotColor } from '../lib/utils';
import { Clock, MapPin, User } from 'lucide-react';
import { Holiday } from '../hooks/useHolidays';

interface MonthCalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
  rooms: Room[];
  holidays: Holiday[];
  onDayClick: (date: string) => void;
  onBookingClick: (booking: Booking) => void;
}

export default function MonthCalendarGrid({ currentDate, bookings, rooms, holidays, onDayClick, onBookingClick }: MonthCalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Create calendar grid including overflow days from previous/next months
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // week starts Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['一 (Mon)', '二 (Tue)', '三 (Wed)', '四 (Thu)', '五 (Fri)', '六 (Sat)', '日 (Sun)'];

  const now = new Date();
  const currentDayStr = format(now, 'yyyy-MM-dd');
  const currentTimeStr = format(now, 'HH:mm');

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 z-10">
         {weekDays.map(wd => (
            <div key={wd} className="py-3 text-center text-sm font-bold text-slate-500">
                {wd}
            </div>
         ))}
      </div>
      {/* Grid */}
      <div 
        className="grid grid-cols-7 flex-1 gap-2 p-2 bg-slate-50/50"
        style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(0, 1fr))` }}
      >
        {days.map(day => {
           const dayStr = format(day, 'yyyy-MM-dd');
           // Sort bookings chronologically by start time
           const dayBookings = bookings
             .filter(b => b.date === dayStr)
             .sort((a,b) => a.startTime.localeCompare(b.startTime));
             
           const dayHolidays = holidays.filter(h => h.date === dayStr);
             
           const isCurrentMonth = isSameMonth(day, monthStart);
           const isToday = isSameDay(day, new Date());
           const isHoliday = dayHolidays.length > 0;
           
           // If it's a holiday, day number might be red. 
           // Weekends or holidays can be colored differently.
           const isWeekend = day.getDay() === 0 || day.getDay() === 6;

           return (
              <div 
                key={dayStr} 
                onClick={() => onDayClick(dayStr)} 
                className={cn(
                  "p-2 md:p-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col overflow-hidden min-h-0 rounded-2xl border", 
                  isCurrentMonth ? "bg-white border-slate-100 shadow-sm" : "bg-white/60 border-slate-200/60 text-slate-400 opacity-70",
                  isToday && "ring-2 ring-indigo-300 border-indigo-200 bg-indigo-50/10"
                )}
              >
                  <div className="flex flex-col mb-2 shrink-0">
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full leading-none shrink-0", 
                          isToday ? "bg-indigo-500 text-white shadow-sm" : 
                            ((isHoliday || isWeekend) && isCurrentMonth ? "text-rose-500 bg-rose-50" :
                            (!isCurrentMonth ? "text-slate-400" : "text-slate-700"))
                        )}>
                           {format(day, 'd')}
                        </span>
                      </div>
                      
                      {/* Holidays Labels */}
                      {dayHolidays.map((holiday, idx) => (
                         <div key={idx} className="mt-1 text-xs font-bold text-rose-500/80 leading-tight truncate">
                            {holiday.localName || holiday.name}
                         </div>
                      ))}
                  </div>
                  
                  {/* Bookings Container */}
                  <div className="flex-1 flex flex-col overflow-y-auto space-y-1.5 pr-1 month-calendar-scrollbar min-h-0">
                     {dayBookings.map(booking => {
                        const room = rooms.find(r => r.id === booking.roomId);
                        if(!room) return null;
                        
                        const isPast = dayStr < currentDayStr || (dayStr === currentDayStr && booking.endTime <= currentTimeStr);
                        
                        return (
                           <div 
                             key={booking.id} 
                             onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                             className={cn(
                               "text-xs px-2.5 py-1.5 rounded-xl border border-white/50 truncate shadow-sm flex flex-col transition-transform hover:scale-[1.02]", 
                               room.color,
                               isPast && "opacity-50 grayscale-[50%]"
                             )}
                             title={`${booking.startTime} - ${booking.endTime}\n${booking.title}\n${booking.userName}`}
                           >
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <div className={cn("w-2 h-2 rounded-full shadow-sm shrink-0", getRoomDotColor(room.color))} />
                                <span className="font-extrabold whitespace-nowrap opacity-90">{booking.startTime}</span>
                              </div>
                              <span className="truncate opacity-100 font-bold leading-tight mt-0.5">{booking.title}</span>
                              <span className="truncate opacity-80 font-semibold text-[10px] mt-0.5 flex items-center gap-1">
                                <User size={10} />
                                {booking.userName}
                              </span>
                           </div>
                        )
                     })}
                  </div>
              </div>
           )
        })}
      </div>
    </div>
  )
}
