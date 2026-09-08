import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import styles from './AddSubjectModal.module.css';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddSubjectModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [requiredPercentage, setRequiredPercentage] = useState('75');
  const [attended, setAttended] = useState('0');
  const [missed, setMissed] = useState('0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    // Trap focus / prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      const attendedNum = parseInt(attended) || 0;
      const missedNum = parseInt(missed) || 0;
      await api.createSubject({
        name: name.trim(),
        code: code.trim() || undefined,
        requiredPercentage: parseFloat(requiredPercentage) || 75,
        attendedClasses: attendedNum,
        totalClasses: attendedNum + missedNum,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        onClick={handleBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Add subject"
      >
        <motion.div
          className={styles.modal}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>Add Subject</h2>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.field}>
              <label htmlFor="subject-name" className={styles.label}>Subject name</label>
              <input
                ref={nameRef}
                id="subject-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={styles.input}
                placeholder="Data Structures"
                required
                maxLength={150}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="subject-code" className={styles.label}>
                Subject code <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="subject-code"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className={styles.input}
                placeholder="CS201"
                maxLength={30}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="subject-pct" className={styles.label}>Required attendance</label>
              <div className={styles.pctRow}>
                <input
                  id="subject-pct"
                  type="number"
                  value={requiredPercentage}
                  onChange={e => setRequiredPercentage(e.target.value)}
                  className={`${styles.input} ${styles.pctInput}`}
                  min="0"
                  max="100"
                  step="1"
                />
                <span className={styles.pctSign}>%</span>
              </div>
            </div>

            <div className={styles.splitRow}>
              <div className={styles.field}>
                <label htmlFor="subject-attended" className={styles.label}>Classes attended</label>
                <input
                  id="subject-attended"
                  type="number"
                  value={attended}
                  onChange={e => setAttended(e.target.value)}
                  className={styles.input}
                  min="0"
                  step="1"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="subject-missed" className={styles.label}>Classes missed</label>
                <input
                  id="subject-missed"
                  type="number"
                  value={missed}
                  onChange={e => setMissed(e.target.value)}
                  className={styles.input}
                  min="0"
                  step="1"
                />
              </div>
            </div>

            <button type="submit" className={styles.submit} disabled={loading || !name.trim()}>
              {loading ? 'Adding…' : 'Add Subject'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
