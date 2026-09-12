/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { LogComplaint } from './pages/LogComplaint';
import { ComplaintDetails } from './pages/ComplaintDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="complaints" element={<Navigate to="/" replace />} />
          <Route path="log-complaint" element={<LogComplaint />} />
          <Route path="complaint/:id" element={<ComplaintDetails />} />
          <Route path="settings" element={<div className="p-6">Settings (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
