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
  ExternalLink,
  Edit,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';
import ChatMessageComponent from '../../component/Chat/ChatMessageComponent';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';

const NominationDetail = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNominationDetail();
  }, [nominationId]);

  const loadNominationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getJobApplicationById(nominationId);
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn tiến cử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/agent/nominations')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách đơn tiến cử
        </button>
      </div>
    );
  }

  if (!nomination) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Không tìm thấy thông tin đơn tiến cử.</p>
        <button
          onClick={() => navigate('/agent/nominations')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách đơn tiến cử
        </button>
      </div>
    );
  }

  const statusInfo = formatStatus(nomination.status);
  const job = nomination.job || {};
  const cv = nomination.cv || {};

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agent/nominations')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn tiến cử</h1>
              <p className="text-sm text-gray-600 mt-1">ID: {nomination.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Candidate Information */}
          <div className="space-y-6">
            {/* Candidate Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-red-600" />
                  Thông tin ứng viên
                </h2>
                {cv.id && (
                  <button
                    onClick={() => navigate(`/agent/candidates/${cv.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    Xem chi tiết
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Họ tên</label>
                  <p className="text-sm text-gray-900 font-medium">{cv.name || nomination.name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Furigana</label>
                  <p className="text-sm text-gray-900">{cv.furigana || nomination.furigana || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Điện thoại</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Địa chỉ</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {cv.addressCurrent || nomination.addressCurrent || '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày sinh</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(cv.birthDate || nomination.birthDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tuổi</label>
                    <p className="text-sm text-gray-900">{cv.ages || nomination.ages || '—'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Giới tính</label>
                  <p className="text-sm text-gray-900">
                    {nomination.gender === 1 ? 'Nam' : nomination.gender === 2 ? 'Nữ' : '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lương hiện tại</label>
                    <p className="text-sm text-gray-900">{cv.currentIncome || nomination.currentIncome || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lương mong muốn</label>
                    <p className="text-sm text-gray-900">{cv.desiredIncome || nomination.desiredIncome || '—'}</p>
                  </div>
                </div>
                {cv.code && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mã CV</label>
                    <p className="text-sm text-gray-900 font-mono">{cv.code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-red-600" />
                Thông tin đơn ứng tuyển
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Trạng thái</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày ứng tuyển</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(nomination.appliedAt || nomination.applied_at)}
                  </p>
                </div>
                {nomination.interviewDate || nomination.interview_date ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày phỏng vấn</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(nomination.interviewDate || nomination.interview_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.interviewRound2Date || nomination.interview_round2_date ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày phỏng vấn vòng 2</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(nomination.interviewRound2Date || nomination.interview_round2_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.nyushaDate || nomination.nyusha_date ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày nhập công ty</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(nomination.nyushaDate || nomination.nyusha_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.monthlySalary || nomination.monthly_salary ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lương tháng</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {nomination.monthlySalary || nomination.monthly_salary}
                    </p>
                  </div>
                ) : null}
                {nomination.selfPromotion || nomination.self_promotion ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tự giới thiệu</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {nomination.selfPromotion || nomination.self_promotion}
                    </p>
                  </div>
                ) : null}
                {nomination.reasonApply || nomination.reason_apply ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lý do ứng tuyển</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {nomination.reasonApply || nomination.reason_apply}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column - Job Information */}
          <div className="space-y-6">
            {/* Job Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-red-600" />
                  Thông tin công việc
                </h2>
                {job.id && (
                  <button
                    onClick={() => navigate(`/agent/jobs/${job.id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    Xem chi tiết
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tiêu đề công việc</label>
                  <p className="text-lg font-semibold text-gray-900">{job.title || '—'}</p>
                </div>
                {job.jobCode && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mã công việc</label>
                    <p className="text-sm text-gray-900 font-mono">{job.jobCode}</p>
                  </div>
                )}
                {job.company && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Công ty</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {job.company.name || '—'}
                    </p>
                  </div>
                )}
                {job.category && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Danh mục</label>
                    <p className="text-sm text-gray-900">{job.category.name || '—'}</p>
                  </div>
                )}
                {job.workLocation && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Địa điểm làm việc</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.workLocation}
                    </p>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mức lương dự kiến</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {job.estimatedSalary}
                    </p>
                  </div>
                )}
                {job.description && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mô tả công việc</label>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                      {job.description.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Hạn nộp hồ sơ</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-red-600" />
                Lịch sử đơn ứng tuyển
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Đơn đã được tạo</p>
                    <p className="text-xs text-gray-500">{formatDate(nomination.createdAt || nomination.created_at)}</p>
                  </div>
                </div>
                {nomination.appliedAt || nomination.applied_at ? (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Đã gửi đơn ứng tuyển</p>
                      <p className="text-xs text-gray-500">{formatDate(nomination.appliedAt || nomination.applied_at)}</p>
                    </div>
                  </div>
                ) : null}
                {nomination.interviewDate || nomination.interview_date ? (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Đã phỏng vấn</p>
                      <p className="text-xs text-gray-500">{formatDate(nomination.interviewDate || nomination.interview_date)}</p>
                    </div>
                  </div>
                ) : null}
                {nomination.nyushaDate || nomination.nyusha_date ? (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Đã nhập công ty</p>
                      <p className="text-xs text-gray-500">{formatDate(nomination.nyushaDate || nomination.nyusha_date)}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-red-600" />
                Tin nhắn với Admin
              </h2>
              <div className="h-96">
                <ChatMessageComponent 
                  jobApplicationId={nomination.id} 
                  userType="ctv"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominationDetail;

