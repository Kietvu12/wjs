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
  
  // Hover states
  const [hoveredBulkModeButton, setHoveredBulkModeButton] = useState(false);
  const [hoveredAssignButton, setHoveredAssignButton] = useState(false);
  const [hoveredClearAdminButton, setHoveredClearAdminButton] = useState(false);
  const [hoveredClearCollaboratorButton, setHoveredClearCollaboratorButton] = useState(false);
  const [hoveredAdminDropdownItemIndex, setHoveredAdminDropdownItemIndex] = useState(null);
  const [hoveredCollaboratorDropdownItemIndex, setHoveredCollaboratorDropdownItemIndex] = useState(null);
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredUnassignButtonIndex, setHoveredUnassignButtonIndex] = useState(null);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredCloseBulkModeButton, setHoveredCloseBulkModeButton] = useState(false);
  const [hoveredSelectAllButton, setHoveredSelectAllButton] = useState(false);
  const [hoveredBulkAssignButton, setHoveredBulkAssignButton] = useState(false);
  const [hoveredCollaboratorItemIndex, setHoveredCollaboratorItemIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

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
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }}>
            <Handshake className="w-6 h-6" style={{ color: '#2563eb' }} />
            Phân công CTV cho AdminBackOffice
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Quản lý phân công CTV cho các AdminBackOffice</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            onMouseEnter={() => setHoveredBulkModeButton(true)}
            onMouseLeave={() => setHoveredBulkModeButton(false)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: bulkMode
                ? (hoveredBulkModeButton ? '#d1d5db' : '#e5e7eb')
                : (hoveredBulkModeButton ? '#1d4ed8' : '#2563eb'),
              color: bulkMode ? '#374151' : 'white'
            }}
          >
            <UserPlus className="w-4 h-4" />
            {bulkMode ? 'Đóng phân công hàng loạt' : 'Phân công hàng loạt'}
          </button>
        </div>
      </div>

      {/* Quick Assign Form */}
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#111827' }}>
          <Plus className="w-4 h-4" style={{ color: '#16a34a' }} />
          Phân công CTV nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
              Chọn AdminBackOffice <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative admin-dropdown-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm kiếm AdminBackOffice..."
                value={adminSearch}
                onChange={(e) => {
                  setAdminSearch(e.target.value);
                  setShowAdminDropdown(true);
                }}
                onFocus={(e) => {
                  setShowAdminDropdown(true);
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
              />
              {selectedAdminId && (
                <button
                  onClick={() => {
                    setSelectedAdminId('');
                    setSelectedAdminName('');
                    setAdminSearch('');
                  }}
                  onMouseEnter={() => setHoveredClearAdminButton(true)}
                  onMouseLeave={() => setHoveredClearAdminButton(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{
                    color: hoveredClearAdminButton ? '#4b5563' : '#9ca3af'
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showAdminDropdown && filteredAdmins.length > 0 && (
                <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'white', borderColor: '#d1d5db' }}>
                  {filteredAdmins.map((admin, index) => (
                    <button
                      key={admin.id}
                      type="button"
                      onClick={() => handleAdminSelect(admin)}
                      onMouseEnter={() => setHoveredAdminDropdownItemIndex(index)}
                      onMouseLeave={() => setHoveredAdminDropdownItemIndex(null)}
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between"
                      style={{
                        backgroundColor: hoveredAdminDropdownItemIndex === index ? '#f3f4f6' : 'transparent'
                      }}
                    >
                      <div>
                        <div className="font-medium" style={{ color: '#111827' }}>{admin.name}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>{admin.email}</div>
                      </div>
                      {selectedAdminId === admin.id && (
                        <Check className="w-4 h-4" style={{ color: '#2563eb' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-5 mt-1">
              {selectedAdminId && (
                <div className="text-xs" style={{ color: '#2563eb' }}>
                  Đã chọn: {selectedAdminName}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
              Chọn CTV <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="relative collaborator-dropdown-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm kiếm CTV chưa được phân công..."
                value={collaboratorSearch}
                onChange={(e) => {
                  setCollaboratorSearch(e.target.value);
                  setShowCollaboratorDropdown(true);
                }}
                onFocus={(e) => {
                  setShowCollaboratorDropdown(true);
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
              />
              {selectedCollaboratorId && (
                <button
                  onClick={() => {
                    setSelectedCollaboratorId('');
                    setSelectedCollaboratorName('');
                    setCollaboratorSearch('');
                  }}
                  onMouseEnter={() => setHoveredClearCollaboratorButton(true)}
                  onMouseLeave={() => setHoveredClearCollaboratorButton(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{
                    color: hoveredClearCollaboratorButton ? '#4b5563' : '#9ca3af'
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showCollaboratorDropdown && filteredUnassignedCollaborators.length > 0 && (
                <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'white', borderColor: '#d1d5db' }}>
                  {filteredUnassignedCollaborators.map((collaborator, index) => (
                    <button
                      key={collaborator.id}
                      type="button"
                      onClick={() => handleCollaboratorSelect(collaborator)}
                      onMouseEnter={() => setHoveredCollaboratorDropdownItemIndex(index)}
                      onMouseLeave={() => setHoveredCollaboratorDropdownItemIndex(null)}
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between"
                      style={{
                        backgroundColor: hoveredCollaboratorDropdownItemIndex === index ? '#f3f4f6' : 'transparent'
                      }}
                    >
                      <div>
                        <div className="font-medium" style={{ color: '#111827' }}>{collaborator.name}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {collaborator.code || collaborator.id} • {collaborator.email}
                        </div>
                      </div>
                      {selectedCollaboratorId === collaborator.id && (
                        <Check className="w-4 h-4" style={{ color: '#2563eb' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="h-5 mt-1">
              {selectedCollaboratorId && (
                <div className="text-xs" style={{ color: '#2563eb' }}>
                  Đã chọn: {selectedCollaboratorName}
                </div>
              )}
              {filteredUnassignedCollaborators.length === 0 && collaboratorSearch && (
                <div className="text-xs" style={{ color: '#6b7280' }}>
                  Không tìm thấy CTV nào
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleAssign}
              disabled={assigning || !selectedAdminId || !selectedCollaboratorId}
              onMouseEnter={() => !(assigning || !selectedAdminId || !selectedCollaboratorId) && setHoveredAssignButton(true)}
              onMouseLeave={() => setHoveredAssignButton(false)}
              className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: (assigning || !selectedAdminId || !selectedCollaboratorId)
                  ? '#86efac'
                  : (hoveredAssignButton ? '#15803d' : '#16a34a'),
                color: 'white',
                opacity: (assigning || !selectedAdminId || !selectedCollaboratorId) ? 0.5 : 1,
                cursor: (assigning || !selectedAdminId || !selectedCollaboratorId) ? 'not-allowed' : 'pointer'
              }}
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
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Ghi chú (tùy chọn)</label>
          <textarea
            value={assignNotes}
            onChange={(e) => setAssignNotes(e.target.value)}
            rows="2"
            placeholder="Ghi chú về phân công này..."
            className="w-full px-3 py-2 border rounded-lg text-sm"
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

      {/* Filters */}
      <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tên CTV, email, mã CTV..."
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
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>AdminBackOffice</label>
            <select
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
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
            >
              <option value="">Tất cả</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
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
            >
              <option value="">Tất cả</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Đã hủy</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              onMouseEnter={() => setHoveredSearchButton(true)}
              onMouseLeave={() => setHoveredSearchButton(false)}
              className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
                color: 'white'
              }}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#2563eb' }}></div>
            <p className="mt-2 text-sm" style={{ color: '#6b7280' }}>Đang tải...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
            <p className="text-sm" style={{ color: '#6b7280' }}>Chưa có phân công nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>CTV</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>AdminBackOffice</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Người phân công</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Ngày phân công</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Ghi chú</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#374151' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
                  {assignments.map((assignment, index) => (
                    <tr
                      key={assignment.id}
                      className="transition-colors"
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      style={{
                        backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" style={{ color: '#9ca3af' }} />
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#111827' }}>
                              {assignment.collaborator?.name || '—'}
                            </div>
                            <div className="text-xs" style={{ color: '#6b7280' }}>
                              {assignment.collaborator?.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: '#111827' }}>
                          {assignment.admin?.name || '—'}
                        </div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {assignment.admin?.email || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: '#111827' }}>
                          {assignment.assignedByAdmin?.name || '—'}
                        </div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {formatDate(assignment.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: '#111827' }}>
                          {formatDate(assignment.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm max-w-xs truncate" style={{ color: '#4b5563' }}>
                          {assignment.notes || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: assignment.status === 1 ? '#dcfce7' : '#f3f4f6',
                          color: assignment.status === 1 ? '#166534' : '#1f2937'
                        }}>
                          {assignment.status === 1 ? 'Đang hoạt động' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnassign(assignment.id)}
                            onMouseEnter={() => setHoveredUnassignButtonIndex(index)}
                            onMouseLeave={() => setHoveredUnassignButtonIndex(null)}
                            className="p-1.5 rounded transition-colors"
                            style={{
                              color: hoveredUnassignButtonIndex === index ? '#991b1b' : '#dc2626',
                              backgroundColor: hoveredUnassignButtonIndex === index ? '#fef2f2' : 'transparent'
                            }}
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
                    onMouseEnter={() => currentPage !== pagination.totalPages && setHoveredPaginationNavButton('next')}
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
                    onMouseEnter={() => currentPage !== pagination.totalPages && setHoveredPaginationNavButton('last')}
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

      {/* Bulk Assign Section */}
      {bulkMode && (
        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#111827' }}>
              <UserPlus className="w-4 h-4" style={{ color: '#2563eb' }} />
              Phân công hàng loạt ({selectedCollaboratorIds.size} CTV đã chọn)
            </h2>
            <button
              onClick={() => {
                setBulkMode(false);
                setSelectedCollaboratorIds(new Set());
              }}
              onMouseEnter={() => setHoveredCloseBulkModeButton(true)}
              onMouseLeave={() => setHoveredCloseBulkModeButton(false)}
              style={{
                color: hoveredCloseBulkModeButton ? '#4b5563' : '#9ca3af'
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>
                Chọn AdminBackOffice <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm AdminBackOffice..."
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setShowAdminDropdown(true);
                  }}
                  onFocus={(e) => {
                    setShowAdminDropdown(true);
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                />
                {selectedAdminId && (
                  <button
                    onClick={() => {
                      setSelectedAdminId('');
                      setSelectedAdminName('');
                      setAdminSearch('');
                    }}
                    onMouseEnter={() => setHoveredClearAdminButton(true)}
                    onMouseLeave={() => setHoveredClearAdminButton(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{
                      color: hoveredClearAdminButton ? '#4b5563' : '#9ca3af'
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {showAdminDropdown && filteredAdmins.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: 'white', borderColor: '#d1d5db' }}>
                    {filteredAdmins.map((admin, index) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => handleAdminSelect(admin)}
                        onMouseEnter={() => setHoveredAdminDropdownItemIndex(index)}
                        onMouseLeave={() => setHoveredAdminDropdownItemIndex(null)}
                        className="w-full px-3 py-2 text-left text-sm flex items-center justify-between"
                        style={{
                          backgroundColor: hoveredAdminDropdownItemIndex === index ? '#f3f4f6' : 'transparent'
                        }}
                      >
                        <div>
                          <div className="font-medium" style={{ color: '#111827' }}>{admin.name}</div>
                          <div className="text-xs" style={{ color: '#6b7280' }}>{admin.email}</div>
                        </div>
                        {selectedAdminId === admin.id && (
                          <Check className="w-4 h-4" style={{ color: '#2563eb' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Ghi chú</label>
              <textarea
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows="2"
                placeholder="Ghi chú..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
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
            <div className="flex items-end">
              <button
                onClick={handleBulkAssign}
                disabled={assigning || !selectedAdminId || selectedCollaboratorIds.size === 0}
                onMouseEnter={() => !(assigning || !selectedAdminId || selectedCollaboratorIds.size === 0) && setHoveredBulkAssignButton(true)}
                onMouseLeave={() => setHoveredBulkAssignButton(false)}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: (assigning || !selectedAdminId || selectedCollaboratorIds.size === 0)
                    ? '#93c5fd'
                    : (hoveredBulkAssignButton ? '#1d4ed8' : '#2563eb'),
                  color: 'white',
                  opacity: (assigning || !selectedAdminId || selectedCollaboratorIds.size === 0) ? 0.5 : 1,
                  cursor: (assigning || !selectedAdminId || selectedCollaboratorIds.size === 0) ? 'not-allowed' : 'pointer'
                }}
              >
                {assigning ? 'Đang phân công...' : `Phân công ${selectedCollaboratorIds.size} CTV`}
              </button>
            </div>
          </div>
          <div className="mt-4 border rounded-lg max-h-96 overflow-y-auto" style={{ borderColor: '#e5e7eb' }}>
            <div className="p-2 border-b flex items-center justify-between" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <span className="text-xs font-semibold" style={{ color: '#374151' }}>
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
                  onMouseEnter={() => setHoveredSelectAllButton(true)}
                  onMouseLeave={() => setHoveredSelectAllButton(false)}
                  className="text-xs"
                  style={{
                    color: hoveredSelectAllButton ? '#1e40af' : '#2563eb'
                  }}
                >
                  {selectedCollaboratorIds.size === unassignedCollaborators.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {unassignedCollaborators.map((collaborator, index) => (
                <div
                  key={collaborator.id}
                  className="p-3 flex items-center gap-3 cursor-pointer transition-colors"
                  onMouseEnter={() => setHoveredCollaboratorItemIndex(index)}
                  onMouseLeave={() => setHoveredCollaboratorItemIndex(null)}
                  onClick={() => {
                    const newSet = new Set(selectedCollaboratorIds);
                    if (newSet.has(collaborator.id)) {
                      newSet.delete(collaborator.id);
                    } else {
                      newSet.add(collaborator.id);
                    }
                    setSelectedCollaboratorIds(newSet);
                  }}
                  style={{
                    backgroundColor: selectedCollaboratorIds.has(collaborator.id)
                      ? '#eff6ff'
                      : (hoveredCollaboratorItemIndex === index ? '#f9fafb' : 'transparent')
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCollaboratorIds.has(collaborator.id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: '#111827' }}>{collaborator.name}</div>
                    <div className="text-xs" style={{ color: '#6b7280' }}>{collaborator.email}</div>
                  </div>
                  {selectedCollaboratorIds.has(collaborator.id) && (
                    <Check className="w-4 h-4" style={{ color: '#2563eb' }} />
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

