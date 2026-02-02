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
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';

const AdminNominationDetailPage = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !nomination) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy thông tin đơn tiến cử'}</p>
        <button
          onClick={() => navigate('/admin/nominations')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
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
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/nominations')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chi tiết đơn tiến cử</h1>
            <p className="text-xs text-gray-500 mt-1">
              ID: {nomination.id} - {nomination.name || cv.fullName || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            {getStatusIcon(nomination.status)}
            <span className="ml-1">{statusInfo.label}</span>
          </span>
          <button
            onClick={() => navigate(`/admin/nominations/${nominationId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - Candidate & Job Info */}
        <div className="lg:col-span-2 space-y-3">
          {/* Nomination Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Thông tin đơn tiến cử
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ID</label>
                <p className="text-sm text-gray-900 font-medium">{nomination.id}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                  {getStatusIcon(nomination.status)}
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày tiến cử</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(nomination.appliedAt)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày phỏng vấn</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(nomination.interviewDate)}
                </p>
              </div>
              {nomination.referralFee && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phí giới thiệu</label>
                  <p className="text-sm text-gray-900 font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                    {nomination.referralFee.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              )}
              {(nomination.annualSalary || nomination.monthlySalary) && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lương</label>
                  <p className="text-sm text-gray-900">
                    {nomination.annualSalary 
                      ? `${nomination.annualSalary.toLocaleString('vi-VN')}万円/năm`
                      : `${nomination.monthlySalary.toLocaleString('vi-VN')}万円/tháng`}
                  </p>
                </div>
              )}
              {nomination.notes && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ghi chú</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{nomination.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <User className="w-4 h-4 text-blue-600" />
              Thông tin ứng viên
            </h2>
            {cv.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{cv.fullName || cv.name || '—'}</p>
                    <p className="text-xs text-gray-500">{cv.code || '—'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/candidates/${cv.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                  >
                    Xem chi tiết
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Điện thoại</label>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày sinh</label>
                    <p className="text-sm text-gray-900">{formatDate(cv.birthDate || nomination.birthDate)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Giới tính</label>
                    <p className="text-sm text-gray-900">
                      {cv.gender === 1 || cv.gender === '男' ? 'Nam' : cv.gender === 2 || cv.gender === '女' ? 'Nữ' : '—'}
                    </p>
                  </div>
                  {cv.addressCurrent && (
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ</label>
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {cv.addressCurrent}
                      </p>
                    </div>
                  )}
                </div>
                {cv.curriculumVitae && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">File CV</label>
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}${cv.curriculumVitae}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tên</label>
                  <p className="text-sm text-gray-900">{nomination.name || '—'}</p>
                </div>
                {nomination.email && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{nomination.email}</p>
                  </div>
                )}
                {nomination.phone && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Điện thoại</label>
                    <p className="text-sm text-gray-900">{nomination.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Thông tin công việc
            </h2>
            {job.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{job.title || '—'}</p>
                    <p className="text-xs text-gray-500">{job.jobCode || job.id}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                  >
                    Xem chi tiết
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                {job.company && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Công ty</label>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {job.company.name || '—'}
                    </p>
                  </div>
                )}
                {job.description && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả</label>
                    <p className="text-sm text-gray-900 line-clamp-3">{job.description}</p>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Lương ước tính</label>
                    <p className="text-sm text-gray-900">{job.estimatedSalary}</p>
                  </div>
                )}
                {job.workLocation && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Địa điểm làm việc</label>
                    <p className="text-sm text-gray-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {job.workLocation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Không có thông tin công việc</p>
            )}
          </div>

          {/* Collaborator Information */}
          {collaborator.id && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <UserCircle className="w-4 h-4 text-blue-600" />
                Cộng tác viên
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{collaborator.name || '—'}</p>
                  <p className="text-xs text-gray-500">{collaborator.code || collaborator.id}</p>
                </div>
                <button
                  onClick={() => navigate(`/admin/collaborators/${collaborator.id}`)}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                >
                  Xem chi tiết
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-1">
          <div className="h-[calc(100vh-200px)]">
            <NominationChat 
              jobApplicationId={nomination.id} 
              userType="admin"
              collaboratorId={nomination.collaboratorId}
              onScheduleInterview={() => loadNominationDetail()}
              onScheduleNyusha={() => loadNominationDetail()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNominationDetailPage;

