import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
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
  Loader2,
  UserCheck,
} from 'lucide-react';

const GroupCollaboratorsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    loadGroupInfo();
  }, []);

  useEffect(() => {
    if (groupInfo) {
      loadGroupCollaborators();
      loadStatistics();
    }
  }, [currentPage, itemsPerPage, groupInfo]);

  const loadGroupInfo = async () => {
    try {
      const response = await apiService.getMyGroup();
      if (response.success && response.data?.group) {
        setGroupInfo(response.data.group);
      }
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  const loadGroupCollaborators = async () => {
    try {
      setLoading(true);
      
      // Get all admins in group
      const adminIds = groupInfo?.admins?.map(a => a.id) || [];
      
      if (adminIds.length === 0) {
        setCollaborators([]);
        setPagination({
          total: 0,
          page: 1,
          limit: itemsPerPage,
          totalPages: 0
        });
        return;
      }

      // Get all collaborators assigned to admins in this group
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: 1, // Only active assignments
        adminId: adminIds.join(',')
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiService.getCollaboratorAssignments(params);
      if (response.success && response.data) {
        // Extract unique collaborators from assignments
        const uniqueCollaborators = [];
        const collaboratorMap = new Map();
        
        response.data.assignments?.forEach(assignment => {
          if (assignment.collaborator && !collaboratorMap.has(assignment.collaboratorId)) {
            collaboratorMap.set(assignment.collaboratorId, assignment.collaborator);
            uniqueCollaborators.push({
              ...assignment.collaborator,
              assignedAdmin: assignment.admin
            });
          }
        });

        setCollaborators(uniqueCollaborators);
        setPagination(response.data.pagination || {
          total: uniqueCollaborators.length,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: Math.ceil(uniqueCollaborators.length / itemsPerPage)
        });
      }
    } catch (error) {
      console.error('Error loading group collaborators:', error);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiService.getMyGroupStatistics();
      if (response.success && response.data) {
        setStatistics(response.data.groupStatistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadGroupCollaborators();
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
          <h1 className="text-2xl font-bold text-gray-900">CTV của nhóm</h1>
          <p className="text-sm text-gray-600 mt-1">
            {groupInfo && `Nhóm: ${groupInfo.name} (${groupInfo.code})`}
          </p>
        </div>
      </div>

      {/* Group Info */}
      {groupInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">{groupInfo.name}</h2>
              <p className="text-sm text-blue-700">
                Mã nhóm: {groupInfo.code} | Số admin: {groupInfo.admins?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số CTV</p>
                <p className="text-xl font-bold text-gray-900">{statistics.collaboratorCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số đơn ứng tuyển</p>
                <p className="text-xl font-bold text-gray-900">{statistics.jobApplicationCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số CV</p>
                <p className="text-xl font-bold text-gray-900">{statistics.cvCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, mã CTV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : collaborators.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có CTV nào trong nhóm</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Mã CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Admin phụ trách</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Địa chỉ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Ngày tham gia</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {collaborators.map((collaborator) => (
                    <tr key={collaborator.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{collaborator.name || collaborator.email}</p>
                            <p className="text-xs text-gray-600">{collaborator.email}</p>
                            {collaborator.phone && (
                              <p className="text-xs text-gray-500">{collaborator.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{collaborator.code || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {collaborator.assignedAdmin ? (
                          <span className="text-sm text-gray-700">
                            {collaborator.assignedAdmin.name || collaborator.assignedAdmin.email}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{collaborator.address || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{formatDate(collaborator.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/collaborators/${collaborator.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} CTV
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

export default GroupCollaboratorsPage;

