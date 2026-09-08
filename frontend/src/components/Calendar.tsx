import { useState } from 'react';
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
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Normalize history to local dates (yyyy-mm-dd)
  const historyMap = new Map<string, AttendanceRecordResponse[]>();
  history.forEach(record => {
    const d = new Date(record.occurredAt);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!historyMap.has(dateStr)) {
      historyMap.set(dateStr, []);
    }
    historyMap.get(dateStr)!.push(record);
  });

  const renderCells = () => {
    const cells = [];
    const today = new Date();
    
    // Empty cells before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className={`${styles.cell} ${styles.empty}`}></div>);
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const records = historyMap.get(dateStr) || [];
      const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

      cells.push(
        <div 
          key={d} 
          className={`${styles.cell} ${records.length > 0 ? styles.interactive : ''} ${isToday ? styles.today : ''}`}
          onClick={() => {
            if (onDateClick) {
              onDateClick(new Date(year, month, d), records);
            }
          }}
        >
          <span className={styles.dayNumber}>{d}</span>
          {records.length > 0 && (
            <div className={styles.indicators}>
              {records.map(record => (
                <div 
                  key={record.id} 
                  className={`${styles.indicator} ${record.status === 'PRESENT' ? styles.present : styles.absent}`} 
                  title={record.status}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <button onClick={prevMonth} className={styles.navBtn} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <h3 className={styles.monthTitle}>{monthNames[month]} {year}</h3>
        <button onClick={nextMonth} className={styles.navBtn} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
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
