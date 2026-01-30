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

  const downloadCV = (cvPath) => {
    if (cvPath) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const fullUrl = cvPath.startsWith('http') ? cvPath : `${baseUrl.replace('/api', '')}/${cvPath}`;
      window.open(fullUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loadingCandidate || 'Đang tải thông tin ứng viên...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/agent/candidates')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách ứng viên
        </button>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">{t.candidateNotFound || 'Không tìm thấy thông tin ứng viên.'}</p>
        <button
          onClick={() => navigate('/agent/candidates')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t.backToCandidates || 'Quay lại danh sách ứng viên'}
        </button>
      </div>
    );
  }

  // Parse JSON fields
  const educations = candidate.educations ? (typeof candidate.educations === 'string' ? JSON.parse(candidate.educations) : candidate.educations) : [];
  const workExperiences = candidate.workExperiences ? (typeof candidate.workExperiences === 'string' ? JSON.parse(candidate.workExperiences) : candidate.workExperiences) : [];
  const certificates = candidate.certificates ? (typeof candidate.certificates === 'string' ? JSON.parse(candidate.certificates) : candidate.certificates) : [];

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
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agent/candidates')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {candidate.name || candidate.nameKanji || 'Ứng viên'}
                {candidate.isDuplicate && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Duplicate
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">ID: {candidate.code || candidate.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/agent/candidates/${candidateId}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {t.edit || 'Chỉnh sửa'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0 overflow-x-auto">
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
                className={`px-4 py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {!hasData && <span className="text-gray-400 text-xs">(—)</span>}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-red-600" />
                Thông tin cá nhân
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Họ tên (Kanji)</label>
                  <p className="text-sm text-gray-900 font-medium">{candidate.name || candidate.nameKanji || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Họ tên (Kana)</label>
                  <p className="text-sm text-gray-900">{candidate.furigana || candidate.nameKana || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày sinh</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(candidate.birthDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tuổi</label>
                  <p className="text-sm text-gray-900">{candidate.ages || candidate.age || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Giới tính</label>
                  <p className="text-sm text-gray-900">{formatGender(candidate.gender)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Trạng thái</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    candidate.status === 1 ? 'bg-green-100 text-green-700' :
                    candidate.status === 2 ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {formatStatus(candidate.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {candidate.email || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Điện thoại</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {candidate.phone || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mã bưu điện</label>
                  <p className="text-sm text-gray-900">{candidate.postalCode || '—'}</p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Địa chỉ hiện tại</label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {candidate.addressCurrent || candidate.address || '—'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Địa chỉ gốc</label>
                  <p className="text-sm text-gray-900">{candidate.addressOrigin || '—'}</p>
                </div>
                {candidate.cvFile && (
                  <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">File CV</label>
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">CV File</p>
                        <p className="text-xs text-gray-500">{candidate.cvFile}</p>
                      </div>
                      <button
                        onClick={() => downloadCV(candidate.cvFile)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-6 h-6 text-red-600" />
                Thông tin visa & cư trú
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Nơi cư trú hiện tại</label>
                  <p className="text-sm text-gray-900">{formatResidence(candidate.currentResidence)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tình trạng cư trú tại Nhật</label>
                  <p className="text-sm text-gray-900">{formatJPResidenceStatus(candidate.jpResidenceStatus)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Ngày hết hạn visa</label>
                  <p className="text-sm text-gray-900">{formatDate(candidate.visaExpirationDate)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Quốc gia khác</label>
                  <p className="text-sm text-gray-900">{candidate.otherCountry || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Có hộ chiếu</label>
                  <p className="text-sm text-gray-900">{candidate.passport ? (t.yes || 'Có') : (t.no || 'Không')}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Có vợ/chồng</label>
                  <p className="text-sm text-gray-900">{candidate.spouse ? (t.yes || 'Có') : (t.no || 'Không')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Career & Salary */}
          {activeTab === 'career' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-red-600" />
                Thông tin nghề nghiệp & lương
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lương hiện tại</label>
                  <p className="text-sm text-gray-900 font-medium">{formatIncome(candidate.currentIncome)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lương mong muốn</label>
                  <p className="text-sm text-gray-900 font-medium">{formatIncome(candidate.desiredIncome)}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Địa điểm làm việc mong muốn</label>
                  <p className="text-sm text-gray-900">{candidate.desiredWorkLocation || candidate.desiredLocation || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Vị trí mong muốn</label>
                  <p className="text-sm text-gray-900">{candidate.desiredPosition || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Thời gian nhập công ty</label>
                  <p className="text-sm text-gray-900">{candidate.nyushaTime || candidate.desiredStartDate || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Thời gian phỏng vấn</label>
                  <p className="text-sm text-gray-900">{candidate.interviewTime || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Skills & Experience */}
          {activeTab === 'skills' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-red-600" />
                Kỹ năng & Kinh nghiệm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Kỹ năng kỹ thuật</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{candidate.technicalSkills || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Số năm kinh nghiệm</label>
                  <p className="text-sm text-gray-900">{candidate.experienceYears ? `${candidate.experienceYears} ${t.years || 'năm'}` : '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Trình độ JLPT</label>
                  <p className="text-sm text-gray-900">{candidate.jlptLevel ? `N${candidate.jlptLevel}` : '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Chuyên ngành</label>
                  <p className="text-sm text-gray-900">{candidate.specialization || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Trình độ chuyên môn</label>
                  <p className="text-sm text-gray-900">{candidate.qualification || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-red-600" />
                Học vấn
              </h2>
              {educations.length > 0 ? (
                <div className="space-y-4">
                  {educations.map((edu, index) => (
                    <div key={index} className="border-l-4 border-red-600 pl-6 py-4 bg-gray-50 rounded-r-lg">
                      <p className="font-semibold text-base text-gray-900 mb-1">{edu.school || edu.name || edu.content || '—'}</p>
                      {edu.major && <p className="text-sm text-gray-600 mb-2">{edu.major}</p>}
                      <p className="text-xs text-gray-500">
                        {edu.startDate || edu.year || '—'} - {edu.endDate || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có thông tin học vấn</p>
              )}
            </div>
          )}

          {/* Work Experience */}
          {activeTab === 'work' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-red-600" />
                Kinh nghiệm làm việc
              </h2>
              {workExperiences.length > 0 ? (
                <div className="space-y-4">
                  {workExperiences.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-6 py-4 bg-gray-50 rounded-r-lg">
                      <p className="font-semibold text-base text-gray-900 mb-1">{exp.company || exp.company_name || exp.name || '—'}</p>
                      {(exp.position || exp.role || exp.scale_role) && (
                        <p className="text-sm text-gray-600 mb-2">{exp.position || exp.role || exp.scale_role}</p>
                      )}
                      <p className="text-xs text-gray-500 mb-2">
                        {exp.period || exp.startDate || '—'} - {exp.endDate || (language === 'ja' ? '現在' : language === 'en' ? 'Current' : 'Hiện tại')}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
                      )}
                      {exp.tools_tech && (
                        <p className="text-xs text-gray-600 mt-2">Công cụ: {exp.tools_tech}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có thông tin kinh nghiệm làm việc</p>
              )}
            </div>
          )}

          {/* Certificates */}
          {activeTab === 'certificates' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-red-600" />
                Chứng chỉ
              </h2>
              {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="font-semibold text-base text-gray-900 mb-1">{cert.name || cert.title || '—'}</p>
                      {cert.organization && <p className="text-sm text-gray-600 mb-1">{cert.organization}</p>}
                      <p className="text-xs text-gray-500">{cert.date || cert.year || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có chứng chỉ</p>
              )}
            </div>
          )}

          {/* Self Introduction */}
          {activeTab === 'introduction' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-red-600" />
                Giới thiệu bản thân
              </h2>
              <div className="space-y-6">
                {candidate.careerSummary && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tóm tắt nghề nghiệp</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{candidate.careerSummary}</p>
                  </div>
                )}
                {candidate.strengths && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Điểm mạnh</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{candidate.strengths}</p>
                  </div>
                )}
                {candidate.motivation && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Động lực ứng tuyển</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{candidate.motivation}</p>
                  </div>
                )}
                {!candidate.careerSummary && !candidate.strengths && !candidate.motivation && (
                  <p className="text-gray-500 text-center py-8">Chưa có thông tin giới thiệu</p>
                )}
              </div>
            </div>
          )}

          {/* Duplicate Warning */}
          {candidate.isDuplicate && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-orange-900 mb-1">Cảnh báo: Hồ sơ trùng lặp</h3>
                  <p className="text-sm text-orange-700">
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
