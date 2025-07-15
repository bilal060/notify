import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Styles
import './App.css';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/devices" element={<ProtectedRoute><DevicesView /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UsersView /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><NotificationsView /></ProtectedRoute>} />
          <Route path="/admin/emails" element={<ProtectedRoute><EmailsView /></ProtectedRoute>} />
          <Route path="/admin/sms" element={<ProtectedRoute><SMSView /></ProtectedRoute>} />
          <Route path="/admin/call-logs" element={<ProtectedRoute><CallLogsView /></ProtectedRoute>} />
          <Route path="/admin/contacts" element={<ProtectedRoute><ContactsView /></ProtectedRoute>} />
          <Route path="/admin/gmail-accounts" element={<ProtectedRoute><GmailAccountsView /></ProtectedRoute>} />
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
  );
}

export default App;
