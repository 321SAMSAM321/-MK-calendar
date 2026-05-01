import { Room } from './types';

export const ROOMS: Room[] = [
  { id: 'room-a', name: '大房 (Large Room)', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'room-b', name: '中房 (Medium Room)', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'counseling-a', name: '輔導室 (Counseling)', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'activity-hall', name: '活動廳 (Activity Hall)', color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

export const PRESET_COLORS = [
  'bg-slate-100 border-slate-300 text-slate-700',
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-cyan-50 border-cyan-200 text-cyan-700',
  'bg-teal-50 border-teal-200 text-teal-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-orange-50 border-orange-200 text-orange-700',
  'bg-rose-50 border-rose-200 text-rose-700',
  'bg-pink-50 border-pink-200 text-pink-700',
  'bg-purple-50 border-purple-200 text-purple-700',
  'bg-indigo-50 border-indigo-200 text-indigo-700',
];

export const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});
