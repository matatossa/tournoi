import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(getDashboardRoute());
    }
  }, [user, navigate, getDashboardRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        const success = await login(username, password);
      if (!success) {
          setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2, boxShadow: 8, borderRadius: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
              Tournament App
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Sign in to your account
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              autoFocus
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, fontWeight: 700, py: 1.5, letterSpacing: 1 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>
          <Stack direction="column" spacing={1} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600, py: 1.2, borderRadius: 2, textTransform: 'none' }}
              onClick={() => navigate('/register-admin')}
            >
              Register as Admin
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ fontWeight: 600, py: 1.2, borderRadius: 2, textTransform: 'none' }}
              onClick={() => navigate('/register-team')}
            >
              Register as Team
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login; 