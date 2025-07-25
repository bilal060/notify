import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Dashboard from './components/dashboard/Dashboard';
import UserDetail from './components/dashboard/UserDetail';
import Notifications from './components/dashboard/Notifications';
import Media from './components/dashboard/Media';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/common/ProtectedRoute';

// New Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import DevicesView from './components/admin/DevicesView';
import UsersView from './components/admin/UsersView';
import NotificationsView from './components/admin/NotificationsView';
import EmailsView from './components/admin/EmailsView';
import SMSView from './components/admin/SMSView';
import CallLogsView from './components/admin/CallLogsView';
import ContactsView from './components/admin/ContactsView';
import GmailAccountsView from './components/admin/GmailAccountsView';

// Pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import BookNow from './pages/BookNow';
import Services from './pages/Services';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/book" element={<BookNow />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/user/:userId" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
            
            {/* Admin Routes - Require Admin Access */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/devices" element={<ProtectedRoute requireAdmin={true}><DevicesView /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UsersView /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute requireAdmin={true}><NotificationsView /></ProtectedRoute>} />
            <Route path="/admin/emails" element={<ProtectedRoute requireAdmin={true}><EmailsView /></ProtectedRoute>} />
            <Route path="/admin/sms" element={<ProtectedRoute requireAdmin={true}><SMSView /></ProtectedRoute>} />
            <Route path="/admin/call-logs" element={<ProtectedRoute requireAdmin={true}><CallLogsView /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute requireAdmin={true}><ContactsView /></ProtectedRoute>} />
            <Route path="/admin/gmail-accounts" element={<ProtectedRoute requireAdmin={true}><GmailAccountsView /></ProtectedRoute>} />
          </Routes>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
