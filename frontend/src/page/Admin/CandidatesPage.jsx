import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
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
  User,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';


const AdminCandidatesPage = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('OR'); // OR or AND
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [firstInterviewDate, setFirstInterviewDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showArchiveOnly, setShowArchiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  
  // Hover states
  const [hoveredSearchModeOR, setHoveredSearchModeOR] = useState(false);
  const [hoveredSearchModeAND, setHoveredSearchModeAND] = useState(false);
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredAdvancedSearchButton, setHoveredAdvancedSearchButton] = useState(false);
  const [hoveredInfoButton, setHoveredInfoButton] = useState(false);
  const [hoveredAddCandidateButton, setHoveredAddCandidateButton] = useState(false);
  const [hoveredSettingsButton, setHoveredSettingsButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredCandidateIdLinkIndex, setHoveredCandidateIdLinkIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredRecommendationsLinkIndex, setHoveredRecommendationsLinkIndex] = useState(null);
  const [hoveredSendButtonIndex, setHoveredSendButtonIndex] = useState(null);
  const [hoveredMoreButtonIndex, setHoveredMoreButtonIndex] = useState(null);

  useEffect(() => {
    loadCandidates();
  }, [currentPage, itemsPerPage, selectedStatus]);

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

      if (selectedStatus) {
        params.status = selectedStatus === 'active' ? 1 : 0;
      }

      if (firstInterviewDate) {
        params.startDate = firstInterviewDate;
        params.endDate = firstInterviewDate;
      }

      const response = await apiService.getAdminCVs(params);
      if (response.success && response.data) {
        setCandidates(response.data.cvs || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Sample data (fallback)
  const sampleCandidates = [
    { id: '00044572', name: 'PHAM NGO BINH', email: 'phamngobinh@example.com', phone: '0901234567', inflowPath: 'Website', inHouseResp: 'Nguyen Van A', firstInterview: '2025/01/15', phase: 'Phase 1', recommendations: 1, scouts: 2, scoutStatus: 'Active', finalScoutRelease: '2025/01/20', status: 'active', ctv: 'CTV001' },
    { id: '00044064', name: 'NGUYEN THI NGA', email: 'nguyenthinga@example.com', phone: '0902345678', inflowPath: 'Referral', inHouseResp: 'Nguyen Hai Quang', firstInterview: '2025/12/17', phase: 'Phase 2', recommendations: 1, scouts: 1, scoutStatus: 'Pending', finalScoutRelease: '2025/12/17', status: 'active', ctv: 'CTV002' },
    { id: '00043293', name: 'TRAN VAN CUONG', email: 'tranvancuong@example.com', phone: '0903456789', inflowPath: 'Website', inHouseResp: '—', firstInterview: '2025/12/10', phase: 'Phase 1', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV003' },
    { id: '00043103', name: 'LE THI MAI', email: 'lethimai@example.com', phone: '0904567890', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '2025/12/08', phase: '', recommendations: 1, scouts: 1, scoutStatus: 'Active', finalScoutRelease: '-', status: 'active', ctv: 'CTV004' },
    { id: '00042979', name: 'HOANG VAN DUC', email: 'hoangvanduc@example.com', phone: '0905678901', inflowPath: 'Website', inHouseResp: '—', firstInterview: '2025/12/05', phase: 'Phase 1', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV005' },
    { id: '00042966', name: 'VU THI HOA', email: 'vuthihoa@example.com', phone: '0906789012', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 3, scouts: 2, scoutStatus: 'Active', finalScoutRelease: '-', status: 'active', ctv: 'CTV006' },
    { id: '00042950', name: 'CANDIDATE A', email: 'candidatea@example.com', phone: '0907890123', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV007' },
    { id: '00042949', name: 'CANDIDATE B', email: 'candidateb@example.com', phone: '0908901234', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'inactive', ctv: 'CTV008' },
    { id: '00042948', name: 'CANDIDATE C', email: 'candidatec@example.com', phone: '0909012345', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV009' },
    { id: '00042947', name: 'CANDIDATE D', email: 'candidated@example.com', phone: '0900123456', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 1, scoutStatus: 'Pending', finalScoutRelease: '-', status: 'active', ctv: 'CTV010' },
    { id: '00042946', name: 'CANDIDATE E', email: 'candidatee@example.com', phone: '0901234567', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV011' },
    { id: '00042945', name: 'CANDIDATE F', email: 'candidatef@example.com', phone: '0902345678', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'inactive', ctv: 'CTV012' },
    { id: '00042944', name: 'CANDIDATE G', email: 'candidateg@example.com', phone: '0903456789', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV013' },
    { id: '00042943', name: 'CANDIDATE H', email: 'candidateh@example.com', phone: '0904567890', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV014' },
    { id: '00042942', name: 'CANDIDATE I', email: 'candidatei@example.com', phone: '0905678901', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV015' },
    { id: '00042941', name: 'CANDIDATE J', email: 'candidatej@example.com', phone: '0906789012', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 1, scoutStatus: 'Active', finalScoutRelease: '-', status: 'active', ctv: 'CTV016' },
    { id: '00042940', name: 'CANDIDATE K', email: 'candidatek@example.com', phone: '0907890123', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'inactive', ctv: 'CTV017' },
    { id: '00042939', name: 'CANDIDATE L', email: 'candidatel@example.com', phone: '0908901234', inflowPath: 'Referral', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV018' },
    { id: '00042938', name: 'CANDIDATE M', email: 'candidatem@example.com', phone: '0909012345', inflowPath: 'Website', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 1, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV019' },
    { id: '00042937', name: 'CANDIDATE N', email: 'candidaten@example.com', phone: '0900123456', inflowPath: 'Social Media', inHouseResp: '—', firstInterview: '—', phase: '', recommendations: 0, scouts: 0, scoutStatus: '—', finalScoutRelease: '-', status: 'active', ctv: 'CTV020' },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

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
    setSelectedStatus('');
    setShowArchiveOnly(false);
    setSearchMode('OR');
    setCurrentPage(1);
    loadCandidates();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCandidates();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex gap-1">
            <button
              onClick={() => setSearchMode('OR')}
              onMouseEnter={() => searchMode !== 'OR' && setHoveredSearchModeOR(true)}
              onMouseLeave={() => setHoveredSearchModeOR(false)}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: searchMode === 'OR' ? '#2563eb' : (hoveredSearchModeOR ? '#e5e7eb' : '#f3f4f6'),
                color: searchMode === 'OR' ? 'white' : '#374151'
              }}
            >
              OR
            </button>
            <button
              onClick={() => setSearchMode('AND')}
              onMouseEnter={() => searchMode !== 'AND' && setHoveredSearchModeAND(true)}
              onMouseLeave={() => setHoveredSearchModeAND(false)}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              style={{
                backgroundColor: searchMode === 'AND' ? '#2563eb' : (hoveredSearchModeAND ? '#e5e7eb' : '#f3f4f6'),
                color: searchMode === 'AND' ? 'white' : '#374151'
              }}
            >
              AND
            </button>
          </div>
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="ID, tên ứng viên, email, số điện thoại, học vấn, kinh nghiệm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 border rounded text-xs"
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
          <button
            onClick={handleSearch}
            onMouseEnter={() => setHoveredSearchButton(true)}
            onMouseLeave={() => setHoveredSearchButton(false)}
            className="px-4 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSearchButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Search className="w-3.5 h-3.5" />
            Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            onMouseEnter={() => setHoveredResetButton(true)}
            onMouseLeave={() => setHoveredResetButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            Reset
          </button>
          <button
            onMouseEnter={() => setHoveredAdvancedSearchButton(true)}
            onMouseLeave={() => setHoveredAdvancedSearchButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredAdvancedSearchButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            Tìm kiếm nâng cao
          </button>
          <button
            onMouseEnter={() => setHoveredInfoButton(true)}
            onMouseLeave={() => setHoveredInfoButton(false)}
            className="p-1.5"
            style={{
              color: hoveredInfoButton ? '#1f2937' : '#4b5563'
            }}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/admin/candidates/create')}
            onMouseEnter={() => setHoveredAddCandidateButton(true)}
            onMouseLeave={() => setHoveredAddCandidateButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredAddCandidateButton ? '#eab308' : '#facc15',
              color: '#111827'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm ứng viên
          </button>
          <button
            onMouseEnter={() => setHoveredSettingsButton(true)}
            onMouseLeave={() => setHoveredSettingsButton(false)}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSettingsButton ? '#111827' : '#1f2937',
              color: 'white'
            }}
          >
            <Settings className="w-3.5 h-3.5" />
            Cài đặt
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
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
              <option value="phase1">Phase 1</option>
              <option value="phase2">Phase 2</option>
              <option value="phase3">Phase 3</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>Trạng thái</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
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
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>Ngày phỏng vấn đầu</label>
            <input
              type="date"
              value={firstInterviewDate}
              onChange={(e) => setFirstInterviewDate(e.target.value)}
              className="px-2 py-1 border rounded text-xs"
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
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchiveOnly}
              onChange={(e) => setShowArchiveOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
              style={{
                accentColor: '#2563eb',
                borderColor: '#d1d5db'
              }}
            />
            <span className="text-xs font-semibold" style={{ color: '#374151' }}>Chỉ hiển thị đã lưu trữ</span>
          </label>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('first')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'first' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            onMouseEnter={() => currentPage !== 1 && setHoveredPaginationNavButton('prev')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'prev' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
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
                onMouseEnter={() => currentPage !== pageNum && setHoveredPaginationButtonIndex(pageNum)}
                onMouseLeave={() => setHoveredPaginationButtonIndex(null)}
                className="px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: currentPage === pageNum
                    ? '#2563eb'
                    : (hoveredPaginationButtonIndex === pageNum ? '#f9fafb' : 'white'),
                  border: currentPage === pageNum ? 'none' : '1px solid #d1d5db',
                  color: currentPage === pageNum ? 'white' : '#374151'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('next')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'next' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            onMouseEnter={() => currentPage !== totalPages && setHoveredPaginationNavButton('last')}
            onMouseLeave={() => setHoveredPaginationNavButton(null)}
            className="px-1.5 py-1 border rounded text-xs font-semibold transition-colors"
            style={{
              backgroundColor: hoveredPaginationNavButton === 'last' ? '#f9fafb' : 'white',
              borderColor: '#d1d5db',
              color: '#374151',
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
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
            className="px-2.5 py-1 border rounded text-xs font-semibold"
            style={{
              borderColor: '#d1d5db',
              color: '#374151',
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
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-xs font-semibold" style={{ color: '#374151' }}>{totalItems} items</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-lg border min-h-0 relative" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="overflow-x-auto h-full">
          <table className="w-full">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-3 py-2 text-center text-[10px] font-semibold border-b w-10" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === candidates.length && candidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>ID</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Tên ứng viên</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Email</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Số điện thoại</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>CTV</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ngày PV đầu</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Phase</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Số tiến cử</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Số Scouts</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Trạng thái</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, index) => {
                  const statusLabel = candidate.status === 1 ? 'active' : 'inactive';
                  const receiveDate = candidate.receiveDate 
                    ? new Date(candidate.receiveDate).toLocaleDateString('vi-VN')
                    : candidate.createdAt
                    ? new Date(candidate.createdAt).toLocaleDateString('vi-VN')
                    : '-';
                  
                  return (
                    <tr
                      key={candidate.id}
                      className="transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                      style={{
                        backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                      }}
                    >
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => handleSelectRow(index)}
                          className="w-3.5 h-3.5 rounded"
                          style={{
                            accentColor: '#2563eb',
                            borderColor: '#d1d5db'
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                          onMouseEnter={() => setHoveredCandidateIdLinkIndex(index)}
                          onMouseLeave={() => setHoveredCandidateIdLinkIndex(null)}
                          className="font-medium text-[11px] flex items-center gap-1"
                          style={{
                            color: hoveredCandidateIdLinkIndex === index ? '#1e40af' : '#2563eb'
                          }}
                        >
                          {candidate.code || candidate.id}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-[11px] font-medium" style={{ color: '#111827' }}>{candidate.name || candidate.fullName || '-'}</td>
                      <td className="px-3 py-2 text-[11px]" style={{ color: '#374151' }}>
                        {candidate.email && candidate.email.includes('@') ? (
                          <div className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                            <span className="truncate">{candidate.email}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[11px]" style={{ color: '#374151' }}>
                        {candidate.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#9ca3af' }} />
                            <span className="truncate">{candidate.phone}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {candidate.collaborator ? (
                          <button
                            onClick={() => navigate(`/admin/collaborators/${candidate.collaborator.id}`)}
                            onMouseEnter={() => setHoveredCollaboratorLinkIndex(index)}
                            onMouseLeave={() => setHoveredCollaboratorLinkIndex(null)}
                            className="text-[11px] font-medium"
                            style={{
                              color: hoveredCollaboratorLinkIndex === index ? '#1e40af' : '#2563eb'
                            }}
                          >
                            {candidate.collaborator.code || candidate.collaborator.name}
                          </button>
                        ) : (
                          <span className="text-[11px]" style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[11px]" style={{ color: '#374151' }}>{receiveDate}</td>
                      <td className="px-3 py-2">
                        <select className="px-1.5 py-0.5 border rounded text-[10px] w-full" style={{ borderColor: '#d1d5db', color: '#374151', outline: 'none' }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2563eb';
                            e.target.style.boxShadow = '0 0 0 1px rgba(37, 99, 235, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Chọn</option>
                          <option value="phase1">Phase 1</option>
                          <option value="phase2">Phase 2</option>
                          <option value="phase3">Phase 3</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-medium" style={{ color: '#111827' }}>0</span>
                          <button
                            onClick={() => navigate(`/admin/candidates/${candidate.id}/recommendations`)}
                            onMouseEnter={() => setHoveredRecommendationsLinkIndex(index)}
                            onMouseLeave={() => setHoveredRecommendationsLinkIndex(null)}
                            style={{
                              color: hoveredRecommendationsLinkIndex === index ? '#1e40af' : '#2563eb'
                            }}
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[11px]" style={{ color: '#374151' }}>0</td>
                      <td className="px-3 py-2">
                        <select 
                          value={statusLabel}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: statusLabel === 'active' ? '#dcfce7' : '#fee2e2',
                            color: statusLabel === 'active' ? '#166534' : '#991b1b',
                            border: statusLabel === 'active' ? '1px solid #86efac' : '1px solid #fca5a5',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = '0 0 0 1px rgba(37, 99, 235, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="inactive">Ngừng hoạt động</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onMouseEnter={() => setHoveredSendButtonIndex(index)}
                            onMouseLeave={() => setHoveredSendButtonIndex(null)}
                            className="p-0.5 rounded transition-colors"
                            style={{
                              color: hoveredSendButtonIndex === index ? '#1e40af' : '#2563eb',
                              backgroundColor: hoveredSendButtonIndex === index ? '#eff6ff' : 'transparent'
                            }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onMouseEnter={() => setHoveredMoreButtonIndex(index)}
                            onMouseLeave={() => setHoveredMoreButtonIndex(null)}
                            className="p-0.5 rounded transition-colors"
                            style={{
                              color: hoveredMoreButtonIndex === index ? '#1f2937' : '#4b5563',
                              backgroundColor: hoveredMoreButtonIndex === index ? '#f3f4f6' : 'transparent'
                            }}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
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

export default AdminCandidatesPage;
