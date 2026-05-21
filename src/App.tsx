import React, { useState, useEffect } from 'react';
import { format, startOfMonth, addMonths, subMonths, isSameDay, parseISO, addDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, MapPin, Calendar as CalendarIcon, Clock, Users, Bell, Menu, X } from 'lucide-react';
import { ROOMS, TIME_SLOTS } from './constants';
import { Booking, Room } from './types';
import { cn } from './lib/utils';
import DashboardSidebar from './components/Sidebar';
import BookingModal from './components/BookingModal';
import BookingDetailsModal from './components/BookingDetailsModal';
import MonthCalendarGrid from './components/MonthCalendarGrid';
import WeekCalendarGrid from './components/WeekCalendarGrid';
import RoomManagerModal from './components/RoomManagerModal';
import { useHolidays } from './hooks/useHolidays';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

// No initial dummy data since we are connected to Firebase.

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { holidays } = useHolidays(currentDate.getFullYear());
  
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [roomsLoaded, setRoomsLoaded] = useState(false);
  
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Seed rooms to Firestore if none exist.
  useEffect(() => {
    if (roomsLoaded && rooms.length === 0) {
      ROOMS.forEach(room => {
        setDoc(doc(db, 'rooms', room.id), room).catch(console.error);
      });
    }
  }, [roomsLoaded, rooms.length]);

  useEffect(() => {
    // Real-time synchronization for rooms
    const unsubscribeRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(roomsData);
      setRoomsLoaded(true);

      // Keep selectedRooms valid based on available rooms
      setSelectedRooms(prev => {
        if (prev.length === 0 && roomsData.length > 0) return roomsData.map(r => r.id);
        const activeIds = roomsData.map(r => r.id);
        const filtered = prev.filter(id => activeIds.includes(id));
        return filtered.length > 0 ? filtered : activeIds;
      });
    }, (error) => {
      console.error('Firestore Error sync rooms: ', error);
    });

    // Real-time synchronization for bookings
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(bookingsData);
    }, (error) => {
      console.error('Firestore Error: ', error);
    });

    return () => {
      unsubscribeRooms();
      unsubscribe();
    };
  }, []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('week');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{date: string, time: string, roomId?: string} | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const todayBookings = bookings.filter(b => b.date === format(new Date(), 'yyyy-MM-dd')).sort((a, b) => a.startTime.localeCompare(b.startTime));

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('app_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('app_selected_rooms', JSON.stringify(selectedRooms));
  }, [selectedRooms]);

  const handleSaveBooking = (newBooking: Booking) => {
    // Conflict Check (exclude current booking being edited)
    const hasConflict = bookings.some(b => {
      if (editingBooking && b.id === editingBooking.id) return false;
      if (b.roomId !== newBooking.roomId) return false;
      if (b.date !== newBooking.date) return false;
      
      // Check time overlap: (StartA < EndB) and (EndA > StartB)
      return (newBooking.startTime < b.endTime) && (newBooking.endTime > b.startTime);
    });

    if (hasConflict) {
      return false;
    }

    if (editingBooking) {
      setDoc(doc(db, 'bookings', editingBooking.id), newBooking).catch(console.error);
    } else {
      setDoc(doc(db, 'bookings', newBooking.id), newBooking).catch(console.error);
    }
    
    setIsModalOpen(false);
    setEditingBooking(null);
    return true;
  };

  const handleDeleteBooking = (bookingId: string) => {
    deleteDoc(doc(db, 'bookings', bookingId)).catch(console.error);
    setSelectedBookingForDetails(null);
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleUpdateRooms = (updatedRooms: Room[]) => {
    // Determine which rooms were added/updated and which were deleted
    const currentRoomIds = rooms.map(r => r.id);
    const updatedRoomIds = updatedRooms.map(r => r.id);

    const roomsToDelete = currentRoomIds.filter(id => !updatedRoomIds.includes(id));
    
    // Delete removed rooms from Firestore
    roomsToDelete.forEach(id => {
      deleteDoc(doc(db, 'rooms', id)).catch(console.error);
    });

    // Add or Update rooms in Firestore
    updatedRooms.forEach(room => {
      setDoc(doc(db, 'rooms', room.id), room).catch(console.error);
    });

    // Note: State will be updated automatically via the onSnapshot listener, 
    // but we can still calculate activeIds for the selectedRooms.
    const activeIds = updatedRooms.map(r => r.id);
    setSelectedRooms(prev => {
      const filtered = prev.filter(id => activeIds.includes(id));
      const newIds = activeIds.filter(id => !rooms.map(r=>r.id).includes(id));
      return [...filtered, ...newIds];
    });
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <DashboardSidebar 
          rooms={rooms}
          selectedRooms={selectedRooms}
          onToggleRoom={toggleRoom}
          onSelectAllRooms={() => setSelectedRooms(rooms.map(r => r.id))}
          onClearAllRooms={() => setSelectedRooms([])}
          onNewBooking={() => {
            setSelectedTimeSlot(null);
            setIsModalOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          onManageRooms={() => {
             setIsRoomManagerOpen(true);
             setIsMobileSidebarOpen(false);
          }}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-3xl -z-10 translate-y-1/3 -translate-x-1/4"></div>

        {/* Header */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 bg-white/80 rounded-xl shadow-sm border border-slate-200"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight hidden sm:block">旺角社區客廳房間預約</h1>
            <div className="flex items-center bg-white border border-slate-200/60 rounded-full p-1 sm:ml-6 shadow-sm">
              <button 
                onClick={() => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))}
                className="p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors"
                title={viewMode === 'week' ? "上一週 (Previous Week)" : "上一個月 (Previous Month)"}
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <span className="px-5 font-bold text-base min-w-[170px] text-center text-slate-700">
                {viewMode === 'week'
                  ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MM.dd')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MM.dd')}`
                  : format(currentDate, 'MMMM yyyy')}
              </span>
              <button 
                onClick={() => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))}
                className="p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors"
                title={viewMode === 'week' ? "下一週 (Next Week)" : "下一個月 (Next Month)"}
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full ml-2 transition-colors hidden sm:block"
            >
              返回本日 (Today)
            </button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-5">
             <div className="flex bg-slate-100/50 p-1 rounded-xl mr-2">
                <button
                   onClick={() => setViewMode('month')}
                   className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-colors", viewMode === 'month' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                   月 (Month)
                </button>
                <button
                   onClick={() => setViewMode('week')}
                   className={cn("px-4 py-1.5 text-sm font-bold rounded-lg transition-colors hidden sm:block", viewMode === 'week' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                   週 (Week)
                </button>
             </div>
             <div className="relative">
               <button 
                 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                 className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
               >
                  <Bell size={22} strokeWidth={2.0} />
                  {todayBookings.length > 0 && (
                    <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white"></span>
                  )}
               </button>
               
               {isNotificationsOpen && (
                 <>
                   <div 
                     className="fixed inset-0 z-40" 
                     onClick={() => setIsNotificationsOpen(false)}
                   />
                   <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                     <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                       <h3 className="font-bold text-slate-800">今日活動 (Today's Events)</h3>
                       <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{todayBookings.length}</span>
                     </div>
                     <div className="max-h-[60vh] overflow-y-auto">
                       {todayBookings.length > 0 ? (
                         <div className="divide-y divide-slate-50">
                           {todayBookings.map(booking => {
                             const room = rooms.find(r => r.id === booking.roomId);
                             return (
                               <div 
                                 key={booking.id} 
                                 className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                 onClick={() => {
                                   setSelectedBookingForDetails(booking);
                                   setIsNotificationsOpen(false);
                                 }}
                               >
                                 <div className="flex justify-between items-start mb-1">
                                   <h4 className="font-bold text-slate-800 truncate pr-2">{booking.title}</h4>
                                   <span className="text-xs font-bold text-slate-500 shrink-0">{booking.startTime}</span>
                                 </div>
                                 <div className="flex items-center text-xs text-slate-500 gap-3">
                                   <div className="flex items-center gap-1">
                                     <MapPin size={12} className="text-slate-400" />
                                     <span className="truncate max-w-[100px]">{room?.name || '未知空間'}</span>
                                   </div>
                                   <div className="flex items-center gap-1 min-w-0">
                                     <Users size={12} className="text-slate-400" />
                                     <span className="truncate">{booking.userName}</span>
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       ) : (
                         <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                           <Clock size={24} className="mb-2 text-slate-300" />
                           今日沒有已預約的活動
                           <br/>
                           (No events today)
                         </div>
                       )}
                     </div>
                   </div>
                 </>
               )}
             </div>
             <div className="w-10 h-10 bg-indigo-100 border-2 border-white shadow-sm rounded-full text-indigo-700 flex items-center justify-center font-bold text-base">
                U
             </div>
          </div>
        </header>

        {/* Calendar Grid Container */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
           <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[600px]">
              {viewMode === 'month' ? (
                <MonthCalendarGrid 
                  currentDate={currentDate}
                  bookings={bookings.filter(b => selectedRooms.includes(b.roomId))}
                  rooms={rooms}
                  holidays={holidays}
                  onDayClick={(date) => {
                     setSelectedTimeSlot({ date, time: '09:00' });
                     setIsModalOpen(true);
                  }}
                  onBookingClick={(booking) => {
                     setSelectedBookingForDetails(booking);
                  }}
                />
              ) : (
                <WeekCalendarGrid 
                  currentDate={currentDate}
                  bookings={bookings.filter(b => selectedRooms.includes(b.roomId))}
                  rooms={rooms.filter(r => selectedRooms.includes(r.id))}
                  onTimeSlotClick={(date, time) => {
                     const roomId = selectedRooms.length > 0 ? selectedRooms[0] : undefined;
                     setSelectedTimeSlot({ date, time, roomId });
                     setIsModalOpen(true);
                  }}
                  onBookingClick={(booking) => {
                     setSelectedBookingForDetails(booking);
                  }}
                />
              )}
           </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isModalOpen && (
        <BookingModal 
          isOpen={isModalOpen}
          rooms={rooms}
          bookings={bookings}
          initialDate={selectedTimeSlot?.date}
          initialTime={selectedTimeSlot?.time}
          initialRoomId={selectedTimeSlot?.roomId}
          editingBooking={editingBooking}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBooking(null);
          }}
          onSave={handleSaveBooking}
        />
      )}

      {/* Booking Details Modal (For Canceling) */}
      <BookingDetailsModal
         isOpen={!!selectedBookingForDetails}
         booking={selectedBookingForDetails}
         room={rooms.find(r => r.id === selectedBookingForDetails?.roomId) || null}
         onClose={() => setSelectedBookingForDetails(null)}
         onDelete={handleDeleteBooking}
         onEdit={(booking) => {
            setEditingBooking(booking);
            setSelectedBookingForDetails(null);
            setIsModalOpen(true);
         }}
      />

      {/* Room Manager Modal */}
      {isRoomManagerOpen && (
        <RoomManagerModal
          isOpen={isRoomManagerOpen}
          rooms={rooms}
          onClose={() => setIsRoomManagerOpen(false)}
          onUpdateRooms={handleUpdateRooms}
        />
      )}
    </div>
  );
}
