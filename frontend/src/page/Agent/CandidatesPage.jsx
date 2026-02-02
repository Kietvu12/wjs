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
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const CandidatesPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [searchMode, setSearchMode] = useState('OR'); // OR or AND
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [firstInterviewDate, setFirstInterviewDate] = useState('');
  const [onlyMyCandidates, setOnlyMyCandidates] = useState(true); // Default to true for CTV
  const [showArchiveOnly, setShowArchiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Data states
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState(''); // Filter by status
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(''); // Filter by duplicate status

  // Load candidates data
  useEffect(() => {
    loadCandidates();
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, isDuplicateFilter, firstInterviewDate]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (isDuplicateFilter !== '') {
        params.isDuplicate = isDuplicateFilter;
      }

      const response = await apiService.getCVStorages(params);

      if (response.success && response.data) {
        setCandidates(response.data.cvs || []);
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
    setSearchQuery('');
    setSelectedPhase('');
    setFirstInterviewDate('');
    setOnlyMyCandidates(true);
    setShowArchiveOnly(false);
    setSearchMode('OR');
    setStatusFilter('');
    setIsDuplicateFilter('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
    loadCandidates();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex gap-1">
            <button
              onClick={() => setSearchMode('OR')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                searchMode === 'OR'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              OR
            </button>
            <button
              onClick={() => setSearchMode('AND')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                searchMode === 'AND'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AND
            </button>
          </div>
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder={t.searchPlaceholder || 'ID, candidate name, education, work history, qualification'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {t.qSearch || 'Q Search'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            {t.reset || 'Reset'}
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
            {t.openAdvancedSearch || 'Open Advanced Search'}
          </button>
          <button className="text-gray-600 hover:text-gray-800 p-2">
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/agent/candidates/create')}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-bold text-sm hover:bg-yellow-500 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <Plus className="w-4 h-4" />
            {t.addCandidate || '+ Add a candidate'}
          </button>
          <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-bold text-sm hover:bg-gray-900 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t.displaySettings || 'Display Settings'}
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-900">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">{t.all || 'All'}</option>
              <option value="0">{t.draft || 'Draft'}</option>
              <option value="1">{t.active || 'Active'}</option>
              <option value="2">{t.archived || 'Archived'}</option>
            </select>
          </div>
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
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-200 min-h-0 relative">
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 border-b border-gray-200 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === candidates.length && candidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">{t.candidateId || 'ID'}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">{t.candidateName || 'Name of candidate'}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">{t.phase || 'Phase'}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">{t.numberOfApplications || 'Số lượt ứng tuyển'}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">{t.numberOfScouts || 'Number of Scouts'}</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">{t.scoutStatus || 'Scout Status'}</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 border-b border-gray-200">{t.actions || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    {t.loadingCandidates || 'Đang tải dữ liệu...'}
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
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
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                      />
                    </td>
                    <td className="px-4 py-3 cursor-pointer">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/agent/candidates/${candidate.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                      >
                        {candidate.code || candidate.id}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-900 cursor-pointer">
                      <div className="flex items-center gap-2">
                        {candidate.name || candidate.nameKanji || 'N/A'}
                        {candidate.isDuplicate && (
                          <AlertTriangle className="w-3 h-3 text-orange-500" title="Duplicate" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 w-full cursor-pointer"
                      >
                        <option value="0">{t.draft || 'Draft'}</option>
                        <option value="1">{t.active || 'Active'}</option>
                        <option value="2">{t.archived || 'Archived'}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-900 font-medium">{candidate.applicationsCount || 0}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent/candidates/${candidate.id}/applications`);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem danh sách ứng tuyển"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {candidate.latestApplicationStatus ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          candidate.latestApplicationStatus >= 2 && candidate.latestApplicationStatus <= 11
                            ? 'bg-green-100 text-green-800'
                            : candidate.latestApplicationStatus === 12 || candidate.latestApplicationStatus === 15 || 
                              candidate.latestApplicationStatus === 16 || candidate.latestApplicationStatus === 17
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusLabel(candidate.latestApplicationStatus)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {candidate.latestApplicationStatus ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          candidate.latestApplicationStatus >= 2 && candidate.latestApplicationStatus <= 11
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getScoutStatusLabel(candidate.latestApplicationStatus)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agent/candidates/${candidate.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="View details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
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
