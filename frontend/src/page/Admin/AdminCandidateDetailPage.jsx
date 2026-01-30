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
    if (status === 1) return 'bg-green-100 text-green-800 border-green-300';
    if (status === 0) return 'bg-gray-100 text-gray-800 border-gray-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy thông tin ứng viên'}</p>
        <button
          onClick={() => navigate('/admin/candidates')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
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
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/candidates')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chi tiết ứng viên</h1>
            <p className="text-xs text-gray-500 mt-1">
              {candidate.code || candidateId} - {candidate.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(candidate.status)}`}>
            {formatStatus(candidate.status)}
          </span>
          {candidate.isDuplicate && (
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Trùng lặp
            </div>
          )}
          <button
            onClick={() => navigate(`/admin/candidates/${candidateId}/edit`)}
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

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
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
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mã CV</label>
                <p className="text-sm text-gray-900 font-medium">{candidate.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kanji)</label>
                <p className="text-sm text-gray-900">{candidate.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kana)</label>
                <p className="text-sm text-gray-900">{candidate.furigana || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày sinh</label>
                <p className="text-sm text-gray-900">{formatDate(candidate.birthDate)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tuổi</label>
                <p className="text-sm text-gray-900">{candidate.age || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Giới tính</label>
                <p className="text-sm text-gray-900">{formatGender(candidate.gender)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {candidate.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {candidate.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mã bưu điện</label>
                <p className="text-sm text-gray-900">{candidate.postalCode || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {candidate.addressCurrent || candidate.address || '—'}
                </p>
              </div>
              {candidate.collaborator && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">CTV</label>
                  <p className="text-sm text-gray-900">
                    {candidate.collaborator.code || candidate.collaborator.name || '—'}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày nhận</label>
                <p className="text-sm text-gray-900">{formatDate(candidate.receiveDate || candidate.createdAt)}</p>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              {educations.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có thông tin học vấn</p>
              ) : (
                educations.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Năm</label>
                        <p className="text-sm text-gray-900">{edu.year || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tháng</label>
                        <p className="text-sm text-gray-900">{edu.month || '—'}</p>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Nội dung</label>
                        <p className="text-sm text-gray-900">{edu.content || '—'}</p>
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
                <p className="text-sm text-gray-500">Chưa có thông tin kinh nghiệm làm việc</p>
              ) : (
                workExperiences.map((work, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Thời gian</label>
                        <p className="text-sm text-gray-900">{work.period || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tên công ty</label>
                        <p className="text-sm text-gray-900">{work.company_name || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Lĩnh vực kinh doanh</label>
                        <p className="text-sm text-gray-900">{work.business_purpose || '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Quy mô / Vai trò</label>
                        <p className="text-sm text-gray-900">{work.scale_role || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả công việc</label>
                        <p className="text-sm text-gray-900">{work.description || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Công cụ, công nghệ</label>
                        <p className="text-sm text-gray-900">{work.tools_tech || '—'}</p>
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
                <label className="block text-xs font-semibold text-gray-500 mb-2">Kỹ năng kỹ thuật</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{candidate.technicalSkills || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Chứng chỉ</label>
                {certificates.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có chứng chỉ</p>
                ) : (
                  <div className="space-y-2">
                    {certificates.map((cert, index) => (
                      <div key={index} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3">
                        <Award className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Năm: </span>
                            <span className="text-sm text-gray-900">{cert.year || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Tháng: </span>
                            <span className="text-sm text-gray-900">{cert.month || '—'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Tên: </span>
                            <span className="text-sm text-gray-900">{cert.name || '—'}</span>
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
                <label className="block text-xs font-semibold text-gray-500 mb-2">Tóm tắt nghề nghiệp</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{candidate.careerSummary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Điểm mạnh</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{candidate.strengths || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Động lực ứng tuyển</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{candidate.motivation || '—'}</p>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Lương hiện tại</label>
                <p className="text-sm text-gray-900">{candidate.currentSalary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Lương mong muốn</label>
                <p className="text-sm text-gray-900">{candidate.desiredSalary || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Vị trí mong muốn</label>
                <p className="text-sm text-gray-900">{candidate.desiredPosition || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Địa điểm mong muốn</label>
                <p className="text-sm text-gray-900">{candidate.desiredLocation || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày bắt đầu mong muốn</label>
                <p className="text-sm text-gray-900">{candidate.desiredStartDate || '—'}</p>
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="space-y-4">
              {candidate.curriculumVitae ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">File CV</p>
                        <p className="text-xs text-gray-500">{candidate.curriculumVitae}</p>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}${candidate.curriculumVitae}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải xuống
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có file CV</p>
              )}
              {candidate.otherDocuments && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-gray-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Tài liệu khác</p>
                        <p className="text-xs text-gray-500">{candidate.otherDocuments}</p>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}${candidate.otherDocuments}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải xuống
                    </a>
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

