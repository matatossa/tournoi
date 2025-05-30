import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Tournaments from './components/Tournaments';
import Teams from './components/Teams';
import Players from './components/Players';
import TournamentBracket from './components/TournamentBracket';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import TournamentRegistration from './components/TournamentRegistration';
import RegisterAdmin from './components/RegisterAdmin';
import RegisterTeam from './components/RegisterTeam';
import AdminJoinRequests from './components/AdminJoinRequests';
import TeamDashboard from './components/TeamDashboard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if route requires specific roles
  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={user.role === 'ADMIN' ? '/' : '/team-dashboard'} />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
      <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register-admin" element={<RegisterAdmin />} />
            <Route path="/register-team" element={<RegisterTeam />} />
            
            {/* Team routes */}
            <Route
              path="/team-dashboard"
              element={
                <ProtectedRoute roles={['TEAM']}>
                  <Layout>
                    <TeamDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/join-requests"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Layout>
                    <AdminJoinRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Shared routes (accessible by both ADMIN and TEAM) */}
            <Route
              path="/tournaments"
              element={
                <ProtectedRoute roles={['ADMIN', 'TEAM']}>
                  <Layout>
                    <Tournaments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute roles={['ADMIN', 'TEAM']}>
                  <Layout>
                    <Teams />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ProtectedRoute roles={['ADMIN', 'TEAM']}>
                  <Layout>
                    <Players />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournaments/:tournamentId/bracket"
              element={
                <ProtectedRoute roles={['ADMIN', 'TEAM']}>
                  <Layout>
                    <TournamentBracket />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament-registration"
              element={
                <ProtectedRoute roles={['TEAM']}>
                  <Layout>
                    <TournamentRegistration />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
        </Router>
    </ThemeProvider>
  );
}

export default App; 