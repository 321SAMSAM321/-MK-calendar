import { useState, useEffect } from 'react';

export type Holiday = {
  date: string;
  localName: string;
  name: string;
};

export function useHolidays(year: number) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      // Fetch for current, previous and next year to cover edge cases at the start/end of the year
      const yearsToFetch = [year - 1, year, year + 1];
      let allHolidays: Holiday[] = [];
      
      for (const y of yearsToFetch) {
        const cacheKey = `hk_holidays_${y}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          allHolidays = [...allHolidays, ...JSON.parse(cached)];
        } else {
          try {
            const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/HK`);
            if (res.ok) {
              const data = await res.json();
              localStorage.setItem(cacheKey, JSON.stringify(data));
              allHolidays = [...allHolidays, ...data];
            }
          } catch (e) {
            console.error(`Failed to fetch holidays for ${y}`, e);
          }
        }
      }
      
      // Deduplicate by date
      const uniqueHolidays = Array.from(new Map(allHolidays.map(item => [item.date, item])).values());
      setHolidays(uniqueHolidays);
    };
    
    fetchHolidays();
  }, [year]);

  return { holidays };
}
