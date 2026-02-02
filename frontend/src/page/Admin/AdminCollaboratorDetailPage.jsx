import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  DollarSign,
  Award,
  Building2,
  Info,
  CheckCircle,
  XCircle,
  Briefcase,
  Users,
  Globe,
  CreditCard,
  FileText,
} from 'lucide-react';
import apiService from '../../services/api';

const AdminCollaboratorDetailPage = () => {
  const { collaboratorId } = useParams();
  const navigate = useNavigate();
  const [collaborator, setCollaborator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCollaboratorDetail();
  }, [collaboratorId]);

  const loadCollaboratorDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCollaboratorById(collaboratorId);
      
      if (response.success && response.data?.collaborator) {
        setCollaborator(response.data.collaborator);
      } else {
        setError(response.message || 'Không tìm thấy thông tin CTV');
      }
    } catch (error) {
      console.error('Error loading collaborator detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin CTV');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa CTV này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await apiService.deleteCollaborator(collaboratorId);
      if (response.success) {
        alert('Xóa CTV thành công!');
        navigate('/admin/collaborators');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa CTV');
      }
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa CTV');
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
    if (gender === 1 || gender === '1') return 'Nam';
    if (gender === 2 || gender === '2') return 'Nữ';
    if (gender === 3 || gender === '3') return 'Khác';
    return '—';
  };

  const formatStatus = (status) => {
    if (status === 0) return 'Ngừng hoạt động';
    if (status === 1) return 'Đang hoạt động';
    return '—';
  };

  const getStatusColor = (status) => {
    if (status === 1) return 'bg-green-100 text-green-800 border-green-300';
    if (status === 0) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatOrganizationType = (type) => {
    if (type === 'individual') return 'Cá nhân';
    if (type === 'company') return 'Công ty';
    if (type === 'organization') return 'Tổ chức';
    return type || '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !collaborator) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-sm text-red-600">{error || 'Không tìm thấy thông tin CTV'}</p>
        <button
          onClick={() => navigate('/admin/collaborators')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản', icon: User },
    { id: 'contact', label: 'Liên hệ', icon: Mail },
    { id: 'organization', label: 'Tổ chức', icon: Building2 },
    { id: 'banking', label: 'Ngân hàng', icon: CreditCard },
    { id: 'rank', label: 'Cấp độ & Điểm', icon: Award },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/collaborators')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chi tiết CTV</h1>
            <p className="text-xs text-gray-500 mt-1">
              {collaborator.code || collaboratorId} - {collaborator.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(collaborator.status)}`}>
            {formatStatus(collaborator.status)}
          </span>
          <button
            onClick={() => navigate(`/admin/collaborators/${collaboratorId}/edit`)}
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
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mã CTV</label>
                <p className="text-sm text-gray-900 font-medium">{collaborator.code || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên CTV</label>
                <p className="text-sm text-gray-900">{collaborator.name || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {collaborator.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {collaborator.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày sinh</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(collaborator.birthday)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Giới tính</label>
                <p className="text-sm text-gray-900">{formatGender(collaborator.gender)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Loại tổ chức</label>
                <p className="text-sm text-gray-900">{formatOrganizationType(collaborator.organizationType)}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Trạng thái</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(collaborator.status)}`}>
                  {formatStatus(collaborator.status)}
                </span>
              </div>
              {collaborator.description && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả</label>
                  <p className="text-sm text-gray-900">{collaborator.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {collaborator.email || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {collaborator.phone || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Quốc gia</label>
                <p className="text-sm text-gray-900">{collaborator.country || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Mã bưu điện</label>
                <p className="text-sm text-gray-900">{collaborator.postCode || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {collaborator.address || '—'}
                </p>
              </div>
              {collaborator.facebook && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Facebook</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    <a href={collaborator.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {collaborator.facebook}
                    </a>
                  </p>
                </div>
              )}
              {collaborator.zalo && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Zalo</label>
                  <p className="text-sm text-gray-900">{collaborator.zalo}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Loại tổ chức</label>
                <p className="text-sm text-gray-900">{formatOrganizationType(collaborator.organizationType)}</p>
              </div>
              {collaborator.organizationType !== 'individual' && (
                <>
                  {collaborator.companyName && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Tên công ty</label>
                      <p className="text-sm text-gray-900">{collaborator.companyName}</p>
                    </div>
                  )}
                  {collaborator.taxCode && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Mã số thuế</label>
                      <p className="text-sm text-gray-900">{collaborator.taxCode}</p>
                    </div>
                  )}
                  {collaborator.website && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Website</label>
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <a href={collaborator.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {collaborator.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {collaborator.businessAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ kinh doanh</label>
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {collaborator.businessAddress}
                      </p>
                    </div>
                  )}
                  {collaborator.businessLicense && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Giấy phép kinh doanh</label>
                      <p className="text-sm text-gray-900">{collaborator.businessLicense}</p>
                    </div>
                  )}
                  {collaborator.organizationLink && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Link tổ chức</label>
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <a href={collaborator.organizationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {collaborator.organizationLink}
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}
              {collaborator.group && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Nhóm</label>
                  <p className="text-sm text-gray-900">{collaborator.group.name || collaborator.group.code || '—'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'banking' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên ngân hàng</label>
                <p className="text-sm text-gray-900">{collaborator.bankName || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Số tài khoản</label>
                <p className="text-sm text-gray-900">{collaborator.bankAccount || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tên chủ tài khoản</label>
                <p className="text-sm text-gray-900">{collaborator.bankAccountName || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Chi nhánh</label>
                <p className="text-sm text-gray-900">{collaborator.bankBranch || '—'}</p>
              </div>
            </div>
          )}

          {activeTab === 'rank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collaborator.rankLevel && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Cấp độ</label>
                    <p className="text-sm text-gray-900 font-medium">{collaborator.rankLevel.name || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phần trăm hoa hồng</label>
                    <p className="text-sm text-gray-900 font-medium">{collaborator.rankLevel.percent || 0}%</p>
                  </div>
                  {collaborator.rankLevel.pointsRequired && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Điểm yêu cầu</label>
                      <p className="text-sm text-gray-900">{collaborator.rankLevel.pointsRequired}</p>
                    </div>
                  )}
                  {collaborator.rankLevel.description && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả cấp độ</label>
                      <p className="text-sm text-gray-900">{collaborator.rankLevel.description}</p>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Điểm hiện tại</label>
                <p className="text-sm text-gray-900 font-medium">{collaborator.points || 0}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày tham gia</label>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(collaborator.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCollaboratorDetailPage;

