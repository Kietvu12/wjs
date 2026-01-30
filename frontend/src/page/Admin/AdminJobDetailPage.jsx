import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Tag,
  Users,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import apiService from '../../services/api';

const AdminJobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      loadJobDetail();
    }
  }, [jobId]);

  const loadJobDetail = async () => {
    if (!jobId) {
      setError('ID công việc không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminJobById(jobId);
      
      if (response.success && response.data?.job) {
        setJob(response.data.job);
      } else {
        setError(response.message || 'Không tìm thấy thông tin công việc');
      }
    } catch (error) {
      console.error('Error loading job detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa công việc này?')) {
      return;
    }

    if (!jobId) {
      alert('ID công việc không hợp lệ');
      return;
    }

    try {
      const response = await apiService.deleteAdminJob(jobId);
      if (response.success) {
        alert('Xóa công việc thành công!');
        navigate('/admin/jobs');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa công việc');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa công việc');
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

  const getStatusLabel = (status) => {
    const statusMap = {
      0: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
      1: { label: 'Published', color: 'bg-green-100 text-green-700' },
      2: { label: 'Closed', color: 'bg-red-100 text-red-700' },
      3: { label: 'Expired', color: 'bg-orange-100 text-orange-700' },
    };
    return statusMap[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/admin/jobs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách công việc
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Không tìm thấy thông tin công việc.</p>
        <button
          onClick={() => navigate('/admin/jobs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách công việc
        </button>
      </div>
    );
  }

  const statusInfo = getStatusLabel(job.status);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/jobs')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-600 mt-1">Mã việc làm: {job.jobCode || job.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            <button
              onClick={() => navigate(`/admin/jobs/${jobId}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Thông tin cơ bản
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mã việc làm</label>
                  <p className="text-sm text-gray-900 font-mono">{job.jobCode || job.id}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Tiêu đề</label>
                  <p className="text-sm text-gray-900 font-semibold">{job.title}</p>
                </div>
                {job.category && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Danh mục</label>
                    <p className="text-sm text-gray-900">{job.category.name}</p>
                  </div>
                )}
                {job.company && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Công ty</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {job.company.name}
                    </p>
                  </div>
                )}
                {job.description && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mô tả</label>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.description.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                )}
                {job.instruction && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Hướng dẫn ứng tuyển</label>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {job.instruction.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Values */}
            {job.jobValues && job.jobValues.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Tag className="w-6 h-6 text-blue-600" />
                  Job Values
                </h2>
                <div className="space-y-3">
                  {job.jobValues.map((jv, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Type</label>
                          <p className="text-gray-900">{jv.type?.typename || '—'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Value</label>
                          <p className="text-gray-900">{jv.valueRef?.valuename || '—'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Giá trị cụ thể</label>
                          <p className="text-gray-900">{jv.value || '—'}</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Bắt buộc</label>
                          <p className="text-gray-900">
                            {jv.isRequired ? (
                              <CheckCircle className="w-4 h-4 text-green-600 inline" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400 inline" />
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Thống kê
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lượt xem</span>
                  <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {job.viewsCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ứng tuyển</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {job.applications?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ngày tạo</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(job.createdAt || job.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ngày cập nhật</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(job.updatedAt || job.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Thông tin bổ sung
              </h2>
              <div className="space-y-4">
                {job.workLocation && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Địa điểm làm việc</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.workLocation}
                    </p>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Hạn nộp hồ sơ</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(job.deadline)}
                    </p>
                  </div>
                )}
                {job.estimatedSalary && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Lương ước tính</label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {job.estimatedSalary}
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

export default AdminJobDetailPage;

