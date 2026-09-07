import { BookOpen } from 'lucide-react';
import styles from './EmptyState.module.css';

interface Props {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <BookOpen size={32} strokeWidth={1.5} />
      </div>
      <h2 className={styles.title}>Your attendance journey starts here</h2>
      <p className={styles.text}>
        Add your first subject and start tracking your classes.
      </p>
      <button onClick={onAdd} className={styles.button}>
        + Add your first subject
      </button>
    </div>
  );
}
