import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Booking, Room } from '../types';
import { TIME_SLOTS } from '../constants';
import { cn, getRoomDotColor } from '../lib/utils';
import { Clock, User } from 'lucide-react';

interface WeekCalendarGridProps {
  currentDate: Date;
  bookings: Booking[];
  rooms: Room[];
  onTimeSlotClick: (date: string, time: string) => void;
  onBookingClick: (booking: Booking) => void;
}

export default function WeekCalendarGrid({ currentDate, bookings, rooms, onTimeSlotClick, onBookingClick }: WeekCalendarGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const now = new Date();
  const currentDayStr = format(now, 'yyyy-MM-dd');
  const currentTimeStr = format(now, 'HH:mm');

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Header: Days */}
      <div className="flex shrink-0 border-b border-slate-100 bg-slate-50 relative z-20">
        <div className="w-16 md:w-20 shrink-0 border-r border-slate-100 bg-slate-50 flex items-center justify-center text-[10px] md:text-xs font-bold text-slate-400">
          時間 Time
        </div>
        <div className="flex-1 flex min-w-0">
          {days.map(day => {
            const isToday = isSameDay(day, now);
            return (
              <div key={day.toString()} className="flex-1 min-w-[50px] py-2 md:py-3 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center gap-0.5 md:gap-1">
                <span className={cn("text-xs md:text-sm font-bold", isToday ? "text-indigo-600" : "text-slate-500")}>
                  {format(day, 'E')}
                </span>
                <span className={cn("text-sm md:text-lg font-extrabold w-7 h-7 flex items-center justify-center rounded-full leading-none", isToday ? "bg-indigo-600 text-white shadow-md" : "text-slate-800")}>
                  {format(day, 'd')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Time Slots & Days */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar z-10">
        <div className="flex relative min-h-[1440px]">
          {/* Time scale */}
          <div className="w-16 md:w-20 shrink-0 border-r border-slate-100 bg-white relative z-10">
            {TIME_SLOTS.map((time, i) => (
              <div key={time} className="h-[30px] border-b border-slate-50 text-right pr-2 md:pr-3 -mt-[1px]">
                 {i % 2 === 0 && (
                   <span className="text-[10px] md:text-xs font-bold text-slate-400 relative top-1">{time}</span>
                 )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex-1 flex min-w-0 relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 pointer-events-none">
              {TIME_SLOTS.map(time => (
                <div key={time} className="h-[30px] border-b border-slate-100/50 w-full" />
              ))}
            </div>

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayBookings = bookings.filter(b => b.date === dateStr);
              const isPastDay = dateStr < currentDayStr;

              return (
                <div key={dateStr} className="flex-1 border-r border-slate-100 last:border-r-0 relative group">
                  {/* Clickable background cells */}
                  {TIME_SLOTS.map((time) => {
                     const isPastSelection = isPastDay || (dateStr === currentDayStr && time < currentTimeStr);
                     return (
                        <div 
                          key={time}
                          onClick={() => !isPastSelection && onTimeSlotClick(dateStr, time)}
                          className={cn(
                            "h-[30px] w-full transition-colors",
                            isPastSelection ? "bg-slate-50/50 cursor-not-allowed" : "hover:bg-indigo-50/50 cursor-pointer"
                          )}
                        />
                     );
                  })}

                  {/* Render Bookings as absolutely positioned blocks */}
                  {dayBookings.map(booking => {
                    const startIndex = TIME_SLOTS.indexOf(booking.startTime);
                    const endIndex = TIME_SLOTS.indexOf(booking.endTime);
                    const top = startIndex * 30;
                    const height = (endIndex - startIndex) * 30;
                    const roomIndex = rooms.findIndex(r => r.id === booking.roomId);
                    const room = rooms[roomIndex];
                    if (!room) return null;

                    const widthPercentage = 100 / rooms.length;
                    const leftPercentage = roomIndex * widthPercentage;

                    const isPast = dateStr < currentDayStr || (dateStr === currentDayStr && booking.endTime <= currentTimeStr);

                    return (
                      <div
                        key={booking.id}
                        onClick={(e) => { e.stopPropagation(); onBookingClick(booking); }}
                        className={cn(
                          "absolute rounded-lg border border-white/80 p-1 md:p-1.5 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] z-20",
                          room.color,
                          isPast && "opacity-50 grayscale-[50%]"
                        )}
                        style={{ 
                          top: `${top}px`, 
                          height: `${height}px`,
                          left: `${leftPercentage}%`,
                          width: `${widthPercentage}%`
                        }}
                        title={`${booking.title}\n${booking.startTime} - ${booking.endTime}\n${room.name}\n${booking.userName}`}
                      >
                         <div className="flex items-center gap-1 mb-0.5 shrink-0">
                           <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm shrink-0", getRoomDotColor(room.color))} />
                           {height >= 30 && <span className="text-[9px] md:text-[10px] font-extrabold opacity-90 truncate">{booking.startTime}</span>}
                         </div>
                         <div className="text-[10px] md:text-sm font-bold leading-tight opacity-100 truncate">{booking.title}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
