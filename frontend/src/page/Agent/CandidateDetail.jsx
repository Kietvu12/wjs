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
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
  UserCircle,
  DollarSign,
  Globe,
  Building2,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const CandidateDetail = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredEditButton, setHoveredEditButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);
  const [hoveredDownloadButton, setHoveredDownloadButton] = useState(false);
  const [hoveredTabButtons, setHoveredTabButtons] = useState({});

  useEffect(() => {
    loadCandidateDetail();
  }, [candidateId]);

  const loadCandidateDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCVStorageById(candidateId);
      
      if (response.success && response.data?.cv) {
        setCandidate(response.data.cv);
      } else {
        setError(response.message || t.candidateNotFound || 'Không tìm thấy thông tin ứng viên');
      }
    } catch (error) {
      console.error('Error loading candidate detail:', error);
      setError(error.message || t.errorLoadingCandidate || 'Lỗi khi tải thông tin ứng viên');
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

  const formatGender = (gender) => {
    if (gender === 1 || gender === '男') return t.male || 'Nam';
    if (gender === 2 || gender === '女') return t.female || 'Nữ';
    if (gender === 3) return t.other || 'Khác';
    return '—';
  };

  const formatStatus = (status) => {
    if (status === 0) return t.draft || 'Draft';
    if (status === 1) return t.active || 'Active';
    if (status === 2) return t.archived || 'Archived';
    return '—';
  };

  const formatResidence = (residence) => {
    if (residence === 1) return t.japan || 'Nhật Bản';
    if (residence === 2) return t.otherCountryLabel || 'Khác';
    return '—';
  };

  const formatJPResidenceStatus = (status) => {
    const statusMap = {
      1: '技能実習',
      2: '留学生',
      3: '企業内転勤',
      4: '技術人文国際',
      5: '研修'
    };
    return statusMap[status] || '—';
  };

  const formatIncome = (income) => {
    if (!income) return '—';
    if (typeof income === 'string') return income;
    return `${income.toLocaleString()}円`;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#ef4444' }}></div>
          <p style={{ color: '#4b5563' }}>{t.loadingCandidate || 'Đang tải thông tin ứng viên...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mb-4" style={{ color: '#ef4444' }}>{error}</div>
        <button
          onClick={() => navigate('/agent/candidates')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          Quay lại danh sách ứng viên
        </button>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-8">
        <p className="mb-4" style={{ color: '#4b5563' }}>{t.candidateNotFound || 'Không tìm thấy thông tin ứng viên.'}</p>
        <button
          onClick={() => navigate('/agent/candidates')}
          onMouseEnter={() => setHoveredBackToListButton(true)}
          onMouseLeave={() => setHoveredBackToListButton(false)}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
            color: 'white'
          }}
        >
          {t.backToCandidates || 'Quay lại danh sách ứng viên'}
        </button>
      </div>
    );
  }

  // Helper function to safely parse JSON array fields
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Parse JSON fields - ensure they are always arrays
  const educations = parseArrayField(candidate?.educations);
  const workExperiences = parseArrayField(candidate?.workExperiences);
  const certificates = parseArrayField(candidate?.certificates);

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: User },
    { id: 'visa', label: 'Visa & Cư trú', icon: Globe },
    { id: 'career', label: 'Nghề nghiệp', icon: Briefcase },
    { id: 'skills', label: 'Kỹ năng & Kinh nghiệm', icon: Award },
    { id: 'education', label: 'Học vấn', icon: GraduationCap },
    { id: 'work', label: 'Kinh nghiệm làm việc', icon: Building2 },
    { id: 'certificates', label: 'Chứng chỉ', icon: Award },
    { id: 'introduction', label: 'Giới thiệu', icon: UserCircle },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="border-b px-6 py-4 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agent/candidates')}
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
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
                {candidate.name || candidate.nameKanji || 'Ứng viên'}
                {candidate.isDuplicate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#fed7aa', color: '#c2410c' }}>
                    <AlertTriangle className="w-3 h-3" />
                    Duplicate
                  </span>
                )}
              </h1>
              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>ID: {candidate.code || candidate.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/agent/candidates/${candidateId}/edit`)}
              onMouseEnter={() => setHoveredEditButton(true)}
              onMouseLeave={() => setHoveredEditButton(false)}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              style={{
                backgroundColor: hoveredEditButton ? '#1d4ed8' : '#2563eb',
                color: 'white'
              }}
            >
              <Edit className="w-4 h-4" />
              {t.edit || 'Chỉnh sửa'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b px-6 flex-shrink-0 overflow-x-auto" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasData = 
              (tab.id === 'personal') ||
              (tab.id === 'visa' && (candidate.currentResidence || candidate.jpResidenceStatus)) ||
              (tab.id === 'career' && (candidate.currentIncome || candidate.desiredIncome)) ||
              (tab.id === 'skills' && (candidate.technicalSkills || candidate.experienceYears)) ||
              (tab.id === 'education' && educations.length > 0) ||
              (tab.id === 'work' && workExperiences.length > 0) ||
              (tab.id === 'certificates' && certificates.length > 0) ||
              (tab.id === 'introduction' && (candidate.careerSummary || candidate.strengths || candidate.motivation));

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => !isActive && setHoveredTabButtons(prev => ({ ...prev, [tab.id]: true }))}
                onMouseLeave={() => setHoveredTabButtons(prev => ({ ...prev, [tab.id]: false }))}
                className="px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                style={{
                  borderColor: isActive ? '#2563eb' : (hoveredTabButtons[tab.id] ? '#d1d5db' : 'transparent'),
                  color: isActive ? '#2563eb' : (hoveredTabButtons[tab.id] ? '#111827' : '#4b5563')
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {!hasData && <span className="text-xs" style={{ color: '#9ca3af' }}>(—)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div>
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <User className="w-6 h-6" style={{ color: '#ef4444' }} />
                Thông tin cá nhân
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Họ tên (Kanji)</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{candidate.name || candidate.nameKanji || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Họ tên (Kana)</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.furigana || candidate.nameKana || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày sinh</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {formatDate(candidate.birthDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Tuổi</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.ages || candidate.age || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Giới tính</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{formatGender(candidate.gender)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Trạng thái</label>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={
                    candidate.status === 1 ? { backgroundColor: '#dcfce7', color: '#15803d' } :
                    candidate.status === 2 ? { backgroundColor: '#f3f4f6', color: '#374151' } :
                    { backgroundColor: '#fef9c3', color: '#854d0e' }
                  }>
                    {formatStatus(candidate.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Email</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <Mail className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {candidate.email || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Điện thoại</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <Phone className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {candidate.phone || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Mã bưu điện</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.postalCode || '—'}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Địa chỉ hiện tại</label>
                  <p className="text-sm flex items-center gap-2" style={{ color: '#111827' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#9ca3af' }} />
                    {candidate.addressCurrent || candidate.address || '—'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Địa chỉ gốc</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.addressOrigin || '—'}</p>
                </div>
                {candidate.cvFile && (
                  <div className="md:col-span-2 lg:col-span-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>File CV</label>
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8" style={{ color: '#9ca3af' }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: '#111827' }}>CV File</p>
                        <p className="text-xs" style={{ color: '#6b7280' }}>{candidate.cvFile}</p>
                      </div>
                      <button
                        onClick={() => downloadCV(candidate.cvFile)}
                        onMouseEnter={() => setHoveredDownloadButton(true)}
                        onMouseLeave={() => setHoveredDownloadButton(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: hoveredDownloadButton ? '#1d4ed8' : '#2563eb',
                          color: 'white'
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Tải xuống
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visa & Residence */}
          {activeTab === 'visa' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <Globe className="w-6 h-6" style={{ color: '#ef4444' }} />
                Thông tin visa & cư trú
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Nơi cư trú hiện tại</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{formatResidence(candidate.currentResidence)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Tình trạng cư trú tại Nhật</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{formatJPResidenceStatus(candidate.jpResidenceStatus)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ngày hết hạn visa</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{formatDate(candidate.visaExpirationDate)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Quốc gia khác</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.otherCountry || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Có hộ chiếu</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.passport ? (t.yes || 'Có') : (t.no || 'Không')}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Có vợ/chồng</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.spouse ? (t.yes || 'Có') : (t.no || 'Không')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Career & Salary */}
          {activeTab === 'career' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <DollarSign className="w-6 h-6" style={{ color: '#ef4444' }} />
                Thông tin nghề nghiệp & lương
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lương hiện tại</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{formatIncome(candidate.currentIncome)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Lương mong muốn</label>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{formatIncome(candidate.desiredIncome)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Địa điểm làm việc mong muốn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredWorkLocation || candidate.desiredLocation || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Vị trí mong muốn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.desiredPosition || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Thời gian nhập công ty</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.nyushaTime || candidate.desiredStartDate || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Thời gian phỏng vấn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.interviewTime || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Skills & Experience */}
          {activeTab === 'skills' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <Briefcase className="w-6 h-6" style={{ color: '#ef4444' }} />
                Kỹ năng & Kinh nghiệm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Kỹ năng kỹ thuật</label>
                  <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>{candidate.technicalSkills || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Số năm kinh nghiệm</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.experienceYears ? `${candidate.experienceYears} ${t.years || 'năm'}` : '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Trình độ JLPT</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.jlptLevel ? `N${candidate.jlptLevel}` : '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Chuyên ngành</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.specialization || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Trình độ chuyên môn</label>
                  <p className="text-sm" style={{ color: '#111827' }}>{candidate.qualification || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <GraduationCap className="w-6 h-6" style={{ color: '#ef4444' }} />
                Học vấn
              </h2>
              {educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((edu, index) => (
                    <div key={index} className="border-l-4 pl-6 py-4 rounded-r-lg" style={{ borderColor: '#ef4444', backgroundColor: '#f9fafb' }}>
                      <p className="font-semibold text-base mb-1" style={{ color: '#111827' }}>{edu.school || edu.name || edu.content || '—'}</p>
                      {edu.major && <p className="text-sm mb-2" style={{ color: '#4b5563' }}>{edu.major}</p>}
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        {edu.startDate || edu.year || '—'} - {edu.endDate || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: '#6b7280' }}>Chưa có thông tin học vấn</p>
              )}
            </div>
          )}

          {/* Work Experience */}
          {activeTab === 'work' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <Briefcase className="w-6 h-6" style={{ color: '#ef4444' }} />
                Kinh nghiệm làm việc
              </h2>
              {workExperiences.length > 0 ? (
                <div className="space-y-4">
                  {workExperiences.map((exp, index) => (
                    <div key={index} className="border-l-4 pl-6 py-4 rounded-r-lg" style={{ borderColor: '#2563eb', backgroundColor: '#f9fafb' }}>
                      <p className="font-semibold text-base mb-1" style={{ color: '#111827' }}>{exp.company || exp.company_name || exp.name || '—'}</p>
                      {(exp.position || exp.role || exp.scale_role) && (
                        <p className="text-sm mb-2" style={{ color: '#4b5563' }}>{exp.position || exp.role || exp.scale_role}</p>
                      )}
                      <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
                        {exp.period || exp.startDate || '—'} - {exp.endDate || (language === 'ja' ? '現在' : language === 'en' ? 'Current' : 'Hiện tại')}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: '#374151' }}>{exp.description}</p>
                      )}
                      {exp.tools_tech && (
                        <p className="text-xs mt-2" style={{ color: '#4b5563' }}>Công cụ: {exp.tools_tech}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: '#6b7280' }}>Chưa có thông tin kinh nghiệm làm việc</p>
              )}
            </div>
          )}

          {/* Certificates */}
          {activeTab === 'certificates' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <Award className="w-6 h-6" style={{ color: '#ef4444' }} />
                Chứng chỉ
              </h2>
              {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-4 transition-shadow" style={{ borderColor: '#e5e7eb' }}>
                      <p className="font-semibold text-base mb-1" style={{ color: '#111827' }}>{cert.name || cert.title || '—'}</p>
                      {cert.organization && <p className="text-sm mb-1" style={{ color: '#4b5563' }}>{cert.organization}</p>}
                      <p className="text-xs" style={{ color: '#6b7280' }}>{cert.date || cert.year || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: '#6b7280' }}>Chưa có chứng chỉ</p>
              )}
            </div>
          )}

          {/* Self Introduction */}
          {activeTab === 'introduction' && (
            <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: '#111827' }}>
                <UserCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
                Giới thiệu bản thân
              </h2>
              <div className="space-y-6">
                {candidate.careerSummary && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Tóm tắt nghề nghiệp</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>{candidate.careerSummary}</p>
                  </div>
                )}
                {candidate.strengths && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Điểm mạnh</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>{candidate.strengths}</p>
                  </div>
                )}
                {candidate.motivation && (
                  <div>
                    <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: '#6b7280' }}>Động lực ứng tuyển</label>
                    <p className="text-sm whitespace-pre-wrap p-4 rounded-lg" style={{ color: '#111827', backgroundColor: '#f9fafb' }}>{candidate.motivation}</p>
                  </div>
                )}
                {!candidate.careerSummary && !candidate.strengths && !candidate.motivation && (
                  <p className="text-center py-8" style={{ color: '#6b7280' }}>Chưa có thông tin giới thiệu</p>
                )}
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {candidate.isDuplicate && (
            <div className="mt-6 rounded-xl p-6" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#ea580c' }} />
                <div>
                  <h3 className="font-bold mb-1" style={{ color: '#9a3412' }}>Cảnh báo: Hồ sơ trùng lặp</h3>
                  <p className="text-sm" style={{ color: '#c2410c' }}>
                    Hồ sơ này đã được đánh dấu là trùng lặp với hồ sơ khác trong hệ thống.
                    {candidate.duplicateWithCvId && (
                      <span className="block mt-1">
                        ID hồ sơ trùng: {candidate.duplicateWithCvId}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
