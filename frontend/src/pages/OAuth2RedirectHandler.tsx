import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      loginWithToken(token);
      navigate('/', { replace: true });
    } else {
      // If no token, redirect back to login with an error
      navigate('/login?error=oauth2', { replace: true });
    }
  }, [location, loginWithToken, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0D0D0F', color: '#FFF' }}>
      <p>Completing login...</p>
    </div>
  );
}
