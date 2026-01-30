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
              placeholder="ID, tên ứng viên, email, số điện thoại, học vấn, kinh nghiệm"
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
            onClick={() => navigate('/admin/candidates/create')}
            className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded text-xs font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm ứng viên
          </button>
          <button className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900 transition-colors flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Cài đặt
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Phase</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="phase1">Phase 1</option>
              <option value="phase2">Phase 2</option>
              <option value="phase3">Phase 3</option>
            </select>
          </div>
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
            <label className="text-xs font-semibold text-gray-900">Ngày phỏng vấn đầu</label>
            <input
              type="date"
              value={firstInterviewDate}
              onChange={(e) => setFirstInterviewDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchiveOnly}
              onChange={(e) => setShowArchiveOnly(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
            />
            <span className="text-xs text-gray-700 font-semibold">Chỉ hiển thị đã lưu trữ</span>
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
                    checked={selectedRows.size === candidates.length && candidates.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">ID</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Tên ứng viên</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Email</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Số điện thoại</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Nguồn</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">CTV</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Người phụ trách</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Ngày PV đầu</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Phase</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Số tiến cử</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Số Scouts</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-900 border-b border-gray-200">Trạng thái</th>
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-900 border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs text-gray-500">
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
                          onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-[11px] flex items-center gap-1"
                        >
                          {candidate.code || candidate.id}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-900 font-medium">{candidate.fullName || '-'}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5 text-gray-400" />
                        {candidate.email || '-'}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-gray-400" />
                        {candidate.phone || '-'}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-700">{candidate.source || '-'}</td>
                      <td className="px-3 py-2">
                        {candidate.collaborator ? (
                          <button
                            onClick={() => navigate(`/admin/collaborators/${candidate.collaborator.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-[11px] font-medium"
                          >
                            {candidate.collaborator.code || candidate.collaborator.name}
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-700">—</td>
                      <td className="px-3 py-2 text-[11px] text-gray-700">{receiveDate}</td>
                      <td className="px-3 py-2">
                        <select className="px-1.5 py-0.5 border border-gray-300 rounded text-[10px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 w-full">
                          <option value="">Chọn</option>
                          <option value="phase1">Phase 1</option>
                          <option value="phase2">Phase 2</option>
                          <option value="phase3">Phase 3</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-900 font-medium">0</span>
                          <button
                            onClick={() => navigate(`/admin/candidates/${candidate.id}/recommendations`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-gray-700">0</td>
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
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="text-blue-600 hover:text-blue-800 p-0.5 rounded hover:bg-blue-50 transition-colors">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 p-0.5 rounded hover:bg-gray-100 transition-colors">
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
