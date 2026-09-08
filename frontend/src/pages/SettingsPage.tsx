import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Mail, Edit2, Check, X } from 'lucide-react';
import styles from './Settings.module.css';

export default function SettingsPage() {
  const { userName, userEmail, updateName, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(userName || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSaveName = async () => {
    if (!draftName.trim() || draftName === userName) {
      setIsEditingName(false);
      return;
    }
    setLoading(true);
    try {
      await updateName(draftName.trim());
      setIsEditingName(false);
    } catch (e) {
      console.error("Failed to update name", e);
    } finally {
      setLoading(false);
    }
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
              <div className={styles.rowContent}>
                <span className={styles.rowLabel}>Name</span>
                {isEditingName ? (
                  <div className={styles.editRow}>
                    <input 
                      type="text" 
                      value={draftName} 
                      onChange={(e) => setDraftName(e.target.value)}
                      className={styles.editInput}
                      disabled={loading}
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={loading} className={styles.actionBtn}><Check size={16} /></button>
                    <button onClick={() => { setIsEditingName(false); setDraftName(userName || ''); }} disabled={loading} className={styles.actionBtn}><X size={16} /></button>
                  </div>
                ) : (
                  <div className={styles.editRow}>
                    <span className={styles.rowValue}>{userName}</span>
                    <button onClick={() => { setIsEditingName(true); setDraftName(userName || ''); }} className={styles.actionBtn}>
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.divider} />
            <div className={styles.row}>
              <Mail size={18} className={styles.rowIcon} />
              <div className={styles.rowContent}>
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
