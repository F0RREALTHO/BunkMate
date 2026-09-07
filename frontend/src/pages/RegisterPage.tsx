import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // button states: 'idle' | 'loading' | 'success'
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      await register(name, email, password);
      setStatus('success');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 600); // brief success state before nav
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setStatus('idle');
    }
  };

  return (
    <div className={styles.page}>
      
      {/* LEFT: Brand Panel */}
      <div className={styles.brandPanel}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <img src="/logo.png" alt="Bunkmate" className={styles.logoImage} />
          <h1 className={styles.heroText}>Never bunk blindly.</h1>
          <p className={styles.subHeroText}>Know exactly how many classes you can miss.</p>
        </motion.div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className={styles.formPanel}>
        <motion.div 
          className={styles.formWrapper}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Join BunkMate.</h2>
            <p className={styles.formSubtitle}>Start tracking your attendance today.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={styles.input}
                  placeholder=" " /* space required for placeholder-shown trick */
                  required
                  autoComplete="name"
                />
                <label htmlFor="register-name" className={styles.label}>Name</label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder=" "
                  required
                  autoComplete="email"
                />
                <label htmlFor="register-email" className={styles.label}>Email</label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder=" "
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <label htmlFor="register-password" className={styles.label}>Password</label>
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className={styles.inlineError}
                  >
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit" 
              className={`${styles.submitBtn} ${status === 'success' ? styles.success : ''}`} 
              disabled={status !== 'idle'}
            >
              {status === 'idle' && (
                <>Create account &rarr;</>
              )}
              {status === 'loading' && (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Creating account...
                </>
              )}
              {status === 'success' && (
                <>
                  <Check size={18} />
                  Account created
                </>
              )}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
