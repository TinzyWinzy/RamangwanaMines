import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout, AdminLayout } from './components/layout';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import LeadForm from './pages/LeadForm';
import RoiCalculator from './pages/RoiCalculator';
import ClientDashboard from './pages/ClientDashboard';
import FieldLogging from './pages/FieldLogging';
import DocumentApproval from './pages/DocumentApproval';
import SafetyObservations from './pages/SafetyObservations';
import OperationalEfficiency from './pages/OperationalEfficiency';
import TradeCenter from './pages/TradeCenter';
import Invoices from './pages/Invoices';
import ProcurementTracker from './pages/ProcurementTracker';
import Training from './pages/Training';
import TrainingDetail from './pages/TrainingDetail';
import MyTraining from './pages/MyTraining';
import CertificateVerify from './pages/CertificateVerify';
import ClientPortal from './pages/ClientPortal';
import AdminDashboard from './pages/Admin/Dashboard';
import Leads from './pages/Admin/Leads';
import Consultations from './pages/Admin/Consultations';
import Quotations from './pages/Admin/Quotations';
import ProjectsAdmin from './pages/Admin/Projects';
import Analytics from './pages/Admin/Analytics';
import CMS from './pages/Admin/CMS';
import TrainingAdmin from './pages/Admin/TrainingAdmin';
import Certificates from './pages/Admin/Certificates';
import GradeBook from './pages/Admin/GradeBook';
import AssessmentBuilder from './pages/Admin/AssessmentBuilder';
import WhatsAppMessages from './pages/Admin/WhatsAppMessages';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/operational-efficiency" element={<OperationalEfficiency />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/lead-form" element={<LeadForm />} />
          <Route path="/roi-calculator" element={<RoiCalculator />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/trade-center" element={<TradeCenter />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/projects/:projectId/field-log" element={<FieldLogging />} />
          <Route path="/projects/:projectId/documents" element={<DocumentApproval />} />
          <Route path="/procurement/:projectId" element={<ProcurementTracker />} />
          <Route path="/safety" element={<SafetyObservations />} />
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
          <Route path="/admin/projects" element={<ProjectsAdmin />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/cms" element={<CMS />} />
          <Route path="/admin/training" element={<TrainingAdmin />} />
          <Route path="/admin/certificates" element={<Certificates />} />
          <Route path="/admin/grade-book" element={<GradeBook />} />
          <Route path="/admin/assessment-builder" element={<AssessmentBuilder />} />
          <Route path="/admin/whatsapp" element={<WhatsAppMessages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
