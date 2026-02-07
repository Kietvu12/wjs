import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Edit,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const CandidatesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [onlyMyCandidates, setOnlyMyCandidates] = useState(true); // Default to true for CTV
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Sort states
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  
  // Data states
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(''); // Filter by duplicate status

  // Load candidates data
  useEffect(() => {
    loadCandidates();
  }, [currentPage, itemsPerPage, nameFilter, statusFilter, createdDateFilter, isDuplicateFilter]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (nameFilter) {
        params.name = nameFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (createdDateFilter) {
        params.createdDate = createdDateFilter;
      }

      if (isDuplicateFilter !== '') {
        params.isDuplicate = isDuplicateFilter;
      }

      if (sortColumn) {
        params.sortBy = sortColumn;
        params.sortOrder = sortDirection;
      }

      const response = await apiService.getCVStorages(params);

      if (response.success && response.data) {
        let candidatesData = response.data.cvs || [];
        
        // Client-side sorting if API doesn't support it
        if (sortColumn && candidatesData.length > 0) {
          candidatesData = [...candidatesData].sort((a, b) => {
            let aVal, bVal;
            
            switch (sortColumn) {
              case 'name':
                aVal = (a.name || a.nameKanji || '').toLowerCase();
                bVal = (b.name || b.nameKanji || '').toLowerCase();
                break;
              case 'applicationsCount':
                aVal = a.applicationsCount || 0;
                bVal = b.applicationsCount || 0;
                break;
              case 'createdAt':
                aVal = new Date(a.createdAt || 0).getTime();
                bVal = new Date(b.createdAt || 0).getTime();
                break;
              default:
                return 0;
            }
            
            if (sortDirection === 'asc') {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
          });
        }
        
        setCandidates(candidatesData);
        setTotalItems(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.totalPages || 0);
      } else {
        console.error('Error loading candidates:', response.message);
        setCandidates([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(candidates.map((_, index) => index)));
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
    setNameFilter('');
    setStatusFilter('');
    setCreatedDateFilter('');
    setOnlyMyCandidates(true);
    setIsDuplicateFilter('');
    setSortColumn('');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ChevronUp className="w-3 h-3 text-gray-400 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-gray-700" />
      : <ChevronDown className="w-3 h-3 text-gray-700" />;
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

  const getStatusLabel = (status) => {
    const statusLabels = {
      1: 'Admin đang xử lý hồ sơ',
      2: 'Đang tiến cử',
      3: 'Đang xếp lịch phỏng vấn',
      4: 'Đang phỏng vấn',
      5: 'Đang đợi naitei',
      6: 'Đang thương lượng naitei',
      7: 'Đang đợi nyusha',
      8: 'Đã nyusha',
      9: 'Đang chờ thanh toán với công ty',
      10: 'Gửi yêu cầu thanh toán',
      11: 'Đã thanh toán',
      12: 'Hồ sơ không hợp lệ',
      15: 'Kết quả trượt',
      16: 'Hủy giữa chừng',
      17: 'Không shodaku'
    };
    return statusLabels[status] || `Status ${status}`;
  };

  const getScoutStatusLabel = (status) => {
    if (status >= 2 && status <= 4) return 'Đang xử lý';
    if (status >= 5 && status <= 7) return 'Đang đợi';
    if (status === 8) return 'Đã nhận việc';
    if (status >= 9 && status <= 11) return 'Đang thanh toán';
    if (status === 12 || status === 15 || status === 16 || status === 17) return 'Đã kết thúc';
    return 'Chưa xử lý';
  };

  const handleEdit = (candidateId, e) => {
    e.stopPropagation();
    navigate(`/agent/candidates/${candidateId}/edit`);
  };

  const handleDelete = async (candidateId, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) {
      try {
        const response = await apiService.deleteCVStorage(candidateId);
        if (response.success) {
          // Reload candidates after deletion
          loadCandidates();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi xóa ứng viên');
        }
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Có lỗi xảy ra khi xóa ứng viên');
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên ứng viên</label>
            <input
              type="text"
              placeholder="Nhập tên ứng viên"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Tất cả</option>
              <option value="0">{t.draft || 'Draft'}</option>
              <option value="1">{t.active || 'Active'}</option>
              <option value="2">{t.archived || 'Archived'}</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-xs font-bold text-gray-700 mb-1">Ngày tạo hồ sơ</label>
            <input
              type="date"
              value={createdDateFilter}
              onChange={(e) => {
                setCreatedDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors self-end"
          >
            {t.reset || 'Reset'}
          </button>
          <button className="text-gray-600 hover:text-gray-800 p-2 self-end">
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/agent/candidates/create')}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors flex items-center gap-2 self-end"
          >
            <Plus className="w-4 h-4" />
            <Plus className="w-4 h-4" />
            {t.addCandidate || '+ Add a candidate'}
          </button>
          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors flex items-center gap-2 self-end">
            <Settings className="w-4 h-4" />
            {t.displaySettings || 'Display Settings'}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-900">{t.duplicate || 'Duplicate'}</label>
            <select
              value={isDuplicateFilter}
              onChange={(e) => {
                setIsDuplicateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t.all || 'All'}</option>
              <option value="0">{t.notDuplicate || 'Not Duplicate'}</option>
              <option value="1">{t.isDuplicate || 'Duplicate'}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMyCandidates}
              onChange={(e) => setOnlyMyCandidates(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
              disabled
            />
            <span className="text-sm text-gray-700 font-bold">{t.onlyMyCandidates || 'Only show your candidates'}</span>
          </label>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(Math.min(7, totalPages))].map((_, i) => {
            // Calculate page numbers to show
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
            
            if (pageNum < 1 || pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-red-600 text-white'
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
            className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-700 font-bold">{totalItems} {t.items || 'items'}</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 min-h-0 relative">
        <div className="overflow-x-auto h-full">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-center text-xs font-bold text-gray-900 border-b border-gray-200 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === candidates.length && candidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-600"
                  />
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors min-w-[180px]"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    {t.candidateName || 'Tên ứng viên'}
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-b border-gray-200 min-w-[120px]">{t.phase || 'Loại hồ sơ'}</th>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors min-w-[140px]"
                  onClick={() => handleSort('applicationsCount')}
                >
                  <div className="flex items-center gap-1">
                    {t.numberOfApplications || 'Số lượt ứng tuyển'}
                    {getSortIcon('applicationsCount')}
                  </div>
                </th>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors min-w-[130px]"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Ngày tạo hồ sơ
                    {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-gray-900 border-b border-gray-200 min-w-[140px]">{t.scoutStatus || 'Scout Status'}</th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border-b border-gray-200 min-w-[140px]">{t.actions || 'Thao tác'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-6 text-center text-gray-500 text-xs">
                    {t.loadingCandidates || 'Đang tải dữ liệu...'}
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-6 text-center text-gray-500 text-xs">
                    {t.noCandidatesFound || 'Không tìm thấy ứng viên nào'}
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, index) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/agent/candidates/${candidate.id}`)}
                  >
                    <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="w-3.5 h-3.5 text-red-600 border-gray-300 rounded focus:ring-red-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 cursor-pointer">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium">{candidate.name || candidate.nameKanji || 'N/A'}</span>
                          {candidate.isDuplicate && (
                            <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" title="Duplicate" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          ID: {candidate.code || candidate.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={candidate.status || ''}
                        onChange={async (e) => {
                          const newStatus = parseInt(e.target.value);
                          try {
                            const formData = new FormData();
                            formData.append('status', newStatus);
                            const response = await apiService.updateCVStorage(candidate.id, formData);
                            if (response.success) {
                              // Cập nhật local state
                              setCandidates(prev => prev.map(c => 
                                c.id === candidate.id ? { ...c, status: newStatus } : c
                              ));
                            } else {
                              alert(response.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
                              e.target.value = candidate.status; // Revert
                            }
                          } catch (error) {
                            console.error('Error updating candidate status:', error);
                            alert('Có lỗi xảy ra khi cập nhật trạng thái');
                            e.target.value = candidate.status; // Revert
                          }
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-600 w-full cursor-pointer"
                      >
                        <option value="0">{t.draft || 'Draft'}</option>
                        <option value="1">{t.active || 'Active'}</option>
                        <option value="2">{t.archived || 'Archived'}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-900 font-medium">{candidate.applicationsCount || 0}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent/candidates/${candidate.id}/applications`);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-0.5"
                          title="Xem danh sách ứng tuyển"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {formatDate(candidate.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      {candidate.latestApplicationStatus ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block ${
                          candidate.latestApplicationStatus >= 2 && candidate.latestApplicationStatus <= 11
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getScoutStatusLabel(candidate.latestApplicationStatus)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent/candidates/${candidate.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(candidate.id, e)}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Sửa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(candidate.id, e)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Thêm tùy chọn"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;
