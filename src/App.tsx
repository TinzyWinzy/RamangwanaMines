import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout, AdminLayout } from './components/layout';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import LeadForm from './pages/LeadForm';
import Training from './pages/Training';
import TrainingDetail from './pages/TrainingDetail';
import MyTraining from './pages/MyTraining';
import CertificateVerify from './pages/CertificateVerify';
import ClientPortal from './pages/ClientPortal';
import AdminDashboard from './pages/Admin/Dashboard';
import Leads from './pages/Admin/Leads';
import Consultations from './pages/Admin/Consultations';
import Quotations from './pages/Admin/Quotations';
import Projects from './pages/Admin/Projects';
import Analytics from './pages/Admin/Analytics';
import CMS from './pages/Admin/CMS';
import TrainingAdmin from './pages/Admin/TrainingAdmin';
import Certificates from './pages/Admin/Certificates';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/lead-form" element={<LeadForm />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:slug" element={<TrainingDetail />} />
          <Route path="/my-training" element={<MyTraining />} />
          <Route path="/verify-cert/:certificateNumber" element={<CertificateVerify />} />
          <Route path="/client-portal" element={<ClientPortal />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<Leads />} />
          <Route path="/admin/consultations" element={<Consultations />} />
          <Route path="/admin/quotations" element={<Quotations />} />
          <Route path="/admin/projects" element={<Projects />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/cms" element={<CMS />} />
          <Route path="/admin/training" element={<TrainingAdmin />} />
          <Route path="/admin/certificates" element={<Certificates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
