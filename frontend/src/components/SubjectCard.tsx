import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import type { SubjectResponse } from '../types';
import { formatPercentage } from '../lib/utils';
import styles from './SubjectCard.module.css';

interface Props {
  subject: SubjectResponse;
  onAttendance: (
    subjectId: number,
    status: 'PRESENT' | 'ABSENT',
    onOptimistic: (updated: SubjectResponse) => void
  ) => void;
  onUndo: (
    subjectId: number,
    status: 'PRESENT' | 'ABSENT',
    onOptimistic: (updated: SubjectResponse) => void
  ) => void;
  onClick: () => void;
}

const ChalkDust = ({ triggerKey }: { triggerKey: number }) => {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (triggerKey > 0 && !shouldReduceMotion) {
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 40 - 20,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 400);
      return () => clearTimeout(timer);
    }
  }, [triggerKey, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div className={styles.chalkDustContainer} aria-hidden="true">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className={styles.particle}
            initial={{ opacity: 0.8, x: 0, y: 0, scale: Math.random() * 0.4 + 0.6 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function SubjectCard({ subject, onAttendance, onUndo, onClick }: Props) {
  const [optimistic, setOptimistic] = useState(subject);
  const [actionCount, setActionCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  if (subject.updatedAt !== optimistic.updatedAt) {
    setOptimistic(subject);
  }

  const handleAction = (status: 'PRESENT' | 'ABSENT') => {
    setActionCount(c => c + 1);

    const newAttended = status === 'PRESENT'
      ? optimistic.attendedClasses + 1
      : optimistic.attendedClasses;
    const newTotal = optimistic.totalClasses + 1;
    const newPct = newTotal > 0
      ? Math.round((newAttended / newTotal) * 1000) / 10
      : null;

    setOptimistic(prev => ({
      ...prev,
      attendedClasses: newAttended,
      totalClasses: newTotal,
      attendancePercentage: newPct,
    }));

    onAttendance(subject.id, status, (updated) => {
      // Only update if the incoming data is newer than our optimistic state
      if (updated.updatedAt > optimistic.updatedAt) {
        setOptimistic(updated);
      }
    });
  };

  const handleUndoAction = (status: 'PRESENT' | 'ABSENT') => {
    // Prevent undo if numbers would go negative or if no records of that type exist
    const currentMissed = optimistic.totalClasses - optimistic.attendedClasses;
    if (status === 'PRESENT' && optimistic.attendedClasses <= 0) return;
    if (status === 'ABSENT' && currentMissed <= 0) return;

    setActionCount(c => c + 1);

    const newAttended = status === 'PRESENT'
      ? optimistic.attendedClasses - 1
      : optimistic.attendedClasses;
    const newTotal = optimistic.totalClasses - 1;
    const newPct = newTotal > 0
      ? Math.round((newAttended / newTotal) * 1000) / 10
      : null;

    setOptimistic(prev => ({
      ...prev,
      attendedClasses: newAttended,
      totalClasses: newTotal,
      attendancePercentage: newPct,
    }));

    onUndo(subject.id, status, (updated) => {
      if (updated.updatedAt > optimistic.updatedAt) {
        setOptimistic(updated);
      }
    });
  };

  let decisionValue = '';
  let decisionLabel = '';
  
  if (optimistic.status === 'SAFE') {
    decisionValue = `SKIP ${optimistic.classesCanSkip}`;
    decisionLabel = 'You can safely skip';
  } else if (optimistic.status === 'WARNING') {
    decisionValue = 'KEEP ATTENDING';
    decisionLabel = 'Stay above your target';
  } else if (optimistic.status === 'DANGER') {
    decisionValue = `ATTEND ${optimistic.classesNeeded}`;
    decisionLabel = 'Classes needed to recover';
  } else {
    decisionValue = '—';
    decisionLabel = `Required ${optimistic.requiredPercentage}%`;
  }

  const statusClass = optimistic.status === 'DANGER'
    ? styles.isDanger
    : optimistic.status === 'WARNING'
    ? styles.isWarning
    : optimistic.totalClasses > 0 ? styles.isSafe : '';

  const pctFormatted = formatPercentage(optimistic.attendancePercentage);

  return (
    <motion.div 
      className={styles.card} 
      whileHover={shouldReduceMotion ? undefined : "hover"}
    >
      <button className={styles.content} onClick={onClick} aria-label={`View ${optimistic.name} details`}>
        {/* Top: Name & % */}
        <div className={styles.topRow}>
          <div className={styles.info}>
            <h3 className={styles.name}>{optimistic.name}</h3>
            {optimistic.code && <span className={styles.code}>{optimistic.code}</span>}
          </div>
          
          <div className={styles.pctWrapper}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={optimistic.attendancePercentage}
                initial={shouldReduceMotion ? undefined : { y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { y: 8, opacity: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
                className={styles.pct}
              >
                {pctFormatted}
              </motion.span>
            </AnimatePresence>
            <ChalkDust triggerKey={actionCount} />
          </div>
        </div>

        {/* Middle: Decision */}
        <div className={`${styles.decision} ${statusClass}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={decisionValue}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.decisionValue}>{decisionValue}</div>
              <div className={styles.decisionLabel}>{decisionLabel}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </button>

      {/* Bottom: Undo & Toggle Controls */}
      <div className={styles.controlsGrid}>
        
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Attended ({optimistic.attendedClasses})</span>
          <div className={styles.toggle}>
            <motion.button
              className={styles.btnMinus}
              onClick={(e) => { e.stopPropagation(); handleUndoAction('PRESENT'); }}
              disabled={optimistic.attendedClasses <= 0}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              aria-label="Undo Attended"
            >
              <Minus size={18} strokeWidth={2.5} />
            </motion.button>
            <div className={styles.toggleDivider} />
            <motion.button
              className={styles.btnPlus}
              onClick={(e) => { e.stopPropagation(); handleAction('PRESENT'); }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              aria-label="Mark Attended"
            >
              <Plus size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Missed ({optimistic.totalClasses - optimistic.attendedClasses})</span>
          <div className={styles.toggle}>
            <motion.button
              className={`${styles.btnMinus} ${styles.btnMinusDanger}`}
              onClick={(e) => { e.stopPropagation(); handleUndoAction('ABSENT'); }}
              disabled={(optimistic.totalClasses - optimistic.attendedClasses) <= 0}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              aria-label="Undo Missed"
            >
              <Minus size={18} strokeWidth={2.5} />
            </motion.button>
            <div className={styles.toggleDividerDanger} />
            <motion.button
              className={`${styles.btnPlus} ${styles.btnPlusDanger}`}
              onClick={(e) => { e.stopPropagation(); handleAction('ABSENT'); }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              aria-label="Mark Missed"
            >
              <Plus size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
