import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Shield,
  Building2,
  AlertCircle,
} from 'lucide-react';

const AccountsPage = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState('admin'); // 'admin' or 'collaborator'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    if (accountType === 'admin') {
      loadAdmins();
    } else {
      loadCollaborators();
    }
  }, [accountType, currentPage, itemsPerPage, roleFilter, statusFilter]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiService.getAdmins(params);
      if (response.success && response.data) {
        setAccounts(response.data.admins || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter) {
        params.status = statusFilter === '1' ? 1 : statusFilter === '0' ? 0 : '';
      }

      const response = await apiService.getCollaborators(params);
      if (response.success && response.data) {
        setAccounts(response.data.collaborators || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    if (accountType === 'admin') {
      loadAdmins();
    } else {
      loadCollaborators();
    }
  };

  const handleDelete = async (accountId) => {
    try {
      setDeleting(true);
      if (accountType === 'admin') {
        await apiService.deleteAdmin(accountId);
      } else {
        await apiService.deleteCollaborator(accountId);
      }
      setDeleteConfirm(null);
      if (accountType === 'admin') {
        loadAdmins();
      } else {
        loadCollaborators();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.message || 'Không thể xóa tài khoản');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 1:
        return { label: 'Super Admin', color: 'bg-purple-100 text-purple-800', icon: Shield };
      case 2:
        return { label: 'Admin Backoffice', color: 'bg-blue-100 text-blue-800', icon: Users };
      case 3:
        return { label: 'Admin CA Team', color: 'bg-green-100 text-green-800', icon: Building2 };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: User };
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý tài khoản admin và CTV trong hệ thống</p>
        </div>
        <button
          onClick={() => {
            if (accountType === 'admin') {
              navigate('/admin/accounts/new');
            } else {
              navigate('/admin/collaborators/new');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>

      {/* Account Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setAccountType('admin')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              accountType === 'admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </button>
          <button
            onClick={() => setAccountType('collaborator')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              accountType === 'collaborator'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>Cộng tác viên (CTV)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {accountType === 'admin' && (
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              <option value="1">Super Admin</option>
              <option value="2">Admin Backoffice</option>
              <option value="3">Admin CA Team</option>
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có tài khoản nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Tài khoản</th>
                    {accountType === 'admin' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Vai trò</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Nhóm</th>
                      </>
                    )}
                    {accountType === 'collaborator' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Mã CTV</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Địa chỉ</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Ngày tạo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accounts.map((account) => {
                    if (accountType === 'admin') {
                      const roleInfo = getRoleLabel(account.role);
                      const RoleIcon = roleInfo.icon;
                      return (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{account.name || account.email}</p>
                                <p className="text-xs text-gray-600">{account.email}</p>
                                {account.phone && (
                                  <p className="text-xs text-gray-500">{account.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                              <RoleIcon className="w-3 h-3" />
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {account.group ? (
                              <span className="text-sm text-gray-700">{account.group.name}</span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {account.isActive && account.status === 1 ? (
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
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700">{formatDate(account.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/accounts/${account.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/accounts/${account.id}/edit`)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(account)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      // Collaborator
                      return (
                        <tr key={account.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{account.name || account.email}</p>
                                <p className="text-xs text-gray-600">{account.email}</p>
                                {account.phone && (
                                  <p className="text-xs text-gray-500">{account.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">{account.code || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700">{account.address || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            {account.status === 1 ? (
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
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700">{formatDate(account.createdAt)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/admin/collaborators/${account.id}`)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/collaborators/${account.id}/edit`)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(account)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} tài khoản
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;
