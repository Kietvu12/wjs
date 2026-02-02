import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './component/ProtectedRoute';
import AgentLayout from './component/Layout/AgentLayout';
import AdminLayout from './component/Layout/AdminLayout';
import HomePage from './page/Agent/HomePage';
import JobsPage from './page/Agent/JobsPage';
import CandidatesPage from './page/Agent/CandidatesPage';
import NominationsPage from './page/Agent/NominationsPage';
import PaymentHistoryPage from './page/Agent/PaymentHistoryPage';
import ContactPage from './page/Agent/ContactPage';
import FAQPage from './page/Agent/FAQPage';
import TermsPage from './page/Agent/TermsPage';
import HotlinePage from './page/Agent/HotlinePage';
import JobsDetail from './page/Agent/JobsDetail';
import AddCandidate from './page/Agent/AddCandidate';
import NominationPage from './page/Agent/NominationPage';
import CandidateDetail from './page/Agent/CandidateDetail';
import EditCandidate from './page/Agent/EditCandidate';
import NominationDetail from './page/Agent/NominationDetail';
import Dashboard from './page/Admin/Dashboard';
import CollaboratorsPage from './page/Admin/CollaboratorsPage';
import AddCollaboratorPage from './page/Admin/AddCollaboratorPage';
import CollaboratorRankingPage from './page/Admin/CollaboratorRankingPage';
import AdminCollaboratorDetailPage from './page/Admin/AdminCollaboratorDetailPage';
import AdminCandidatesPage from './page/Admin/CandidatesPage';
import AdminAddCandidatePage from './page/Admin/AddCandidatePage';
import AdminCandidateDetailPage from './page/Admin/AdminCandidateDetailPage';
import AdminJobsPage from './page/Admin/JobsPage';
import AdminAddJobPage from './page/Admin/AddJobPage';
import AdminJobDetailPage from './page/Admin/AdminJobDetailPage';
import AdminNominationsPage from './page/Admin/NominationsPage';
import AdminAddNominationPage from './page/Admin/AddNominationPage';
import AdminNominationPage from './page/Admin/AdminNominationPage';
import AdminNominationDetailPage from './page/Admin/AdminNominationDetailPage';
import PaymentsPage from './page/Admin/PaymentsPage';
import CompaniesPage from './page/Admin/CompaniesPage';
import AddCompanyPage from './page/Admin/AddCompanyPage';
import AdminCompanyDetailPage from './page/Admin/AdminCompanyDetailPage';
import ReportsPage from './page/Admin/ReportsPage';
import AccountsPage from './page/Admin/AccountsPage';
import CampaignsPage from './page/Admin/CampaignsPage';
import AddCampaignPage from './page/Admin/AddCampaignPage';
import AdminCampaignDetailPage from './page/Admin/AdminCampaignDetailPage';
import EmailsPage from './page/Admin/EmailsPage';
import SettingsPage from './page/Admin/SettingsPage';
import JobCategoriesPage from './page/Admin/JobCategoriesPage';
import AddJobCategoryPage from './page/Admin/AddJobCategoryPage';
import LoginPage from './page/LoginPage';

// Component để xử lý redirect từ "/"
const RootRedirect = () => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  // Nếu đã đăng nhập, redirect về trang tương ứng
  if (token && userType) {
    if (userType === 'ctv') {
      return <Navigate to="/agent" replace />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  // Nếu chưa đăng nhập, redirect về trang login
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Login Routes */}
          <Route path="/login" element={<LoginPage defaultUserType="ctv" />} />
          <Route path="/admin/login" element={<LoginPage defaultUserType="admin" />} />

          {/* Agent Routes - Yêu cầu đăng nhập với userType = 'ctv' */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute requiredUserType="ctv">
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:jobId" element={<JobsDetail />} />
            <Route path="jobs/:jobId/nominate" element={<NominationPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="candidates/create" element={<AddCandidate />} />
            <Route path="candidates/:candidateId" element={<CandidateDetail />} />
            <Route path="candidates/:candidateId/edit" element={<EditCandidate />} />
            <Route path="nominations" element={<NominationsPage />} />
            <Route path="nominations/:nominationId" element={<NominationDetail />} />
            <Route path="payment-history" element={<PaymentHistoryPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="hotline" element={<HotlinePage />} />
          </Route>

          {/* Admin Routes - Yêu cầu đăng nhập với userType = 'admin' */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="collaborators" element={<CollaboratorsPage />} />
            <Route path="collaborators/new" element={<AddCollaboratorPage />} />
            <Route path="collaborators/:collaboratorId" element={<AdminCollaboratorDetailPage />} />
            <Route path="collaborators/ranking" element={<CollaboratorRankingPage />} />
            <Route path="candidates" element={<AdminCandidatesPage />} />
            <Route path="candidates/create" element={<AdminAddCandidatePage />} />
            <Route path="candidates/:candidateId" element={<AdminCandidateDetailPage />} />
            <Route path="candidates/:candidateId/edit" element={<AdminAddCandidatePage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="jobs/create" element={<AdminAddJobPage />} />
            <Route path="jobs/:jobId" element={<AdminJobDetailPage />} />
            <Route path="jobs/:jobId/edit" element={<AdminAddJobPage />} />
            <Route path="jobs/:jobId/nominate" element={<AdminNominationPage />} />
            <Route path="nominations" element={<AdminNominationsPage />} />
            <Route path="nominations/create" element={<AdminAddNominationPage />} />
            <Route path="nominations/:nominationId" element={<AdminNominationDetailPage />} />
            <Route path="nominations/:nominationId/edit" element={<AdminAddNominationPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="companies/create" element={<AddCompanyPage />} />
            <Route path="companies/:companyId" element={<AdminCompanyDetailPage />} />
            <Route path="companies/:companyId/edit" element={<AddCompanyPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/create" element={<AddCampaignPage />} />
            <Route path="campaigns/:campaignId" element={<AdminCampaignDetailPage />} />
            <Route path="campaigns/:campaignId/edit" element={<AddCampaignPage />} />
            <Route path="job-categories" element={<JobCategoriesPage />} />
            <Route path="job-categories/add" element={<AddJobCategoryPage />} />
            <Route path="job-categories/:categoryId/edit" element={<AddJobCategoryPage />} />
            <Route path="emails" element={<EmailsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Root route - Redirect dựa trên trạng thái đăng nhập */}
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
