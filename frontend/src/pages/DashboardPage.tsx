import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatPercentage, generateIdempotencyKey } from '../lib/utils';
import type { DashboardResponse, SubjectResponse } from '../types';
import SubjectCard from '../components/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';
import Toast from '../components/Toast';
import { LogOut, Settings, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardPage() {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch {
      // Handle unauthorized
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

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

  const subjects = data?.subjects || [];
  const hasSubjects = subjects.length > 0;
  const firstName = userName?.split(' ')[0] || 'Student';
  
  const formattedOverall = data?.overallPercentage != null 
    ? formatPercentage(data.overallPercentage)
    : '0.0%';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.greeting}>Good evening, {firstName}</h1>
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
    </div>
  );
}
