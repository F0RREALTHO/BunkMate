import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Mail } from 'lucide-react';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const { userName, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <button onClick={() => navigate('/')} className={styles.backBtn} aria-label="Back">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </nav>

        <h1 className={styles.title}>Settings</h1>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.card}>
            <div className={styles.row}>
              <User size={18} className={styles.rowIcon} />
              <div>
                <span className={styles.rowLabel}>Name</span>
                <span className={styles.rowValue}>{userName}</span>
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.row}>
              <Mail size={18} className={styles.rowIcon} />
              <div>
                <span className={styles.rowLabel}>Email</span>
                <span className={styles.rowValue}>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
