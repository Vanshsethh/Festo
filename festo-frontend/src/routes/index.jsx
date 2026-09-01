import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/public/HomePage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { CollegesDirectoryPage } from '../pages/public/CollegesDirectoryPage.jsx';
import { CollegeDetailPage } from '../pages/public/CollegeDetailPage.jsx';
import { HostEventPage } from '../pages/college/HostEventPage.jsx';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { RoleGuard } from '../components/common/RoleGuard.jsx';
import { EventsPage, EventDetailPage } from '../pages/public/EventsPage.jsx';
import { AdminEventsPage } from '../pages/admin/AdminEventsPage.jsx';
import { MyRegistrationsPage } from '../pages/student/MyRegistrationsPage.jsx';
import { MyTicketsPage } from '../pages/student/MyTicketsPage.jsx';
import { CheckinScannerPage } from '../pages/college/CheckinScannerPage.jsx';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage.jsx';
import { CollegeDashboardPage } from '../pages/college/CollegeDashboardPage.jsx';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/colleges" element={<CollegesDirectoryPage />} />
      <Route path="/colleges/:identifier" element={<CollegeDetailPage />} />
      <Route path="/explore" element={<EventsPage />} />
      <Route path="/events/:slug" element={<EventDetailPage />} />

      {/* Authenticated User Routes */}
      <Route
        path="/dashboard"
        element={<RoleGuard allowedRoles={['USER']}><StudentDashboardPage /></RoleGuard>}
      />
      <Route
        path="/registrations"
        element={
          <RoleGuard allowedRoles={['USER']}>
            <MyRegistrationsPage />
          </RoleGuard>
        }
      />
      <Route
        path="/tickets"
        element={
          <RoleGuard allowedRoles={['USER']}>
            <MyTicketsPage />
          </RoleGuard>
        }
      />

      {/* Organizer Routes */}
      <Route
        path="/host"
        element={
          <RoleGuard allowedRoles={['USER', 'ORGANIZER']}>
            <HostEventPage />
          </RoleGuard>
        }
      />
      <Route
        path="/organizer/dashboard"
        element={
          <RoleGuard allowedRoles={['ORGANIZER']}>
            <CollegeDashboardPage />
          </RoleGuard>
        }
      />
      <Route
        path="/organizer/events"
        element={
          <RoleGuard allowedRoles={['ORGANIZER']}>
            <MyRegistrationsPage />
          </RoleGuard>
        }
      />
      <Route
        path="/organizer/checkin"
        element={
          <RoleGuard allowedRoles={['ORGANIZER']}>
            <CheckinScannerPage />
          </RoleGuard>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};