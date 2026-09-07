import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';
import styles from './Auth.module.css';

const AnimatedChalk = () => {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  const steps = [
    { text: '12 / 16', pct: '75.0%' },
    { text: '13 / 17', pct: '76.4%' },
    { text: '14 / 18', pct: '77.7%' },
  ];

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [shouldReduceMotion, steps.length]);

  if (shouldReduceMotion) return null;

  return (
    <div className={styles.chalkVisual} aria-hidden="true">
      <div className={styles.chalkLabel}>Attendance Projection</div>
      <div className={styles.chalkRow}>
        <AnimatePresence mode="wait">
          <motion.span
            key={steps[step].text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
          >
            {steps[step].text}
          </motion.span>
        </AnimatePresence>
        <span style={{ opacity: 0.5 }}>→</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={steps[step].pct}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {steps[step].pct}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'oauth2') {
      setError("Google sign-in couldn't be completed. Please try again.");
    } else if (oauthError === 'oauth2_missing_email') {
      setError("Your Google account doesn't have an email address available.");
    }
  }, [searchParams]);
  
  // button states: 'idle' | 'loading' | 'success'
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    try {
      await login(email, password);
      setStatus('success');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 600); // brief success state before nav
    } catch (err: any) {
      setError(err.message || 'Email or password is incorrect.');
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
        
        <AnimatedChalk />
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
            <h2 className={styles.formTitle}>Welcome back.</h2>
            <p className={styles.formSubtitle}>Let's check your attendance.</p>
          </div>

          <div className={styles.oauthContainer}>
            <button
              onClick={() => window.location.href = import.meta.env.VITE_OAUTH_URL || 'http://localhost:8080/oauth2/authorization/google'}
              className={styles.googleBtn}
              type="button"
            >
              <svg className={styles.googleIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>
            <div className={styles.divider}>
              <span>or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder=" " /* space required for placeholder-shown trick */
                  required
                  autoComplete="email"
                />
                <label htmlFor="login-email" className={styles.label}>Email</label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder=" "
                  required
                  autoComplete="current-password"
                />
                <label htmlFor="login-password" className={styles.label}>Password</label>
                
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
                <>Sign in &rarr;</>
              )}
              {status === 'loading' && (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in...
                </>
              )}
              {status === 'success' && (
                <>
                  <Check size={18} />
                  Welcome back
                </>
              )}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
