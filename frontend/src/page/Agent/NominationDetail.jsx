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
import NominationChat from '../../component/Chat/NominationChat';
import NominationTimeline from '../../component/Chat/NominationTimeline';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';

const NominationDetail = () => {
  const { nominationId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredViewCandidateButton, setHoveredViewCandidateButton] = useState(false);
  const [hoveredViewJobButton, setHoveredViewJobButton] = useState(false);

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
    const statusInfo = getJobApplicationStatus(status);
    // Convert Tailwind color classes to inline styles
    const colorStyle = convertColorClassesToStyle(statusInfo.color);
    return {
      ...statusInfo,
      colorStyle
    };
  };

  // Helper function to convert Tailwind color classes to inline styles
  const convertColorClassesToStyle = (colorClasses) => {
    if (!colorClasses) return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
    
    const colorMap = {
      'bg-yellow-100': { backgroundColor: '#fef9c3' },
      'text-yellow-800': { color: '#854d0e' },
      'border-yellow-300': { borderColor: '#fde047' },
      'bg-blue-100': { backgroundColor: '#dbeafe' },
      'text-blue-800': { color: '#1e40af' },
      'border-blue-300': { borderColor: '#93c5fd' },
      'bg-purple-100': { backgroundColor: '#f3e8ff' },
      'text-purple-800': { color: '#6b21a8' },
      'border-purple-300': { borderColor: '#c084fc' },
      'bg-indigo-100': { backgroundColor: '#e0e7ff' },
      'text-indigo-800': { color: '#3730a3' },
      'border-indigo-300': { borderColor: '#a5b4fc' },
      'bg-cyan-100': { backgroundColor: '#cffafe' },
      'text-cyan-800': { color: '#155e75' },
      'border-cyan-300': { borderColor: '#67e8f9' },
      'bg-teal-100': { backgroundColor: '#ccfbf1' },
      'text-teal-800': { color: '#115e59' },
      'border-teal-300': { borderColor: '#5eead4' },
      'bg-sky-100': { backgroundColor: '#e0f2fe' },
      'text-sky-800': { color: '#0c4a6e' },
      'border-sky-300': { borderColor: '#7dd3fc' },
      'bg-green-100': { backgroundColor: '#dcfce7' },
      'text-green-800': { color: '#166534' },
      'border-green-300': { borderColor: '#86efac' },
      'bg-amber-100': { backgroundColor: '#fef3c7' },
      'text-amber-800': { color: '#92400e' },
      'border-amber-300': { borderColor: '#fcd34d' },
      'bg-orange-100': { backgroundColor: '#fed7aa' },
      'text-orange-800': { color: '#9a3412' },
      'border-orange-300': { borderColor: '#fdba74' },
      'bg-emerald-100': { backgroundColor: '#d1fae5' },
      'text-emerald-800': { color: '#065f46' },
      'border-emerald-300': { borderColor: '#6ee7b7' },
      'bg-red-100': { backgroundColor: '#fee2e2' },
      'text-red-800': { color: '#991b1b' },
      'border-red-300': { borderColor: '#fca5a5' },
      'bg-gray-100': { backgroundColor: '#f3f4f6' },
      'text-gray-800': { color: '#1f2937' },
      'border-gray-300': { borderColor: '#d1d5db' },
    };

    const classes = colorClasses.split(' ');
    const style = {};
    classes.forEach(cls => {
      if (colorMap[cls]) {
        Object.assign(style, colorMap[cls]);
      }
    });

    return Object.keys(style).length > 0 ? style : { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#ef4444' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải thông tin đơn tiến cử...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mb-4" style={{ color: '#ef4444' }}>{error}</div>
        <button
          onClick={() => navigate('/agent/nominations')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          Quay lại danh sách đơn tiến cử
        </button>
      </div>
    );
  }

  if (!nomination) {
    return (
      <div className="text-center py-8">
        <p className="mb-4" style={{ color: '#4b5563' }}>Không tìm thấy thông tin đơn tiến cử.</p>
        <button
          onClick={() => navigate('/agent/nominations')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
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
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agent/nominations')}
              onMouseEnter={() => setHoveredBackButton(true)}
              onMouseLeave={() => setHoveredBackButton(false)}
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#374151' }} />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Chi tiết đơn tiến cử</h1>
              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>ID: {nomination.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={statusInfo.colorStyle || { backgroundColor: '#f3f4f6', color: '#1f2937' }}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Content - 3 Column Layout */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="flex gap-6 h-full">
          {/* Left Column - Timeline (1/8 width) */}
          <div className="w-[12.5%] flex-shrink-0">
            <NominationTimeline nomination={nomination} />
          </div>

          {/* Middle Column - Chat (reduced width) */}
          <div className="w-[45%] flex-shrink-0">
            <NominationChat 
              jobApplicationId={nomination.id} 
              userType="ctv"
              onScheduleInterview={() => loadNominationDetail()}
              onScheduleNyusha={() => loadNominationDetail()}
            />
          </div>

          {/* Right Column - Details (increased width) */}
          <div className="w-[42.5%] flex-shrink-0 overflow-y-auto space-y-6">
            {/* Candidate Info Card */}
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                  <User className="w-6 h-6" style={{ color: '#ef4444' }} />
                  Thông tin ứng viên
                </h2>
                {cv.id && (
                  <button
                    onClick={() => navigate(`/agent/candidates/${cv.id}`)}
                    onMouseEnter={() => setHoveredViewCandidateButton(true)}
                    onMouseLeave={() => setHoveredViewCandidateButton(false)}
                    className="text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{
                      color: hoveredViewCandidateButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    Xem chi tiết
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Họ tên</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{cv.name || nomination.name || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Furigana</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{cv.furigana || nomination.furigana || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Email</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Mail className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {cv.email || nomination.email || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Điện thoại</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Phone className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {cv.phone || nomination.phone || '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Địa chỉ</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {cv.addressCurrent || nomination.addressCurrent || '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày sinh</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(cv.birthDate || nomination.birthDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Tuổi</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{cv.ages || nomination.ages || '—'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Giới tính</label>
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {nomination.gender === 1 ? 'Nam' : nomination.gender === 2 ? 'Nữ' : '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lương hiện tại</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{cv.currentIncome || nomination.currentIncome || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lương mong muốn</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{cv.desiredIncome || nomination.desiredIncome || '—'}</p>
                  </div>
                </div>
                {cv.code && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Mã CV</label>
                    <p className="text-sm font-mono" style={{ color: '#111827' }}>{cv.code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details Card */}
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <FileText className="w-6 h-6" style={{ color: '#ef4444' }} />
                Thông tin đơn ứng tuyển
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Trạng thái</label>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium" style={statusInfo.colorStyle || { backgroundColor: '#f3f4f6', color: '#1f2937' }}>
                    {statusInfo.label}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày ứng tuyển</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {formatDate(nomination.appliedAt || nomination.applied_at)}
                  </p>
                </div>
                {nomination.interviewDate || nomination.interview_date ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày phỏng vấn</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(nomination.interviewDate || nomination.interview_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.interviewRound2Date || nomination.interview_round2_date ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày phỏng vấn vòng 2</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(nomination.interviewRound2Date || nomination.interview_round2_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.nyushaDate || nomination.nyusha_date ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày nhập công ty</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(nomination.nyushaDate || nomination.nyusha_date)}
                    </p>
                  </div>
                ) : null}
                {nomination.monthlySalary || nomination.monthly_salary ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lương tháng</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <DollarSign className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {nomination.monthlySalary || nomination.monthly_salary}
                    </p>
                  </div>
                ) : null}
                {nomination.selfPromotion || nomination.self_promotion ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Tự giới thiệu</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>
                      {nomination.selfPromotion || nomination.self_promotion}
                    </p>
                  </div>
                ) : null}
                {nomination.reasonApply || nomination.reason_apply ? (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lý do ứng tuyển</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>
                      {nomination.reasonApply || nomination.reason_apply}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Job Info Card */}
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                  <Briefcase className="w-6 h-6" style={{ color: '#ef4444' }} />
                  Thông tin công việc
                </h2>
                {job.id && (
                  <button
                    onClick={() => navigate(`/agent/jobs/${job.id}`)}
                    onMouseEnter={() => setHoveredViewJobButton(true)}
                    onMouseLeave={() => setHoveredViewJobButton(false)}
                    className="text-sm font-medium flex items-center gap-1 transition-colors"
                    style={{
                      color: hoveredViewJobButton ? '#1e40af' : '#2563eb'
                    }}
                  >
                    Xem chi tiết
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Tiêu đề công việc</label>
                  <p className="text-lg font-semibold" style={{ color: '#111827' }}>{job.title || '—'}</p>
                </div>
                {job.jobCode && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Mã công việc</label>
                    <p className="text-sm font-mono" style={{ color: '#111827' }}>{job.jobCode}</p>
                  </div>
                )}
                {job.company && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Công ty</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Building2 className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {job.company.name || '—'}
                    </p>
                  </div>
                )}
                {job.category && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Danh mục</label>
                    <p className="text-sm" style={{ color: '#111827' }}>{job.category.name || '—'}</p>
                  </div>
                )}
                {job.workLocation && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Địa điểm làm việc</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <MapPin className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {job.workLocation}
                    </p>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Mức lương dự kiến</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <DollarSign className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {job.estimatedSalary}
                    </p>
                  </div>
                )}
                {job.description && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Mô tả công việc</label>
                    <div className="text-sm whitespace-pre-wrap p-4 rounded-lg max-h-60 overflow-y-auto" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>
                      {job.description.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Hạn nộp hồ sơ</label>
                    <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                      <Clock className="w-4 h-4" style={{ color: '#9ca3af' }} />
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominationDetail;

