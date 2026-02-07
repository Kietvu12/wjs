import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Users,
  User,
  UserCheck,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  Handshake,
  X,
  Check,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

const CollaboratorAssignmentsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  const [admins, setAdmins] = useState([]);
  const [unassignedCollaborators, setUnassignedCollaborators] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [selectedAdminName, setSelectedAdminName] = useState('');
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState('');
  const [selectedCollaboratorName, setSelectedCollaboratorName] = useState('');
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState(new Set());
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showCollaboratorDropdown, setShowCollaboratorDropdown] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    loadAssignments();
    loadAdmins();
    loadUnassignedCollaborators();
  }, [currentPage, itemsPerPage, adminFilter, statusFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.admin-dropdown-container') && !event.target.closest('.collaborator-dropdown-container')) {
        setShowAdminDropdown(false);
        setShowCollaboratorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (adminFilter) {
        params.adminId = adminFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiService.getCollaboratorAssignments(params);
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
      console.error('Error loading assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await apiService.getAdmins({ role: 2, status: 1 }); // Only AdminBackOffice
      if (response.success && response.data) {
        setAdmins(response.data.admins || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadUnassignedCollaborators = async () => {
    try {
      // Load tất cả CTV chưa được phân công (không limit)
      let allCollaborators = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await apiService.getUnassignedCollaborators({ 
          page,
          limit: 100 // Load 100 mỗi lần để lấy hết
        });
        if (response.success && response.data) {
          const collaborators = response.data.collaborators || [];
          allCollaborators = [...allCollaborators, ...collaborators];
          
          const pagination = response.data.pagination || {};
          if (pagination.totalPages && page >= pagination.totalPages) {
            hasMore = false;
          } else if (collaborators.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      setUnassignedCollaborators(allCollaborators);
    } catch (error) {
      console.error('Error loading unassigned collaborators:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAssignments();
  };

  const handleAssign = async () => {
    if (!selectedAdminId || !selectedCollaboratorId) {
      alert('Vui lòng chọn AdminBackOffice và CTV');
      return;
    }

    try {
      setAssigning(true);
      const response = await apiService.createCollaboratorAssignment({
        collaboratorId: parseInt(selectedCollaboratorId),
        adminId: parseInt(selectedAdminId),
        notes: assignNotes
      });
      if (response.success) {
        alert('Phân công CTV thành công!');
        // Reset form
        setSelectedAdminId('');
        setSelectedAdminName('');
        setSelectedCollaboratorId('');
        setSelectedCollaboratorName('');
        setAdminSearch('');
        setCollaboratorSearch('');
        setAssignNotes('');
        loadAssignments();
        loadUnassignedCollaborators();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi phân công');
      }
    } catch (error) {
      console.error('Error assigning:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi phân công';
      alert(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedAdminId || !selectedCollaboratorIds || selectedCollaboratorIds.size === 0) {
      alert('Vui lòng chọn AdminBackOffice và ít nhất 1 CTV');
      return;
    }

    try {
      setAssigning(true);
      const response = await apiService.bulkAssignCollaborators({
        collaboratorIds: Array.from(selectedCollaboratorIds).map(id => parseInt(id)),
        adminId: parseInt(selectedAdminId),
        notes: assignNotes
      });
      if (response.success) {
        alert(`Phân công thành công ${response.data.assignments?.length || selectedCollaboratorIds.size} CTV!`);
        // Reset form
        setSelectedAdminId('');
        setSelectedAdminName('');
        setSelectedCollaboratorIds(new Set());
        setAdminSearch('');
        setCollaboratorSearch('');
        setAssignNotes('');
        loadAssignments();
        loadUnassignedCollaborators();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi phân công');
      }
    } catch (error) {
      console.error('Error bulk assigning:', error);
      alert(error.message || 'Có lỗi xảy ra khi phân công');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm('Bạn có chắc muốn hủy phân công này?')) {
      return;
    }

    try {
      const response = await apiService.deleteCollaboratorAssignment(assignmentId);
      if (response.success) {
        alert('Hủy phân công thành công!');
        loadAssignments();
        loadUnassignedCollaborators();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi hủy phân công');
      }
    } catch (error) {
      console.error('Error unassigning:', error);
      alert(error.message || 'Có lỗi xảy ra khi hủy phân công');
    }
  };

  const handleTransfer = async (assignmentId, newAdminId) => {
    try {
      const response = await apiService.updateCollaboratorAssignment(assignmentId, {
        adminId: parseInt(newAdminId),
        notes: 'Chuyển từ AdminBackOffice khác'
      });
      if (response.success) {
        alert('Chuyển phân công thành công!');
        loadAssignments();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi chuyển phân công');
      }
    } catch (error) {
      console.error('Error transferring:', error);
      alert(error.message || 'Có lỗi xảy ra khi chuyển phân công');
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const searchLower = adminSearch.toLowerCase();
    return (
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      admin.id.toString().includes(adminSearch)
    );
  });

  const filteredUnassignedCollaborators = unassignedCollaborators.filter(collaborator => {
    const searchLower = collaboratorSearch.toLowerCase();
    return (
      (collaborator.name || '').toLowerCase().includes(searchLower) ||
      (collaborator.email || '').toLowerCase().includes(searchLower) ||
      (collaborator.code || collaborator.id || '').toString().includes(collaboratorSearch)
    );
  });

  const handleAdminSelect = (admin) => {
    setSelectedAdminId(admin.id);
    setSelectedAdminName(admin.name);
    setAdminSearch(admin.name);
    setShowAdminDropdown(false);
  };

  const handleCollaboratorSelect = (collaborator) => {
    setSelectedCollaboratorId(collaborator.id);
    setSelectedCollaboratorName(collaborator.name);
    setCollaboratorSearch(collaborator.name);
    setShowCollaboratorDropdown(false);
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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Handshake className="w-6 h-6 text-blue-600" />
            Phân công CTV cho AdminBackOffice
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý phân công CTV cho các AdminBackOffice</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              bulkMode
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {bulkMode ? 'Đóng phân công hàng loạt' : 'Phân công hàng loạt'}
          </button>
        </div>
      </div>

      {/* Quick Assign Form */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-600" />
          Phân công CTV nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chọn AdminBackOffice <span className="text-red-500">*</span>
            </label>
            <div className="relative admin-dropdown-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm AdminBackOffice..."
                value={adminSearch}
                onChange={(e) => {
                  setAdminSearch(e.target.value);
                  setShowAdminDropdown(true);
                }}
                onFocus={() => setShowAdminDropdown(true)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {selectedAdminId && (
                <button
                  onClick={() => {
                    setSelectedAdminId('');
                    setSelectedAdminName('');
                    setAdminSearch('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showAdminDropdown && filteredAdmins.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredAdmins.map((admin) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => handleAdminSelect(admin)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{admin.name}</div>
                        <div className="text-xs text-gray-500">{admin.email}</div>
                      </div>
                      {selectedAdminId === admin.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-5 mt-1">
              {selectedAdminId && (
                <div className="text-xs text-blue-600">
                  Đã chọn: {selectedAdminName}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chọn CTV <span className="text-red-500">*</span>
            </label>
            <div className="relative collaborator-dropdown-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm CTV chưa được phân công..."
                value={collaboratorSearch}
                onChange={(e) => {
                  setCollaboratorSearch(e.target.value);
                  setShowCollaboratorDropdown(true);
                }}
                onFocus={() => setShowCollaboratorDropdown(true)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {selectedCollaboratorId && (
                <button
                  onClick={() => {
                    setSelectedCollaboratorId('');
                    setSelectedCollaboratorName('');
                    setCollaboratorSearch('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showCollaboratorDropdown && filteredUnassignedCollaborators.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredUnassignedCollaborators.map((collaborator) => (
                    <button
                      key={collaborator.id}
                      type="button"
                      onClick={() => handleCollaboratorSelect(collaborator)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{collaborator.name}</div>
                        <div className="text-xs text-gray-500">
                          {collaborator.code || collaborator.id} • {collaborator.email}
                        </div>
                      </div>
                      {selectedCollaboratorId === collaborator.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-5 mt-1">
              {selectedCollaboratorId && (
                <div className="text-xs text-blue-600">
                  Đã chọn: {selectedCollaboratorName}
                </div>
              )}
              {filteredUnassignedCollaborators.length === 0 && collaboratorSearch && (
                <div className="text-xs text-gray-500">
                  Không tìm thấy CTV nào
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleAssign}
              disabled={assigning || !selectedAdminId || !selectedCollaboratorId}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {assigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang phân công...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Phân công
                </>
              )}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
          <textarea
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
            rows="2"
            placeholder="Ghi chú về phân công này..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên CTV, email, mã CTV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">AdminBackOffice</label>
            <select
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Đã hủy</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Chưa có phân công nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">AdminBackOffice</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Người phân công</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ngày phân công</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ghi chú</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.collaborator?.name || '—'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {assignment.collaborator?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {assignment.admin?.name || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.admin?.email || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {assignment.assignedByAdmin?.name || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(assignment.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {formatDate(assignment.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {assignment.notes || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status === 1 ? 'Đang hoạt động' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnassign(assignment.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hủy phân công"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Bulk Assign Section */}
      {bulkMode && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Phân công hàng loạt ({selectedCollaboratorIds.size} CTV đã chọn)
            </h2>
            <button
              onClick={() => {
                setBulkMode(false);
                setSelectedCollaboratorIds(new Set());
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Chọn AdminBackOffice <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm AdminBackOffice..."
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setShowAdminDropdown(true);
                  }}
                  onFocus={() => setShowAdminDropdown(true)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {selectedAdminId && (
                  <button
                    onClick={() => {
                      setSelectedAdminId('');
                      setSelectedAdminName('');
                      setAdminSearch('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showAdminDropdown && filteredAdmins.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => handleAdminSelect(admin)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-xs text-gray-500">{admin.email}</div>
                        </div>
                        {selectedAdminId === admin.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú</label>
              <textarea
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows="2"
                placeholder="Ghi chú..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBulkAssign}
                disabled={assigning || !selectedAdminId || selectedCollaboratorIds.size === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? 'Đang phân công...' : `Phân công ${selectedCollaboratorIds.size} CTV`}
              </button>
            </div>
          </div>
          <div className="mt-4 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                Danh sách CTV chưa được phân công ({unassignedCollaborators.length})
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (selectedCollaboratorIds.size === unassignedCollaborators.length) {
                      setSelectedCollaboratorIds(new Set());
                    } else {
                      setSelectedCollaboratorIds(new Set(unassignedCollaborators.map(c => c.id)));
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {selectedCollaboratorIds.size === unassignedCollaborators.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {unassignedCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${
                    selectedCollaboratorIds.has(collaborator.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    const newSet = new Set(selectedCollaboratorIds);
                    if (newSet.has(collaborator.id)) {
                      newSet.delete(collaborator.id);
                    } else {
                      newSet.add(collaborator.id);
                    }
                    setSelectedCollaboratorIds(newSet);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCollaboratorIds.has(collaborator.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{collaborator.name}</div>
                    <div className="text-xs text-gray-500">{collaborator.email}</div>
                  </div>
                  {selectedCollaboratorIds.has(collaborator.id) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorAssignmentsPage;

