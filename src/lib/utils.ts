import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoomDotColor(colorStr: string) {
  if (colorStr.includes('blue')) return 'bg-blue-400';
  if (colorStr.includes('cyan')) return 'bg-cyan-400';
  if (colorStr.includes('teal')) return 'bg-teal-400';
  if (colorStr.includes('emerald')) return 'bg-emerald-400';
  if (colorStr.includes('amber')) return 'bg-amber-400';
  if (colorStr.includes('orange')) return 'bg-orange-400';
  if (colorStr.includes('rose')) return 'bg-rose-400';
  if (colorStr.includes('pink')) return 'bg-pink-400';
  if (colorStr.includes('purple')) return 'bg-purple-400';
  if (colorStr.includes('indigo')) return 'bg-indigo-400';
  if (colorStr.includes('slate')) return 'bg-slate-400';
  return 'bg-gray-400';
}
