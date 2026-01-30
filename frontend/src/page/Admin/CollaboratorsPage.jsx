import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  User,
  DollarSign,
  Briefcase,
} from 'lucide-react';


const CollaboratorsPage = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('OR'); // OR or AND
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [joinDateFrom, setJoinDateFrom] = useState('');
  const [joinDateTo, setJoinDateTo] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  useEffect(() => {
    loadCollaborators();
  }, [currentPage, itemsPerPage, selectedStatus, onlyActive, showInactiveOnly]);

  const loadCollaborators = async () => {
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

      if (onlyActive) {
        params.status = 1;
      } else if (showInactiveOnly) {
        params.status = 0;
      } else if (selectedStatus) {
        params.status = selectedStatus === 'active' ? 1 : 0;
      }

      const response = await apiService.getCollaborators(params);
      if (response.success && response.data) {
        setCollaborators(response.data.collaborators || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for collaborators (fallback)
  const sampleCollaborators = [
    { 
      id: 'CTV001', 
      name: 'Nguyen Van A', 
      email: 'nguyenvana@example.com', 
      phone: '0901234567', 
      candidatesCount: 15, 
      jobsCount: 8, 
      totalEarned: 12500000, 
      status: 'active', 
      joinDate: '2024/01/15' 
    },
    { 
      id: 'CTV002', 
      name: 'Tran Thi B', 
      email: 'tranthib@example.com', 
      phone: '0902345678', 
      candidatesCount: 23, 
      jobsCount: 12, 
      totalEarned: 18500000, 
      status: 'active', 
      joinDate: '2024/02/20' 
    },
    { 
      id: 'CTV003', 
      name: 'Le Van C', 
      email: 'levanc@example.com', 
      phone: '0903456789', 
      candidatesCount: 8, 
      jobsCount: 5, 
      totalEarned: 7500000, 
      status: 'active', 
      joinDate: '2024/03/10' 
    },
    { 
      id: 'CTV004', 
      name: 'Pham Thi D', 
      email: 'phamthid@example.com', 
      phone: '0904567890', 
      candidatesCount: 31, 
      jobsCount: 18, 
      totalEarned: 24500000, 
      status: 'active', 
      joinDate: '2024/01/05' 
    },
    { 
      id: 'CTV005', 
      name: 'Hoang Van E', 
      email: 'hoangvane@example.com', 
      phone: '0905678901', 
      candidatesCount: 5, 
      jobsCount: 3, 
      totalEarned: 4200000, 
      status: 'inactive', 
      joinDate: '2024/04/15' 
    },
    { 
      id: 'CTV006', 
      name: 'Vu Thi F', 
      email: 'vuthif@example.com', 
      phone: '0906789012', 
      candidatesCount: 19, 
      jobsCount: 11, 
      totalEarned: 15200000, 
      status: 'active', 
      joinDate: '2024/02/28' 
    },
    { 
      id: 'CTV007', 
      name: 'Do Van G', 
      email: 'dovang@example.com', 
      phone: '0907890123', 
      candidatesCount: 12, 
      jobsCount: 7, 
      totalEarned: 9800000, 
      status: 'active', 
      joinDate: '2024/03/22' 
    },
    { 
      id: 'CTV008', 
      name: 'Bui Thi H', 
      email: 'buithih@example.com', 
      phone: '0908901234', 
      candidatesCount: 27, 
      jobsCount: 15, 
      totalEarned: 21000000, 
      status: 'active', 
      joinDate: '2024/01/18' 
    },
    { 
      id: 'CTV009', 
      name: 'Dang Van I', 
      email: 'dangvani@example.com', 
      phone: '0909012345', 
      candidatesCount: 4, 
      jobsCount: 2, 
      totalEarned: 3200000, 
      status: 'inactive', 
      joinDate: '2024/05/10' 
    },
    { 
      id: 'CTV010', 
      name: 'Ngo Thi K', 
      email: 'ngothik@example.com', 
      phone: '0900123456', 
      candidatesCount: 35, 
      jobsCount: 20, 
      totalEarned: 28500000, 
      status: 'active', 
      joinDate: '2023/12/01' 
    },
    { 
      id: 'CTV011', 
      name: 'Ly Van L', 
      email: 'lyvanl@example.com', 
      phone: '0901234567', 
      candidatesCount: 18, 
      jobsCount: 10, 
      totalEarned: 14500000, 
      status: 'active', 
      joinDate: '2024/02/14' 
    },
    { 
      id: 'CTV012', 
      name: 'Truong Thi M', 
      email: 'truongthim@example.com', 
      phone: '0902345678', 
      candidatesCount: 22, 
      jobsCount: 13, 
      totalEarned: 17500000, 
      status: 'active', 
      joinDate: '2024/01/25' 
    },
    { 
      id: 'CTV013', 
      name: 'Vo Van N', 
      email: 'vovann@example.com', 
      phone: '0903456789', 
      candidatesCount: 9, 
      jobsCount: 6, 
      totalEarned: 7200000, 
      status: 'active', 
      joinDate: '2024/03/30' 
    },
    { 
      id: 'CTV014', 
      name: 'Dao Thi O', 
      email: 'daothio@example.com', 
      phone: '0904567890', 
      candidatesCount: 29, 
      jobsCount: 16, 
      totalEarned: 23000000, 
      status: 'active', 
      joinDate: '2024/01/08' 
    },
    { 
      id: 'CTV015', 
      name: 'Duong Van P', 
      email: 'duongvanp@example.com', 
      phone: '0905678901', 
      candidatesCount: 6, 
      jobsCount: 4, 
      totalEarned: 4800000, 
      status: 'inactive', 
      joinDate: '2024/04/20' 
    },
    { 
      id: 'CTV016', 
      name: 'Lam Thi Q', 
      email: 'lamthiq@example.com', 
      phone: '0906789012', 
      candidatesCount: 41, 
      jobsCount: 24, 
      totalEarned: 32500000, 
      status: 'active', 
      joinDate: '2023/11/15' 
    },
    { 
      id: 'CTV017', 
      name: 'Phan Van R', 
      email: 'phanvanr@example.com', 
      phone: '0907890123', 
      candidatesCount: 14, 
      jobsCount: 9, 
      totalEarned: 11200000, 
      status: 'active', 
      joinDate: '2024/02/05' 
    },
    { 
      id: 'CTV018', 
      name: 'Ho Thi S', 
      email: 'hothis@example.com', 
      phone: '0908901234', 
      candidatesCount: 33, 
      jobsCount: 19, 
      totalEarned: 26500000, 
      status: 'active', 
      joinDate: '2023/12/20' 
    },
    { 
      id: 'CTV019', 
      name: 'Mac Van T', 
      email: 'macvant@example.com', 
      phone: '0909012345', 
      candidatesCount: 11, 
      jobsCount: 7, 
      totalEarned: 8900000, 
      status: 'active', 
      joinDate: '2024/03/15' 
    },
    { 
      id: 'CTV020', 
      name: 'Kieu Thi U', 
      email: 'kieuthiu@example.com', 
      phone: '0900123456', 
      candidatesCount: 26, 
      jobsCount: 14, 
      totalEarned: 20500000, 
      status: 'active', 
      joinDate: '2024/01/30' 
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(collaborators.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setJoinDateFrom('');
    setJoinDateTo('');
    setOnlyActive(false);
    setShowInactiveOnly(false);
    setSearchMode('OR');
    setCurrentPage(1);
    loadCollaborators();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCollaborators();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleEdit = (collaboratorId) => {
    navigate(`/admin/collaborators/${collaboratorId}/edit`);
  };

  const handleDelete = async (collaboratorId) => {
    if (window.confirm('Bạn có chắc muốn xóa CTV này?')) {
      try {
        const response = await apiService.deleteCollaborator(collaboratorId);
        if (response.success) {
          alert('Xóa CTV thành công!');
          loadCollaborators();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi xóa CTV');
        }
      } catch (error) {
        console.error('Error deleting collaborator:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa CTV');
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex gap-1">
            <button
              onClick={() => setSearchMode('OR')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                searchMode === 'OR'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              OR
            </button>
            <button
              onClick={() => setSearchMode('AND')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                searchMode === 'AND'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AND
            </button>
          </div>
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="ID, tên CTV, email, số điện thoại"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200 transition-colors">
            Tìm kiếm nâng cao
          </button>
          <button className="text-gray-600 hover:text-gray-800 p-1.5">
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/admin/collaborators/new')}
            className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded text-xs font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm CTV
          </button>
          <button className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900 transition-colors flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Cài đặt
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Ngày tham gia từ</label>
            <input
              type="date"
              value={joinDateFrom}
              onChange={(e) => setJoinDateFrom(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Đến</label>
            <input
              type="date"
              value={joinDateTo}
              onChange={(e) => setJoinDateTo(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
            />
            <span className="text-xs text-gray-700 font-semibold">Chỉ hiển thị đang hoạt động</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactiveOnly}
              onChange={(e) => setShowInactiveOnly(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
            />
            <span className="text-xs text-gray-700 font-semibold">Chỉ hiển thị ngừng hoạt động</span>
          </label>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[...Array(Math.min(7, totalPages))].map((_, i) => {
            let pageNum;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else if (currentPage <= 4) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 3) {
              pageNum = totalPages - 6 + i;
            } else {
              pageNum = currentPage - 3 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-xs text-gray-700 font-semibold">{totalItems} items</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-gray-200 min-h-0 relative">
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-900 border-b border-gray-200 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === collaborators.length && collaborators.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">ID CTV</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Tên CTV</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Email</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Số điện thoại</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Số ứng viên</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Số job</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Tổng tiền đã nhận</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Trạng thái</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Ngày tham gia</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-900 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-3 py-8 text-center text-xs text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : collaborators.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-3 py-8 text-center text-xs text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                collaborators.map((collaborator, index) => {
                  const statusLabel = collaborator.status === 1 ? 'active' : 'inactive';
                  const joinDate = collaborator.createdAt 
                    ? new Date(collaborator.createdAt).toLocaleDateString('vi-VN')
                    : collaborator.approvedAt 
                    ? new Date(collaborator.approvedAt).toLocaleDateString('vi-VN')
                    : '-';
                  
                  return (
                    <tr
                      key={collaborator.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => navigate(`/admin/collaborators/${collaborator.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-[11px] flex items-center gap-1"
                        >
                          {collaborator.code || collaborator.id}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-900 font-medium">{collaborator.name}</td>
                      <td className="px-3 py-2">
                        <div className="text-[11px] text-gray-700 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{collaborator.email || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-[11px] text-gray-700 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{collaborator.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5 text-gray-400" />
                          <span className="text-[11px] text-gray-900 font-medium">{collaborator.applicationsCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5 text-gray-400" />
                          <span className="text-[11px] text-gray-900 font-medium">{collaborator.jobsCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-2.5 h-2.5 text-green-600" />
                          <span className="text-[11px] text-gray-900 font-medium">{formatCurrency(collaborator.totalPaid || 0)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <select 
                          value={statusLabel}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                            statusLabel === 'active'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="inactive">Ngừng hoạt động</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-700">{joinDate}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(collaborator.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(collaborator.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsPage;
