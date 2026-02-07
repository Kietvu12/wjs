import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Users,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
} from 'lucide-react';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadGroupDetail();
      loadStatistics();
    }
  }, [id]);

  const loadGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getGroupById(id);
      
      if (response.success && response.data?.group) {
        setGroup(response.data.group);
      } else {
        setError(response.message || 'Không tìm thấy thông tin nhóm');
      }
    } catch (error) {
      console.error('Error loading group detail:', error);
      setError(error.message || 'Lỗi khi tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiService.getGroupStatistics(id);
      if (response.success && response.data) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadAvailableAdmins = async () => {
    try {
      const response = await apiService.getAdmins({ role: 3, limit: 1000 }); // Admin CA Team
      if (response.success && response.data?.admins) {
        // Filter out admins already in this group
        const adminsInGroup = group?.admins?.map(a => a.id) || [];
        const available = response.data.admins.filter(a => !adminsInGroup.includes(a.id));
        setAvailableAdmins(available);
      }
    } catch (error) {
      console.error('Error loading available admins:', error);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedAdminId) {
      alert('Vui lòng chọn admin');
      return;
    }

    try {
      setAssigning(true);
      await apiService.assignAdminToGroup(id, selectedAdminId);
      setShowAssignModal(false);
      setSelectedAdminId('');
      loadGroupDetail();
      loadStatistics();
    } catch (error) {
      console.error('Error assigning admin:', error);
      alert(error.message || 'Không thể gán admin vào nhóm');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      setRemoving(true);
      await apiService.removeAdminFromGroup(id, adminId);
      setShowRemoveModal(null);
      loadGroupDetail();
      loadStatistics();
    } catch (error) {
      console.error('Error removing admin:', error);
      alert(error.message || 'Không thể gỡ admin khỏi nhóm');
    } finally {
      setRemoving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/groups')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Mã nhóm: {group.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/groups/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Thông tin
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admins'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Thành viên ({group.admins?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'statistics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Thống kê
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tên nhóm</label>
              <p className="text-sm text-gray-900 mt-1">{group.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mã nhóm</label>
              <p className="text-sm text-gray-900 mt-1">{group.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mã giới thiệu</label>
              <p className="text-sm text-gray-900 mt-1">{group.referralCode || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <div className="mt-1">
                {group.status === 1 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Đang hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3" />
                    Không hoạt động
                  </span>
                )}
              </div>
            </div>
            {group.description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <p className="text-sm text-gray-900 mt-1">{group.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">Ngày tạo</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(group.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Ngày cập nhật</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(group.updatedAt)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Thành viên nhóm</h2>
            <button
              onClick={() => {
                loadAvailableAdmins();
                setShowAssignModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Gán admin</span>
            </button>
          </div>
          {group.admins && group.admins.length > 0 ? (
            <div className="space-y-3">
              {group.admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{admin.name || admin.email}</p>
                      <p className="text-xs text-gray-600">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {admin.isActive && admin.status === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3" />
                        Không hoạt động
                      </span>
                    )}
                    <button
                      onClick={() => setShowRemoveModal(admin)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Gỡ khỏi nhóm"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có admin nào trong nhóm</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistics' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số admin</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.adminCount || 0}</p>
                <p className="text-xs text-gray-500">
                  {statistics.activeAdminCount || 0} hoạt động / {statistics.inactiveAdminCount || 0} không hoạt động
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số CTV</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.collaboratorCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số đơn ứng tuyển</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.jobApplicationCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số CV</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.cvCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gán admin vào nhóm</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn admin</label>
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chọn admin --</option>
                {availableAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAdminId('');
                }}
                disabled={assigning}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignAdmin}
                disabled={assigning || !selectedAdminId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gán...</span>
                  </>
                ) : (
                  'Gán'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Admin Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận gỡ admin</h3>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Bạn có chắc chắn muốn gỡ <strong>{showRemoveModal.name || showRemoveModal.email}</strong> khỏi nhóm này?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRemoveModal(null)}
                disabled={removing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleRemoveAdmin(showRemoveModal.id)}
                disabled={removing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {removing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gỡ...</span>
                  </>
                ) : (
                  'Gỡ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;

