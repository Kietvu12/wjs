import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Tag,
  Home,
} from 'lucide-react';

const AdminCompanyDetailPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCompanyDetail();
  }, [companyId]);

  const loadCompanyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCompanyById(companyId);
      
      if (response.success && response.data?.company) {
        setCompany(response.data.company);
      } else {
        setError(response.message || 'Không tìm thấy thông tin doanh nghiệp');
      }
    } catch (error) {
      console.error('Error loading company detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa doanh nghiệp "${company?.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteCompany(companyId);
      if (response.success) {
        alert('Xóa doanh nghiệp thành công!');
        navigate('/admin/companies');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa doanh nghiệp');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa doanh nghiệp');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await apiService.toggleCompanyStatus(companyId);
      if (response.success) {
        alert('Cập nhật trạng thái thành công!');
        loadCompanyDetail();
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy thông tin doanh nghiệp'}</p>
          <button
            onClick={() => navigate('/admin/companies')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/companies')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{company.name || 'Chi tiết doanh nghiệp'}</h1>
            <p className="text-xs text-gray-500 mt-1">Thông tin chi tiết về doanh nghiệp</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              company.status
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {company.status ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Đang hoạt động
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Ngừng hoạt động
              </>
            )}
          </button>
          <button
            onClick={() => navigate(`/admin/companies/${companyId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Building2 className="w-4 h-4 text-blue-600" />
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tên công ty</label>
                <p className="text-sm font-medium text-gray-900">{company.name || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Mã công ty</label>
                <p className="text-sm font-medium text-gray-900">{company.companyCode || '—'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Loại công ty</label>
                <p className="text-sm font-medium text-gray-900">
                  {company.type ? (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {company.type}
                    </span>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Trạng thái</label>
                <p className="text-sm font-medium">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    company.status
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {company.status ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Đang hoạt động
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Ngừng hoạt động
                      </>
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Mail className="w-4 h-4 text-blue-600" />
              Thông tin liên hệ
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Email chính</label>
                  <p className="text-sm text-gray-900">{company.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Số điện thoại</label>
                  <p className="text-sm text-gray-900">{company.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Địa chỉ</label>
                  <p className="text-sm text-gray-900">{company.address || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Website</label>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-900">—</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <FileText className="w-4 h-4 text-blue-600" />
                Mô tả công ty
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.description}</p>
              </div>
            </div>
          )}

          {/* Email Addresses */}
          {company.emailAddresses && company.emailAddresses.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Users className="w-4 h-4 text-blue-600" />
                Danh sách Email ({company.emailAddresses.length})
              </h2>
              <div className="space-y-2">
                {company.emailAddresses.map((emailAddr, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{emailAddr.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Fields */}
          {company.businessFields && company.businessFields.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Tag className="w-4 h-4 text-blue-600" />
                Lĩnh vực kinh doanh ({company.businessFields.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.businessFields.map((field, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {field.content}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Offices */}
          {company.offices && company.offices.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Home className="w-4 h-4 text-blue-600" />
                Văn phòng ({company.offices.length})
              </h2>
              <div className="space-y-3">
                {company.offices.map((office, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{office.address}</span>
                        </div>
                      </div>
                      {office.isHeadOffice && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          Văn phòng chính
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {company.jobs && company.jobs.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Công việc liên quan ({company.jobs.length})
              </h2>
              <div className="space-y-2">
                {company.jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Mã: {job.jobCode}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        job.status === 1
                          ? 'bg-green-100 text-green-700'
                          : job.status === 2
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status === 1 ? 'Published' : job.status === 2 ? 'Closed' : 'Draft'}
                      </span>
                    </div>
                  </button>
                ))}
                {company.jobs.length >= 10 && (
                  <button
                    onClick={() => navigate(`/admin/jobs?company=${companyId}`)}
                    className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xem tất cả công việc →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* Logo */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Building2 className="w-4 h-4 text-blue-600" />
              Logo công ty
            </h2>
            <div className="flex items-center justify-center">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              Thông tin hệ thống
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Ngày tạo</label>
                <p className="text-sm text-gray-900">{formatDate(company.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Cập nhật lần cuối</label>
                <p className="text-sm text-gray-900">{formatDate(company.updatedAt)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">ID</label>
                <p className="text-sm text-gray-900 font-mono">{company.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              Thao tác nhanh
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/admin/jobs?company=${companyId}`)}
                className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Xem tất cả công việc
              </button>
              <button
                onClick={() => navigate(`/admin/jobs/create?companyId=${companyId}`)}
                className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Tạo công việc mới
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyDetailPage;

