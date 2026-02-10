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
  AlertTriangle,
  Edit,
  Download,
  Trash2,
  GraduationCap,
  Briefcase,
  Award,
  UserCircle,
  DollarSign,
  Globe,
  Building2,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import apiService from '../../services/api';

const AdminCandidateDetailPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [deleting, setDeleting] = useState(false);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredTabIndex, setHoveredTabIndex] = useState(null);
  const [hoveredDownloadCVButton, setHoveredDownloadCVButton] = useState(false);
  const [hoveredDownloadOtherButton, setHoveredDownloadOtherButton] = useState(false);

  useEffect(() => {
    loadCandidateDetail();
  }, [candidateId]);

  const loadCandidateDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminCVById(candidateId);
      
      if (response.success && response.data?.cv) {
        setCandidate(response.data.cv);
      } else {
        setError(response.message || 'Không tìm thấy thông tin ứng viên');
      }
    } catch (error) {
      console.error('Error loading candidate detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa ứng viên này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteAdminCV(candidateId);
      if (response.success) {
        alert('Xóa ứng viên thành công!');
        navigate('/admin/candidates');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa ứng viên');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa ứng viên');
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

  const formatGender = (gender) => {
    if (gender === 1 || gender === '男') return 'Nam';
    if (gender === 2 || gender === '女') return 'Nữ';
    if (gender === 3) return 'Khác';
    return '—';
  };

  const formatStatus = (status) => {
    if (status === 0) return 'Draft';
    if (status === 1) return 'Active';
    if (status === 2) return 'Archived';
    return '—';
  };

  const getStatusColor = (status) => {
    if (status === 1) return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' };
    if (status === 0) return { backgroundColor: '#f3f4f6', color: '#1f2937', borderColor: '#d1d5db' };
    return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
  };

  const downloadCV = async (cvPath) => {
    if (!cvPath) {
      alert('Không có file CV để tải xuống');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      let fullUrl;
      
      // If path starts with http, use it directly
      if (cvPath.startsWith('http')) {
        fullUrl = cvPath;
      } else {
        // Remove leading slash if exists and construct URL
        const cleanPath = cvPath.startsWith('/') ? cvPath.substring(1) : cvPath;
        const apiBase = baseUrl.replace('/api', '');
        fullUrl = `${apiBase}/${cleanPath}`;
      }
      
      // Encode URL properly to handle special characters
      const encodedUrl = encodeURI(fullUrl);
      
      // Try to open in new tab
      const newWindow = window.open(encodedUrl, '_blank');
      
      // If popup blocked, try download instead
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback: create download link
        const link = document.createElement('a');
        link.href = encodedUrl;
        link.download = cvPath.split('/').pop() || 'cv.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Không thể tải file CV. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="rounded-lg border p-8 text-center" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <p className="text-sm" style={{ color: '#dc2626' }}>{error || 'Không tìm thấy thông tin ứng viên'}</p>
        <button
          onClick={() => navigate('/admin/candidates')}
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

  // Parse JSON fields
  const educations = candidate.educations 
    ? (typeof candidate.educations === 'string' ? JSON.parse(candidate.educations) : candidate.educations)
    : [];
  const workExperiences = candidate.workExperiences 
    ? (typeof candidate.workExperiences === 'string' ? JSON.parse(candidate.workExperiences) : candidate.workExperiences)
    : [];
  const certificates = candidate.certificates 
    ? (typeof candidate.certificates === 'string' ? JSON.parse(candidate.certificates) : candidate.certificates)
    : [];

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: User },
    { id: 'education', label: 'Học vấn', icon: GraduationCap },
    { id: 'work', label: 'Kinh nghiệm', icon: Briefcase },
    { id: 'skills', label: 'Kỹ năng & Chứng chỉ', icon: Award },
    { id: 'introduction', label: 'Giới thiệu', icon: UserCircle },
    { id: 'preferences', label: 'Mong muốn', icon: DollarSign },
    { id: 'cv', label: 'File CV', icon: FileText },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/candidates')}
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
            <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Chi tiết ứng viên</h1>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
              {candidate.code || candidateId} - {candidate.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium border" style={getStatusColor(candidate.status)}>
            {formatStatus(candidate.status)}
          </span>
          {candidate.isDuplicate && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: '#fefce8', color: '#854d0e', borderColor: '#fde047' }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              Trùng lặp
            </div>
          )}
          <button
            onClick={() => navigate(`/admin/candidates/${candidateId}/edit`)}
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

      {/* Tabs */}
      <div className="rounded-lg border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex border-b overflow-x-auto" style={{ borderColor: '#e5e7eb' }}>
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => !isActive && setHoveredTabIndex(index)}
                onMouseLeave={() => setHoveredTabIndex(null)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap"
                style={{
                  borderColor: isActive ? '#2563eb' : 'transparent',
                  color: isActive 
                    ? '#2563eb' 
                    : (hoveredTabIndex === index ? '#111827' : '#4b5563'),
                  backgroundColor: isActive 
                    ? '#eff6ff' 
                    : (hoveredTabIndex === index ? '#f9fafb' : 'transparent')
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã CV</label>
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{candidate.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kanji)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Họ tên (Kana)</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày sinh</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatDate(candidate.birthDate)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tuổi</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Giới tính</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatGender(candidate.gender)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Email</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {candidate.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Số điện thoại</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <Phone className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {candidate.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mã bưu điện</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.postalCode || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa chỉ</label>
                <p className="text-sm flex items-center gap-1" style={{ color: '#111827' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                  {candidate.addressCurrent || candidate.address || '—'}
                </p>
              </div>
              {candidate.collaborator && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>CTV</label>
                  <p className="text-sm" style={{ color: '#111827' }}>
                    {candidate.collaborator.code || candidate.collaborator.name || '—'}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày nhận</label>
                <p className="text-sm" style={{ color: '#111827' }}>{formatDate(candidate.receiveDate || candidate.createdAt)}</p>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              {educations.length === 0 ? (
                <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có thông tin học vấn</p>
              ) : (
                educations.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4" style={{ color: '#2563eb' }} />
                      <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Năm</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{edu.year || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tháng</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{edu.month || '—'}</p>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Nội dung</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{edu.content || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'work' && (
            <div className="space-y-4">
              {workExperiences.length === 0 ? (
                <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có thông tin kinh nghiệm làm việc</p>
              ) : (
                workExperiences.map((work, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4" style={{ color: '#2563eb' }} />
                      <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Thời gian</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.period || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Tên công ty</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.company_name || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lĩnh vực kinh doanh</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.business_purpose || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Quy mô / Vai trò</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.scale_role || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Mô tả công việc</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.description || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Công cụ, công nghệ</label>
                        <p className="text-sm" style={{ color: '#111827' }}>{work.tools_tech || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Kỹ năng kỹ thuật</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.technicalSkills || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Chứng chỉ</label>
                {certificates.length === 0 ? (
                  <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có chứng chỉ</p>
                ) : (
                  <div className="space-y-2">
                    {certificates.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 border rounded-lg p-3" style={{ borderColor: '#e5e7eb' }}>
                        <Award className="w-4 h-4" style={{ color: '#2563eb' }} />
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs" style={{ color: '#6b7280' }}>Năm: </span>
                            <span className="text-sm" style={{ color: '#111827' }}>{cert.year || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs" style={{ color: '#6b7280' }}>Tháng: </span>
                            <span className="text-sm" style={{ color: '#111827' }}>{cert.month || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs" style={{ color: '#6b7280' }}>Tên: </span>
                            <span className="text-sm" style={{ color: '#111827' }}>{cert.name || '—'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'introduction' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Tóm tắt nghề nghiệp</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.careerSummary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Điểm mạnh</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.strengths || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>Động lực ứng tuyển</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#111827' }}>{candidate.motivation || '—'}</p>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương hiện tại</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.currentSalary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Lương mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredSalary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Vị trí mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredPosition || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Địa điểm mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredLocation || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6b7280' }}>Ngày bắt đầu mong muốn</label>
                <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredStartDate || '—'}</p>
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="space-y-4">
              {candidate.curriculumVitae ? (
                <div className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8" style={{ color: '#2563eb' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>File CV</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>{candidate.curriculumVitae}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadCV(candidate.curriculumVitae)}
                      onMouseEnter={() => setHoveredDownloadCVButton(true)}
                      onMouseLeave={() => setHoveredDownloadCVButton(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      style={{
                        backgroundColor: hoveredDownloadCVButton ? '#1d4ed8' : '#2563eb',
                        color: 'white'
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải xuống
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có file CV</p>
              )}
              {candidate.otherDocuments && (
                <div className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8" style={{ color: '#4b5563' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#111827' }}>Tài liệu khác</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>{candidate.otherDocuments}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadCV(candidate.otherDocuments)}
                      onMouseEnter={() => setHoveredDownloadOtherButton(true)}
                      onMouseLeave={() => setHoveredDownloadOtherButton(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      style={{
                        backgroundColor: hoveredDownloadOtherButton ? '#4b5563' : '#6b7280',
                        color: 'white'
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải xuống
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCandidateDetailPage;

