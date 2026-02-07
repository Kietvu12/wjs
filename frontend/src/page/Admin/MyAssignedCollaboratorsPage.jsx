import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  UserCheck,
  Users,
  Mail,
  Phone,
  Briefcase,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  BarChart3,
} from 'lucide-react';

const MyAssignedCollaboratorsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadMyAssignedCollaborators();
    loadStatistics();
  }, [currentPage, itemsPerPage]);

  const loadMyAssignedCollaborators = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: 1 // Only active assignments
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiService.getMyAssignedCollaborators(params);
      if (response.success && response.data) {
        setAssignments(response.data.assignments || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading assigned collaborators:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const response = await apiService.getCollaboratorAssignmentStatistics();
      if (response.success && response.data) {
        setStatistics(response.data.statistics || []);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadMyAssignedCollaborators();
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

  const getCollaboratorStats = (collaboratorId) => {
    if (!statistics) return null;
    return statistics.find(stat => stat.collaboratorId === collaboratorId);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" />
          CTV được phân công cho tôi
        </h1>
        <p className="text-sm text-gray-500 mt-1">Danh sách CTV được Super Admin phân công cho bạn chăm sóc</p>
      </div>

      {/* Statistics Summary */}
      {statistics && statistics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{statistics.length}</div>
                <div className="text-xs text-gray-500">Tổng số CTV</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.reduce((sum, stat) => sum + stat.totalJobApplications, 0)}
                </div>
                <div className="text-xs text-gray-500">Tổng đơn ứng tuyển</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.reduce((sum, stat) => sum + stat.totalCVs, 0)}
                </div>
                <div className="text-xs text-gray-500">Tổng số CV</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.length > 0
                    ? (statistics.reduce((sum, stat) => sum + stat.successRate, 0) / statistics.length).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs text-gray-500">Tỷ lệ thành công TB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm CTV theo tên, email, mã CTV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Bạn chưa được phân công CTV nào</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng liên hệ Super Admin để được phân công CTV</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thống kê</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ngày phân công</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => {
                    const collaborator = assignment.collaborator;
                    const stats = getCollaboratorStats(collaborator?.id);
                    return (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {collaborator?.name || '—'}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <Mail className="w-3 h-3" />
                                {collaborator?.email || '—'}
                              </div>
                              {collaborator?.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {collaborator.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {stats ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{stats.totalJobApplications} đơn ứng tuyển</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{stats.totalCVs} CV</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 font-medium">{stats.successCount} thành công</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Tỷ lệ: {stats.successRate}%
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">Chưa có dữ liệu</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {formatDate(assignment.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/collaborators/${collaborator?.id}`)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Xem chi tiết CTV"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/nominations/create?collaboratorId=${collaborator?.id}`)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                              title="Tiến cử ứng viên cho CTV này"
                            >
                              <Plus className="w-3 h-3" />
                              Tiến cử
                            </button>
                            <button
                              onClick={() => navigate(`/admin/candidates/create?collaboratorId=${collaborator?.id}`)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                              title="Thêm ứng viên mới cho CTV này"
                            >
                              <Plus className="w-3 h-3" />
                              Thêm CV
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} của {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Trang {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                    className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MyAssignedCollaboratorsPage;

