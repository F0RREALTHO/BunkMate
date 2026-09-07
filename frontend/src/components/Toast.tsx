import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './Toast.module.css';

interface Props {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 2500 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <AnimatePresence>
      <motion.div
        className={styles.toast}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        role="status"
        aria-live="polite"
      >
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
