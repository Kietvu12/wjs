import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Trash2,
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Building2,
} from 'lucide-react';
import apiService from '../../services/api';

const AdminCampaignDetailPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    loadCampaignDetail();
    loadCampaignJobs();
  }, [campaignId]);

  const loadCampaignDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminCampaignById(campaignId);
      
      if (response.success && response.data?.campaign) {
        setCampaign(response.data.campaign);
      } else {
        setError(response.message || 'Không tìm thấy thông tin chiến dịch');
      }
    } catch (error) {
      console.error('Error loading campaign detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin chiến dịch');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignJobs = async () => {
    try {
      setJobsLoading(true);
      const response = await apiService.getAdminJobs({ 
        campaignId: campaignId,
        limit: 100 
      });
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading campaign jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa chiến dịch này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteAdminCampaign(campaignId);
      if (response.success) {
        alert('Xóa chiến dịch thành công!');
        navigate('/admin/campaigns');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa chiến dịch');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa chiến dịch');
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
    const statusMap = {
      0: { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
      1: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      2: { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock },
    };
    return statusMap[status] || statusMap[0];
  };

  const getStatusFromDates = (startDate, endDate, status) => {
    if (status === 1) return { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle };
    if (status === 2) return { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock };
    if (status === 0) {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (now < start) return { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock };
      if (now > end) return { label: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock };
      return { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle };
    }
    return { label: 'Ngừng hoạt động', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy thông tin chiến dịch'}</p>
        <button
          onClick={() => navigate('/admin/campaigns')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const statusInfo = getStatusFromDates(
    campaign.startDate || campaign.start_date,
    campaign.endDate || campaign.end_date,
    campaign.status
  );
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chi tiết chiến dịch</h1>
            <p className="text-xs text-gray-500 mt-1">
              ID: {campaign.id} - {campaign.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusInfo.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
          <button
            onClick={() => navigate(`/admin/campaigns/${campaignId}/edit`)}
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
        {/* Left Column - Campaign Info */}
        <div className="lg:col-span-2 space-y-3">
          {/* Campaign Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Target className="w-4 h-4 text-blue-600" />
              Thông tin chiến dịch
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên chiến dịch</label>
                <p className="text-sm text-gray-900 font-semibold">{campaign.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{campaign.description || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày bắt đầu</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(campaign.startDate || campaign.start_date)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày kết thúc</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(campaign.endDate || campaign.end_date)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Số CV tối đa</label>
                  <p className="text-sm text-gray-900">{campaign.maxCv || campaign.max_cv || 0}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phần trăm (%)</label>
                  <p className="text-sm text-gray-900">{campaign.percent || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs in Campaign */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Danh sách công việc ({jobs.length})
            </h2>
            {jobsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Đang tải...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Chưa có công việc nào trong chiến dịch này</p>
                <button
                  onClick={() => navigate(`/admin/jobs?campaign=${campaignId}`)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  Thêm công việc
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <button
                          onClick={() => navigate(`/admin/jobs/${job.id}`)}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                        >
                          {job.title || '—'}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <div className="flex items-center gap-2 mt-1">
                          {job.company && (
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {job.company.name || '—'}
                            </span>
                          )}
                          {job.jobCode && (
                            <span className="text-xs text-gray-500">({job.jobCode})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Statistics */}
        <div className="space-y-3">
          {/* Statistics */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Thống kê
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-medium text-blue-800">Số job</span>
                </div>
                <div className="text-lg font-bold text-blue-900">{jobs.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-[10px] font-medium text-green-800">Ứng tuyển</span>
                </div>
                <div className="text-lg font-bold text-green-900">{campaign.applicationsCount || campaign.applications?.length || 0}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[10px] font-medium text-purple-800">Tiến cử</span>
                </div>
                <div className="text-lg font-bold text-purple-900">{campaign.nominationsCount || 0}</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-[10px] font-medium text-orange-800">Lượt xem</span>
                </div>
                <div className="text-lg font-bold text-orange-900">{campaign.viewsCount || 0}</div>
              </div>
            </div>
          </div>

          {/* Campaign Applications */}
          {campaign.applications && campaign.applications.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
                <Users className="w-4 h-4 text-blue-600" />
                Đơn ứng tuyển ({campaign.applications.length})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {campaign.applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-2 text-xs"
                  >
                    <div className="font-medium text-gray-900">
                      {app.collaborator?.name || '—'} - {app.job?.title || '—'}
                    </div>
                    <div className="text-gray-500 mt-1">
                      {app.job?.jobCode || app.job?.id || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignDetailPage;

