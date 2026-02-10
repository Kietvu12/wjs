import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Briefcase,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  GraduationCap,
  Award,
  UserCircle,
} from 'lucide-react';
import apiService from '../../services/api';
import NominationChat from '../../component/Chat/NominationChat';
import NominationTimeline from '../../component/Chat/NominationTimeline';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';

const AdminNominationDetailPage = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredViewCandidateButton, setHoveredViewCandidateButton] = useState(false);
  const [hoveredViewJobButton, setHoveredViewJobButton] = useState(false);
  const [hoveredViewCollaboratorButton, setHoveredViewCollaboratorButton] = useState(false);
  const [hoveredDownloadCVButton, setHoveredDownloadCVButton] = useState(false);

  useEffect(() => {
    loadNominationDetail();
  }, [nominationId]);

  const loadNominationDetail = async () => {
    if (!nominationId) {
      setError('ID đơn tiến cử không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminJobApplicationById(nominationId);
      
      if (response.success && response.data?.jobApplication) {
        setNomination(response.data.jobApplication);
      } else {
        setError(response.message || 'Không tìm thấy thông tin đơn tiến cử');
      }
    } catch (error) {
      console.error('Error loading nomination detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin đơn tiến cử');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn tiến cử này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteAdminJobApplication(nominationId);
      if (response.success) {
        alert('Xóa đơn tiến cử thành công!');
        navigate('/admin/nominations');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa đơn tiến cử');
      }
    } catch (error) {
      console.error('Error deleting nomination:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa đơn tiến cử');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const formatStatus = (status) => {
    return getJobApplicationStatus(status);
  };

  const getStatusIcon = (status) => {
    if (status === 8 || status === 10 || status === 12 || status === 13) return <CheckCircle className="w-4 h-4" />;
    if (status === 15 || status === 16 || status === 7 || status === 9 || status === 14) return <XCircle className="w-4 h-4" />;
    if (status === 4 || status === 5) return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
      </div>
    );
  }

  if (error || !nomination) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || 'Không tìm thấy thông tin đơn tiến cử'}</p>
        <button
          onClick={() => navigate('/admin/nominations')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const statusInfo = formatStatus(nomination.status);
  const cv = nomination.cv || {};
  const job = nomination.job || {};
  const collaborator = nomination.collaborator || {};

  // Parse JSON fields
  const educations = cv.educations 
    ? (typeof cv.educations === 'string' ? JSON.parse(cv.educations) : cv.educations)
    : [];
  const workExperiences = cv.workExperiences 
    ? (typeof cv.workExperiences === 'string' ? JSON.parse(cv.workExperiences) : cv.workExperiences)
    : [];
  const certificates = cv.certificates 
    ? (typeof cv.certificates === 'string' ? JSON.parse(cv.certificates) : cv.certificates)
    : [];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/nominations')}
            onMouseEnter={() => setHoveredBackButton(true)}
            onMouseLeave={() => setHoveredBackButton(false)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#4b5563' }} />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Chi tiết đơn tiến cử</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              ID: {nomination.id} - {nomination.name || cv.fullName || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1" style={statusInfo.style || { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' }}>
            {getStatusIcon(nomination.status)}
            <span className="ml-1">{statusInfo.label}</span>
          </span>
          <button
            onClick={() => navigate(`/admin/nominations/${nominationId}/edit`)}
            onMouseEnter={() => setHoveredEditButton(true)}
            onMouseLeave={() => setHoveredEditButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredEditButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Edit className="w-3.5 h-3.5" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            onMouseEnter={() => !deleting && setHoveredDeleteButton(true)}
            onMouseLeave={() => setHoveredDeleteButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: deleting
                ? '#fca5a5'
                : (hoveredDeleteButton ? '#b91c1c' : '#dc2626'),
              color: 'white',
              opacity: deleting ? 0.5 : 1,
              cursor: deleting ? 'not-allowed' : 'pointer'
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa
          </button>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex gap-3 h-[calc(100vh-180px)]">
        {/* Left Column - Timeline (1/8 width) */}
        <div className="w-[12.5%] flex-shrink-0">
          <NominationTimeline nomination={nomination} />
        </div>

        {/* Middle Column - Chat (reduced width) */}
        <div className="w-[45%] flex-shrink-0">
          <NominationChat 
            jobApplicationId={nomination.id} 
            userType="admin"
            collaboratorId={nomination.collaboratorId}
            onScheduleInterview={() => loadNominationDetail()}
            onScheduleNyusha={() => loadNominationDetail()}
          />
        </div>

        {/* Right Column - Details (increased width) */}
        <div className="w-[42.5%] flex-shrink-0 overflow-y-auto space-y-3">
          {/* Nomination Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <FileText className="w-4 h-4" style={{ color: '#2563eb' }} />
              Thông tin đơn tiến cử
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>ID</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{nomination.id}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Trạng thái</label>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border" style={statusInfo.style || { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' }}>
                  {getStatusIcon(nomination.status)}
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày tiến cử</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(nomination.appliedAt)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày phỏng vấn</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {formatDate(nomination.interviewDate)}
                </p>
              </div>
              {nomination.referralFee && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Phí giới thiệu</label>
                  <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#111827' }}>
                    <DollarSign className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                    {nomination.referralFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              )}
              {(nomination.annualSalary || nomination.monthlySalary) && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương</label>
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {nomination.annualSalary 
                      ? `${nomination.annualSalary.toLocaleString('vi-VN')}万円/năm`
                      : `${nomination.monthlySalary.toLocaleString('vi-VN')}万円/tháng`}
                  </p>
                </div>
              )}
              {nomination.notes && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ghi chú</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{nomination.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <User className="w-4 h-4" style={{ color: '#2563eb' }} />
              Thông tin ứng viên
            </h2>
            {cv.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>{cv.fullName || cv.name || '—'}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{cv.code || '—'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/candidates/${cv.id}`)}
                    onMouseEnter={() => setHoveredViewCandidateButton(true)}
                    onMouseLeave={() => setHoveredViewCandidateButton(false)}
                    className="text-xs flex items-center gap-1"
                    style={{
                      color: hoveredViewCandidateButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    Xem chi tiết
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                      <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Điện thoại</label>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                      <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày sinh</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{formatDate(cv.birthDate || nomination.birthDate)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giới tính</label>
                    <p className="text-sm" style={{ color: '#111827' }}>
                      {cv.gender === 1 || cv.gender === '男' ? 'Nam' : cv.gender === 2 || cv.gender === '女' ? 'Nữ' : '—'}
                    </p>
                  </div>
                  {cv.addressCurrent && (
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ</label>
                      <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                        {cv.addressCurrent}
                      </p>
                    </div>
                  )}
                </div>
                {cv.curriculumVitae && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>File CV</label>
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}${cv.curriculumVitae}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setHoveredDownloadCVButton(true)}
                      onMouseLeave={() => setHoveredDownloadCVButton(false)}
                      className="inline-flex items-center gap-1 text-xs"
                      style={{
                        color: hoveredDownloadCVButton ? '#1e40af' : '#2563eb'
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải xuống CV
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{nomination.name || '—'}</p>
                </div>
                {nomination.email && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{nomination.email}</p>
                  </div>
                )}
                {nomination.phone && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Điện thoại</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{nomination.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Information */}
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
              Thông tin công việc
            </h2>
            {job.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>{job.title || '—'}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{job.jobCode || job.id}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    onMouseEnter={() => setHoveredViewJobButton(true)}
                    onMouseLeave={() => setHoveredViewJobButton(false)}
                    className="text-xs flex items-center gap-1"
                    style={{
                      color: hoveredViewJobButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    Xem chi tiết
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                {job.company && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công ty</label>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                      <Building2 className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {job.company.name || '—'}
                    </p>
                  </div>
                )}
                {job.description && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mô tả</label>
                    <p className="text-sm line-clamp-3" style={{ color: '#111827' }}>{job.description}</p>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương ước tính</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{job.estimatedSalary}</p>
                  </div>
                )}
                {job.workLocation && (
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm làm việc</label>
                    <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                      {job.workLocation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#6b7280' }}>Không có thông tin công việc</p>
            )}
          </div>

          {/* Collaborator Information */}
          {collaborator.id && (
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                <UserCircle className="w-4 h-4" style={{ color: '#2563eb' }} />
                Cộng tác viên
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{collaborator.name || '—'}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>{collaborator.code || collaborator.id}</p>
                </div>
                <button
                  onClick={() => navigate(`/admin/collaborators/${collaborator.id}`)}
                  onMouseEnter={() => setHoveredViewCollaboratorButton(true)}
                  onMouseLeave={() => setHoveredViewCollaboratorButton(false)}
                  className="text-xs flex items-center gap-1"
                  style={{
                    color: hoveredViewCollaboratorButton ? '#1e40af' : '#2563eb'
                  }}
                >
                  Xem chi tiết
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNominationDetailPage;

