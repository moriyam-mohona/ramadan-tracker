import { useState, useEffect } from 'react';

type PrayerTimes = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
};

type PrayerData = {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: {
      date: string;
      month: {
        en: string;
        ar: string;
      };
      year: string;
    };
  };
  meta: {
      timezone: string;
  }
};

type NextPrayer = {
    name: string;
    time: string;
    timeLeft: string; 
    isIftar: boolean;
    isSehri: boolean;
}

export function usePrayerTimes() {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [city, setCity] = useState<string>("Locating...");

  // 1. Get Geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError("Unable to retrieve your location. Please enable location access.");
        setLoading(false);
      }
    );
  }, []);

  // 2. Fetch Prayer Times
  useEffect(() => {
    if (location) {
        const fetchTimes = async () => {
            try {
                // Fetch times
                const date = new Date();
                const timestamp = Math.floor(date.getTime() / 1000);
                const res = await fetch(
                    `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${location.lat}&longitude=${location.lng}&method=1&school=1` // Method 1: Muslim World League, School 1: Hanafi (Common in BD/South Asia) - Adjust if needed
                );
                const data = await res.json();
                if (data.code === 200) {
                    setPrayerData(data.data);
                } else {
                    setError("Failed to fetch prayer data.");
                }
                
                // Reverse Geocoding (Optional/Basic) to get city name for display
                // For now, we can try to infer or just use generic "Current Location"
                // Or use another API. Let's stick to "Current Location" or use timezone
                if (data.data.meta.timezone) {
                     setCity(data.data.meta.timezone.split('/')[1].replace('_', ' '));
                }

            } catch (err) {
                setError("Network error fetching prayer times.");
            } finally {
                setLoading(false);
            }
        };

        fetchTimes();
    }
  }, [location]);


  // 3. Calculation Logic for Next Prayer / Countdown
  useEffect(() => {
      if (!prayerData) return;

      const interval = setInterval(() => {
          calculateNextPrayer(prayerData.timings);
      }, 1000);

      calculateNextPrayer(prayerData.timings); // Initial call

      return () => clearInterval(interval);
  }, [prayerData]);

  const calculateNextPrayer = (timings: PrayerTimes) => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { hour12: false });
      
      const prayers = [
          { name: 'Fajr', time: timings.Fajr },
          { name: 'Sunrise', time: timings.Sunrise }, // Not a prayer, but important
          { name: 'Dhuhr', time: timings.Dhuhr },
          { name: 'Asr', time: timings.Asr },
          { name: 'Maghrib', time: timings.Maghrib },
          { name: 'Isha', time: timings.Isha },
      ];

      // Convert "HH:mm" to Date object for today
      let upcoming = null;
      let minDiff = Infinity;
      
      // Need to handle "Next Fajr" (tomorrow) if all today are passed
      let nextFajrTomorrow = false;

      for (const p of prayers) {
          const pDate = new Date();
          const [h, m] = p.time.split(':');
          pDate.setHours(parseInt(h), parseInt(m), 0);
          
          let diff = pDate.getTime() - now.getTime();
          
          if (diff > 0 && diff < minDiff) {
              minDiff = diff;
              upcoming = { ...p, date: pDate };
          }
      }

      // If no upcoming prayer today, it means next is Fajr tomorrow
      if (!upcoming) {
          const [h, m] = timings.Fajr.split(':');
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(parseInt(h), parseInt(m), 0);
          minDiff = tomorrow.getTime() - now.getTime();
          upcoming = { name: 'Fajr', time: timings.Fajr, date: tomorrow };
          nextFajrTomorrow = true;
      }
      
      if (upcoming) {
          // Format Time Left
          const hours = Math.floor(minDiff / (1000 * 60 * 60));
          const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);
          
          const timeLeft = `${hours}h ${minutes}m ${seconds}s`;

          // Determine Iftar/Sehri status
          // Iftar = Maghrib
          // Sehri = Fajr (End of Sehri)
          const isIftar = upcoming.name === 'Maghrib';
          const isSehri = upcoming.name === 'Fajr';

          setNextPrayer({
              name: upcoming.name,
              time: formatTime12Hour(upcoming.time),
              timeLeft,
              isIftar,
              isSehri
          });
      }
  };

  const formatTime12Hour = (time24: string) => {
      const [h, m] = time24.split(':');
      const date = new Date();
      date.setHours(parseInt(h), parseInt(m));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  return { prayerData, location, error, loading, nextPrayer, city };
}
