import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AttendanceRecordResponse } from '../types';
import styles from './Calendar.module.css';

interface CalendarProps {
  history: AttendanceRecordResponse[];
  onDateClick?: (date: Date, records: AttendanceRecordResponse[]) => void;
}

export default function Calendar({ history, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Normalize history to local dates (yyyy-mm-dd)
  const historyMap = useMemo(() => {
    const map = new Map<string, AttendanceRecordResponse[]>();
    history.forEach(record => {
      const d = new Date(record.occurredAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(dateStr)) {
        map.set(dateStr, []);
      }
      map.get(dateStr)!.push(record);
    });
    return map;
  }, [history]);

  // Calculate current month stats
  const currentMonthStats = useMemo(() => {
    let attended = 0;
    let missed = 0;
    history.forEach(record => {
      const d = new Date(record.occurredAt);
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (record.status === 'PRESENT') attended++;
        else missed++;
      }
    });
    return { attended, missed };
  }, [history, month, year]);

  const renderCells = () => {
    const cells = [];
    const today = new Date();
    
    // Previous month muted days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push(
        <div key={`prev-${i}`} className={`${styles.cell} ${styles.muted}`}>
          <span className={styles.dayNumber}>{daysInPrevMonth - i}</span>
        </div>
      );
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const records = historyMap.get(dateStr) || [];
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

      let cellStatusClass = '';
      if (records.length > 0) {
        const hasPresent = records.some(r => r.status === 'PRESENT');
        const hasAbsent = records.some(r => r.status === 'ABSENT');
        if (hasPresent && !hasAbsent) cellStatusClass = styles.cellSafe;
        else if (!hasPresent && hasAbsent) cellStatusClass = styles.cellDanger;
        else cellStatusClass = styles.cellWarning;
      }

      cells.push(
        <div 
          key={d} 
          className={`${styles.cell} ${records.length > 0 ? styles.interactive : ''} ${isToday ? styles.today : ''} ${cellStatusClass}`}
          onClick={() => {
            if (onDateClick) {
              onDateClick(new Date(year, month, d), records);
            }
          }}
        >
          <span className={styles.dayNumber}>{d}</span>
        </div>
      );
    }

    // Next month muted days to complete the grid (up to 42 cells total)
    const totalCells = cells.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push(
        <div key={`next-${i}`} className={`${styles.cell} ${styles.muted}`}>
          <span className={styles.dayNumber}>{i}</span>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.monthTitle}>{monthNames[month]} {year}</h3>
          <div className={styles.stats}>
            <span className={styles.statPresent}>
              {currentMonthStats.attended} Attended
            </span>
            <span className={styles.statAbsent}>
              {currentMonthStats.missed} Missed
            </span>
          </div>
        </div>
        <div className={styles.navGroup}>
          <button onClick={prevMonth} className={styles.navBtn} aria-label="Previous month">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className={styles.navBtn} aria-label="Next month">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {dayNames.map(day => (
          <div key={day} className={styles.dayName}>{day}</div>
        ))}
        {renderCells()}
      </div>
    </div>
  );
}
