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
  Plus,
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
  
  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredNominateButtonIndex, setHoveredNominateButtonIndex] = useState(null);
  const [hoveredAddCVButtonIndex, setHoveredAddCVButtonIndex] = useState(null);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);

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
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
          <UserCheck className="w-6 h-6" style={{ color: '#2563eb' }} />
          CTV được phân công cho tôi
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Danh sách CTV được Super Admin phân công cho bạn chăm sóc</p>
      </div>

      {/* Statistics Summary */}
      {statistics && statistics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#dbeafe' }}>
                <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#111827' }}>{statistics.length}</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Tổng số CTV</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#dcfce7' }}>
                <FileText className="w-5 h-5" style={{ color: '#16a34a' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#111827' }}>
                  {statistics.reduce((sum, stat) => sum + stat.totalJobApplications, 0)}
                </div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Tổng đơn ứng tuyển</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#f3e8ff' }}>
                <Briefcase className="w-5 h-5" style={{ color: '#9333ea' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#111827' }}>
                  {statistics.reduce((sum, stat) => sum + stat.totalCVs, 0)}
                </div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Tổng số CV</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#fef9c3' }}>
                <BarChart3 className="w-5 h-5" style={{ color: '#ca8a04' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#111827' }}>
                  {statistics.length > 0
                    ? (statistics.reduce((sum, stat) => sum + stat.successRate, 0) / statistics.length).toFixed(1)
                    : 0}%
                </div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Tỷ lệ thành công TB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm kiếm CTV theo tên, email, mã CTV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            onMouseEnter={() => setHoveredSearchButton(true)}
            onMouseLeave={() => setHoveredSearchButton(false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Collaborators Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
            <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
            <p className="text-sm" style={{ color: '#6b7280' }}>Bạn chưa được phân công CTV nào</p>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Vui lòng liên hệ Super Admin để được phân công CTV</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Thống kê</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Ngày phân công</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {assignments.map((assignment, index) => {
                    const collaborator = assignment.collaborator;
                    const stats = getCollaboratorStats(collaborator?.id);
                    return (
                      <tr
                        key={assignment.id}
                        style={{
                          backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                        }}
                        onMouseEnter={() => setHoveredRowIndex(index)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: '#dbeafe' }}>
                              <Users className="w-5 h-5" style={{ color: '#2563eb' }} />
                            </div>
                            <div>
                              <div className="text-sm font-medium" style={{ color: '#111827' }}>
                                {collaborator?.name || '—'}
                              </div>
                              <div className="text-xs flex items-center gap-2 mt-1" style={{ color: '#6b7280' }}>
                                <Mail className="w-3 h-3" />
                                {collaborator?.email || '—'}
                              </div>
                              {collaborator?.phone && (
                                <div className="text-xs flex items-center gap-2 mt-1" style={{ color: '#6b7280' }}>
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
                                <FileText className="w-4 h-4" style={{ color: '#9ca3af' }} />
                                <span style={{ color: '#374151' }}>{stats.totalJobApplications} đơn ứng tuyển</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Briefcase className="w-4 h-4" style={{ color: '#9ca3af' }} />
                                <span style={{ color: '#374151' }}>{stats.totalCVs} CV</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="w-4 h-4" style={{ color: '#16a34a' }} />
                                <span className="font-medium" style={{ color: '#15803d' }}>{stats.successCount} thành công</span>
                              </div>
                              <div className="text-xs" style={{ color: '#6b7280' }}>
                                Tỷ lệ: {stats.successRate}%
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm" style={{ color: '#9ca3af' }}>Chưa có dữ liệu</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm" style={{ color: '#111827' }}>
                            {formatDate(assignment.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/collaborators/${collaborator?.id}`)}
                              onMouseEnter={() => setHoveredViewButtonIndex(index)}
                              onMouseLeave={() => setHoveredViewButtonIndex(null)}
                              className="p-1.5 rounded transition-colors"
                              style={{
                                color: '#2563eb',
                                backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                              }}
                              title="Xem chi tiết CTV"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/nominations/create?collaboratorId=${collaborator?.id}`)}
                              onMouseEnter={() => setHoveredNominateButtonIndex(index)}
                              onMouseLeave={() => setHoveredNominateButtonIndex(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              style={{
                                backgroundColor: hoveredNominateButtonIndex === index ? '#15803d' : '#16a34a',
                                color: 'white'
                              }}
                              title="Tiến cử ứng viên cho CTV này"
                            >
                              <Plus className="w-3 h-3" />
                              Tiến cử
                            </button>
                            <button
                              onClick={() => navigate(`/admin/candidates/create?collaboratorId=${collaborator?.id}`)}
                              onMouseEnter={() => setHoveredAddCVButtonIndex(index)}
                              onMouseLeave={() => setHoveredAddCVButtonIndex(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              style={{
                                backgroundColor: hoveredAddCVButtonIndex === index ? '#1d4ed8' : '#2563eb',
                                color: 'white'
                              }}
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
              <div className="px-4 py-3 border-t flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
                <div className="text-sm" style={{ color: '#374151' }}>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} của {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm" style={{ color: '#374151' }}>
                    Trang {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    onMouseEnter={() => currentPage < pagination.totalPages && setHoveredPaginationNavButton('next')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === pagination.totalPages ? 0.5 : 1,
                      cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    disabled={currentPage === pagination.totalPages}
                    onMouseEnter={() => currentPage < pagination.totalPages && setHoveredPaginationNavButton('last')}
                    onMouseLeave={() => setHoveredPaginationNavButton(null)}
                    className="p-1.5 border rounded transition-colors"
                    style={{
                      borderColor: '#d1d5db',
                      backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'transparent',
                      opacity: currentPage === pagination.totalPages ? 0.5 : 1,
                      cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer'
                    }}
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

