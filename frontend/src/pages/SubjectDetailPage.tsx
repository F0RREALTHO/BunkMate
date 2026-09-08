import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Pencil, Trash2, RotateCcw, Minus, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { formatPercentage, generateIdempotencyKey } from '../lib/utils';
import type { SubjectResponse, AttendanceRecordResponse } from '../types';
import Toast from '../components/Toast';
import styles from './SubjectDetail.module.css';

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<SubjectResponse | null>(null);
  const [history, setHistory] = useState<AttendanceRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editPct, setEditPct] = useState('');
  const [busy, setBusy] = useState(false);

  const subjectId = Number(id);

  useEffect(() => {
    (async () => {
      try {
        const [s, h] = await Promise.all([
          api.getSubject(subjectId),
          api.getHistory(subjectId),
        ]);
        setSubject(s);
        setHistory(h);
        setEditName(s.name);
        setEditCode(s.code || '');
        setEditPct(String(s.requiredPercentage));
      } catch {
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId, navigate]);

  const handleAttendance = async (status: 'PRESENT' | 'ABSENT') => {
    if (busy || !subject) return;
    setBusy(true);

    // Optimistic update: show new numbers instantly
    const prevSubject = subject;
    const isPresent = status === 'PRESENT';
    setSubject(s => s ? {
      ...s,
      attendedClasses: s.attendedClasses + (isPresent ? 1 : 0),
      totalClasses: s.totalClasses + 1,
    } : s);

    try {
      const key = generateIdempotencyKey();
      const updated = await api.recordAttendance(subjectId, status, key);
      setSubject(updated); // Replace with server truth
      // Refresh history in background (non-blocking)
      api.getHistory(subjectId).then(setHistory).catch(() => {});
      setToast(isPresent ? 'Marked as attended' : 'Marked as missed');
    } catch (err: any) {
      setSubject(prevSubject); // Rollback on error
      setToast(err.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    setBusy(true);
    try {
      const updated = await api.updateSubject(subjectId, {
        name: editName,
        code: editCode || undefined,
        requiredPercentage: parseFloat(editPct),
      });
      setSubject(updated);
      setEditing(false);
      setToast('Subject updated');
    } catch (err: any) {
      setToast(err.message || 'Failed to update');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteSubject(subjectId);
      navigate('/', { replace: true });
    } catch (err: any) {
      setToast(err.message || 'Failed to delete');
      setShowDelete(false);
    }
  };

  const handleReset = async () => {
    try {
      const updated = await api.resetSubject(subjectId);
      setSubject(updated);
      setHistory([]);
      setToast('Attendance reset');
    } catch (err: any) {
      setToast(err.message || 'Failed to reset');
    }
  };

  if (loading || !subject) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.skeleton} style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  const statusColor = subject.status === 'DANGER'
    ? 'var(--color-danger-text)'
    : subject.status === 'WARNING'
    ? 'var(--color-warning-text)'
    : 'var(--color-safe-text)';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Nav */}
        <nav className={styles.nav}>
          <button onClick={() => navigate('/')} className={styles.backBtn} aria-label="Back to dashboard">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className={styles.navActions}>
            <button onClick={() => setEditing(!editing)} className={styles.navBtn} aria-label="Edit subject">
              <Pencil size={18} />
            </button>
            <button onClick={handleReset} className={styles.navBtn} aria-label="Reset attendance">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setShowDelete(true)} className={`${styles.navBtn} ${styles.dangerBtn}`} aria-label="Delete subject">
              <Trash2 size={18} />
            </button>
          </div>
        </nav>

        {/* Edit Form */}
        {editing && (
          <div className={styles.editCard}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className={styles.editInput} />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Code</label>
              <input value={editCode} onChange={e => setEditCode(e.target.value)} className={styles.editInput} placeholder="Optional" />
            </div>
            <div className={styles.editField}>
              <label className={styles.editLabel}>Required %</label>
              <input type="number" value={editPct} onChange={e => setEditPct(e.target.value)} className={styles.editInput} min="0" max="100" />
            </div>
            <div className={styles.editActions}>
              <button onClick={() => setEditing(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSaveEdit} className={styles.saveBtn} disabled={busy}>Save</button>
            </div>
          </div>
        )}

        {/* Main Stats */}
        <div className={styles.statsCard}>
          <h1 className={styles.subjectName}>{subject.name}</h1>
          {subject.code && <span className={styles.subjectCode}>{subject.code}</span>}

          <div className={styles.bigPct}>{formatPercentage(subject.attendancePercentage)}</div>

          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{subject.attendedClasses}</span>
              <span className={styles.statLabel}>Attended</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{subject.totalClasses}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{subject.totalClasses - subject.attendedClasses}</span>
              <span className={styles.statLabel}>Missed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{subject.requiredPercentage}%</span>
              <span className={styles.statLabel}>Required</span>
            </div>
          </div>

          {subject.totalClasses > 0 && (
            <div className={styles.statusMsg} style={{ color: statusColor }}>
              {subject.statusMessage}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controlsCard}>
          <motion.button
            className={`${styles.bigBtn} ${styles.absentBigBtn}`}
            onClick={() => handleAttendance('ABSENT')}
            disabled={busy}
            whileTap={{ scale: 0.95 }}
            aria-label="Mark class absent"
          >
            <Minus size={28} strokeWidth={2.5} />
            <span>Missed</span>
          </motion.button>
          <motion.button
            className={`${styles.bigBtn} ${styles.presentBigBtn}`}
            onClick={() => handleAttendance('PRESENT')}
            disabled={busy}
            whileTap={{ scale: 0.95 }}
            aria-label="Mark class attended"
          >
            <Plus size={28} strokeWidth={2.5} />
            <span>Attended</span>
          </motion.button>
        </div>

        {/* History & Calendar */}
        {history.length > 0 && (
          <div className={styles.historySection}>
            <h2 className={styles.historyTitle}>Recent History</h2>
            <div className={styles.historyList}>
              {history.slice(0, 20).map(record => (
                <div key={record.id} className={styles.historyItem}>
                  <div className={`${styles.historyDot} ${record.status === 'PRESENT' ? styles.presentDot : styles.absentDot}`} />
                  <span className={styles.historyStatus}>{record.status === 'PRESENT' ? 'Attended' : 'Missed'}</span>
                  <span className={styles.historyDate}>
                    {new Date(record.occurredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDelete && (
        <div className={styles.deleteOverlay} onClick={() => setShowDelete(false)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()} role="alertdialog" aria-label="Confirm delete">
            <h3 className={styles.deleteTitle}>Delete {subject.name}?</h3>
            <p className={styles.deleteText}>This will permanently delete this subject and all attendance records. This cannot be undone.</p>
            <div className={styles.deleteActions}>
              <button onClick={() => setShowDelete(false)} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
