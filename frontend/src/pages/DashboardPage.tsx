import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatPercentage, generateIdempotencyKey } from '../lib/utils';
import type { DashboardResponse, SubjectResponse } from '../types';
import SubjectCard from '../components/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';
import Toast from '../components/Toast';
import { LogOut, Settings, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { motion, AnimatePresence } from 'motion/react';
import Calendar from '../components/Calendar';
import type { AttendanceRecordResponse } from '../types';
import SortDropdown from '../components/SortDropdown';
import type { SortOption } from '../components/SortDropdown';

export default function DashboardPage() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [history, setHistory] = useState<AttendanceRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('pct-asc');
  
  // Date/Time State
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Date details modal state
  const [selectedDateRecords, setSelectedDateRecords] = useState<{date: Date, records: AttendanceRecordResponse[]} | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [res, hist] = await Promise.all([
        api.getDashboard(),
        api.getAllHistory()
      ]);
      setData(res);
      setHistory(hist);
    } catch {
      // Handle unauthorized
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAttendance = async (
    subjectId: number,
    status: 'PRESENT' | 'ABSENT',
    onOptimistic: (updated: SubjectResponse) => void
  ) => {
    const key = generateIdempotencyKey();
    try {
      const updated = await api.recordAttendance(subjectId, status, key);
      setData(prev => prev ? {
        ...prev,
        subjects: prev.subjects.map(s => s.id === subjectId ? updated : s),
        totalAttended: prev.subjects.reduce((sum, s) => sum + (s.id === subjectId ? updated.attendedClasses : s.attendedClasses), 0),
        totalClasses: prev.subjects.reduce((sum, s) => sum + (s.id === subjectId ? updated.totalClasses : s.totalClasses), 0),
        overallPercentage: (() => {
          const subjects = prev.subjects.map(s => s.id === subjectId ? updated : s);
          const totalAtt = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
          const totalCls = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
          return totalCls > 0 ? Math.round((totalAtt / totalCls) * 1000) / 10 : null;
        })(),
      } : prev);
      onOptimistic(updated);
    } catch (err: any) {
      fetchDashboard();
      setToast({ message: err.message || 'Failed to update attendance' });
    }
  };

  const handleUndo = async (
    subjectId: number,
    status: 'PRESENT' | 'ABSENT',
    onOptimistic: (updated: SubjectResponse) => void
  ) => {
    try {
      const updated = await api.undoLatestAttendance(subjectId, status);
      setData(prev => prev ? {
        ...prev,
        subjects: prev.subjects.map(s => s.id === subjectId ? updated : s),
        totalAttended: prev.subjects.reduce((sum, s) => sum + (s.id === subjectId ? updated.attendedClasses : s.attendedClasses), 0),
        totalClasses: prev.subjects.reduce((sum, s) => sum + (s.id === subjectId ? updated.totalClasses : s.totalClasses), 0),
        overallPercentage: (() => {
          const subjects = prev.subjects.map(s => s.id === subjectId ? updated : s);
          const totalAtt = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
          const totalCls = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
          return totalCls > 0 ? Math.round((totalAtt / totalCls) * 1000) / 10 : null;
        })(),
      } : prev);
      onOptimistic(updated);
    } catch (err: any) {
      fetchDashboard();
      setToast({ message: err.message || 'Failed to undo attendance' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeletonHeader} />
          <div className={styles.grid}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        </div>
      </div>
    );
  }

  let subjects = data?.subjects || [];
  const hasSubjects = subjects.length > 0;
  const firstName = userName?.split(' ')[0] || 'Student';
  
  const formattedOverall = data?.overallPercentage != null 
    ? formatPercentage(data.overallPercentage)
    : '0.0%';

  // Sort logic
  subjects = [...subjects].sort((a, b) => {
    const pctA = a.totalClasses > 0 ? (a.attendedClasses / a.totalClasses) * 100 : 0;
    const pctB = b.totalClasses > 0 ? (b.attendedClasses / b.totalClasses) * 100 : 0;

    switch (sortBy) {
      case 'pct-asc':
        return pctA - pctB;
      case 'pct-desc':
        return pctB - pctA;
      case 'attended-desc':
        return b.attendedClasses - a.attendedClasses;
      case 'missed-desc':
        const missedA = a.totalClasses - a.attendedClasses;
        const missedB = b.totalClasses - b.attendedClasses;
        return missedB - missedA;
      default:
        return 0;
    }
  });

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.timeWrapper}>
              <span className={styles.dateText}>{formattedDate}</span>
              <span className={styles.dot}>·</span>
              <span className={styles.timeText}><Clock size={14} className={styles.timeIcon}/> {formattedTime}</span>
            </div>
            <h1 className={styles.greeting}>{getGreeting()}, {firstName}</h1>
            <div className={styles.subtext}>
              {hasSubjects && data ? (
                <>
                  <span className={styles.overallMeta}>
                    Overall: <span className={styles.overallPct}>{formattedOverall}</span>
                  </span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.overallRatio}>{data.totalAttended}/{data.totalClasses} classes</span>
                </>
              ) : (
                <span className={styles.overallMeta}>Welcome to Bunkmate</span>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => navigate('/settings')} className={styles.iconBtn} aria-label="Settings">
              <Settings size={20} strokeWidth={2} />
            </button>
            <button onClick={handleLogout} className={styles.iconBtn} aria-label="Sign out">
              <LogOut size={20} strokeWidth={2} />
            </button>
          </div>
        </header>

        {hasSubjects && (
          <div className={styles.controlsBar}>
            <h2 className={styles.controlsTitle}>Your Subjects</h2>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        )}

        {/* Responsive Subject Grid */}
        <div className={styles.grid}>
          {subjects.map((subject, index) => (
            <motion.div 
              key={subject.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <SubjectCard
                subject={subject}
                onAttendance={handleAttendance}
                onUndo={handleUndo}
                onClick={() => navigate(`/subjects/${subject.id}`)}
              />
            </motion.div>
          ))}

          {/* Inline Add Subject Ghost Card */}
          <motion.button 
            className={styles.addCard}
            onClick={() => setShowAddModal(true)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: subjects.length * 0.05 }}
            aria-label="Add new subject"
          >
            <div className={styles.addIconWrapper}>
              <Plus size={24} strokeWidth={2} />
            </div>
            <span className={styles.addText}>Add Subject</span>
          </motion.button>
        </div>

        {/* Global Calendar */}
        {hasSubjects && (
          <motion.div 
            className={styles.calendarSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: subjects.length * 0.05 + 0.1 }}
          >
            <h2 className={styles.sectionTitle}>
              <CalendarIcon size={20} />
              Attendance History
            </h2>
            <div className={styles.calendarCard}>
              <Calendar 
                history={history} 
                onDateClick={(date, records) => {
                  if (records.length > 0) setSelectedDateRecords({date, records});
                }} 
              />
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddSubjectModal
            onClose={() => setShowAddModal(false)}
            onCreated={() => { setShowAddModal(false); fetchDashboard(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDateRecords && (
          <div className={styles.modalOverlay} onClick={() => setSelectedDateRecords(null)}>
            <motion.div 
              className={styles.dateModal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{selectedDateRecords.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
              <div className={styles.recordList}>
                {selectedDateRecords.records.map(record => (
                  <div key={record.id} className={`${styles.recordItem} ${record.status === 'PRESENT' ? styles.recordItemSafe : styles.recordItemDanger}`}>
                    <div className={`${styles.statusDot} ${record.status === 'PRESENT' ? styles.presentDot : styles.absentDot}`} />
                    <div className={styles.recordInfo}>
                      <span className={styles.recordSubject}>{record.subjectName}</span>
                      <span className={styles.recordTime}>
                        {new Date(record.occurredAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={record.status === 'PRESENT' ? styles.presentText : styles.absentText}>
                      {record.status === 'PRESENT' ? 'Attended' : 'Missed'}
                    </span>
                  </div>
                ))}
              </div>
              <button className={styles.closeModalBtn} onClick={() => setSelectedDateRecords(null)}>
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
