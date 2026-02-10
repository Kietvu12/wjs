import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Briefcase,
  User,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Send,
} from 'lucide-react';


const AdminNominationsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  
  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredAddNominationButton, setHoveredAddNominationButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredIdLinkIndex, setHoveredIdLinkIndex] = useState(null);
  const [hoveredCandidateLinkIndex, setHoveredCandidateLinkIndex] = useState(null);
  const [hoveredJobLinkIndex, setHoveredJobLinkIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredEditButtonIndex, setHoveredEditButtonIndex] = useState(null);
  const [hoveredDeleteButtonIndex, setHoveredDeleteButtonIndex] = useState(null);

  useEffect(() => {
    loadNominations();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo]);

  const loadNominations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'applied_at',
        sortOrder: 'DESC'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      // Map status filter từ frontend labels sang backend status numbers
      if (statusFilter) {
        const statusMap = {
          'pending': 1, // Admin đang xử lý hồ sơ
          'interviewed': 4, // Đang phỏng vấn
          'accepted': 8, // Đã nyusha
          'rejected': 15 // Kết quả trượt
        };
        params.status = statusMap[statusFilter] || statusFilter;
      }

      // Date range filter - sử dụng appliedAt
      // Backend chỉ hỗ trợ filter theo 1 ngày, không hỗ trợ range
      // Có thể dùng dateFrom làm appliedAt filter
      if (dateFrom) {
        params.appliedAt = dateFrom;
      }

      const response = await apiService.getAdminJobApplications(params);
      if (response.success && response.data) {
        setNominations(response.data.jobApplications || response.data.applications || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading nominations:', error);
      setNominations([]);
    } finally {
      setLoading(false);
    }
  };

  // Map status từ số sang label (using utility function)
  const getStatusLabel = (status) => {
    const statusInfo = getJobApplicationStatus(status);
    // Map category to simple value for filter compatibility
    let value = 'pending';
    if (statusInfo.category === 'success' || status === 8 || status === 11) {
      value = 'accepted';
    } else if (statusInfo.category === 'rejected' || statusInfo.category === 'cancelled') {
      value = 'rejected';
    } else if (statusInfo.category === 'interview') {
      value = 'interviewed';
    }
    return { label: statusInfo.label, value, color: statusInfo.color };
  };

  // Sample data - nominations/applications (fallback)
  const sampleNominations = [
    {
      id: 'APP001',
      candidateName: 'Nguyen Van A',
      candidateId: '00044572',
      jobTitle: 'Software Engineer',
      jobId: 'JOB001',
      companyName: 'Tech Company A',
      collaboratorName: 'CTV001',
      status: 'pending',
      statusLabel: 'Đang chờ',
      appliedDate: '2025-01-15',
      interviewDate: '2025-01-20',
      referralFee: 500000,
      salary: '800万円',
    },
    {
      id: 'APP002',
      candidateName: 'Tran Thi B',
      candidateId: '00044064',
      jobTitle: 'Project Manager',
      jobId: 'JOB002',
      companyName: 'Business Corp',
      collaboratorName: 'CTV002',
      status: 'interviewed',
      statusLabel: 'Đã phỏng vấn',
      appliedDate: '2025-01-10',
      interviewDate: '2025-01-18',
      referralFee: 800000,
      salary: '1000万円',
    },
    {
      id: 'APP003',
      candidateName: 'Le Van C',
      candidateId: '00043293',
      jobTitle: 'Frontend Developer',
      jobId: 'JOB003',
      companyName: 'Web Solutions',
      collaboratorName: 'CTV003',
      status: 'accepted',
      statusLabel: 'Đã nhận việc',
      appliedDate: '2025-01-05',
      interviewDate: '2025-01-12',
      referralFee: 600000,
      salary: '750万円',
    },
    {
      id: 'APP004',
      candidateName: 'Pham Thi D',
      candidateId: '00043103',
      jobTitle: 'Backend Developer',
      jobId: 'JOB004',
      companyName: 'Tech Startup',
      collaboratorName: 'CTV001',
      status: 'rejected',
      statusLabel: 'Đã từ chối',
      appliedDate: '2025-01-08',
      interviewDate: '2025-01-15',
      referralFee: 0,
      salary: '—',
    },
    {
      id: 'APP005',
      candidateName: 'Hoang Van E',
      candidateId: '00042979',
      jobTitle: 'DevOps Engineer',
      jobId: 'JOB005',
      companyName: 'Cloud Services',
      collaboratorName: 'CTV004',
      status: 'pending',
      statusLabel: 'Đang chờ',
      appliedDate: '2025-01-20',
      interviewDate: '—',
      referralFee: 700000,
      salary: '900万円',
    },
    {
      id: 'APP006',
      candidateName: 'Vu Thi F',
      candidateId: '00042966',
      jobTitle: 'UI/UX Designer',
      jobId: 'JOB006',
      companyName: 'Design Studio',
      collaboratorName: 'CTV002',
      status: 'interviewed',
      statusLabel: 'Đã phỏng vấn',
      appliedDate: '2025-01-12',
      interviewDate: '2025-01-19',
      referralFee: 550000,
      salary: '700万円',
    },
    {
      id: 'APP007',
      candidateName: 'Dao Van G',
      candidateId: '00042950',
      jobTitle: 'Data Analyst',
      jobId: 'JOB007',
      companyName: 'Data Corp',
      collaboratorName: 'CTV005',
      status: 'accepted',
      statusLabel: 'Đã nhận việc',
      appliedDate: '2025-01-03',
      interviewDate: '2025-01-10',
      referralFee: 650000,
      salary: '850万円',
    },
    {
      id: 'APP008',
      candidateName: 'Bui Thi H',
      candidateId: '00042949',
      jobTitle: 'QA Engineer',
      jobId: 'JOB008',
      companyName: 'Quality Assurance Inc',
      collaboratorName: 'CTV003',
      status: 'pending',
      statusLabel: 'Đang chờ',
      appliedDate: '2025-01-18',
      interviewDate: '—',
      referralFee: 500000,
      salary: '650万円',
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const getStatusColorStyle = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef9c3', color: '#854d0e' };
      case 'interviewed':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'accepted':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'interviewed':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'accepted':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(nominations.map((_, index) => index)));
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
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    loadNominations();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadNominations();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa đơn tiến cử ${id}?`)) {
      try {
        const response = await apiService.deleteAdminJobApplication(id);
        if (response.success) {
          alert('Xóa đơn tiến cử thành công!');
          loadNominations();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi xóa đơn tiến cử');
        }
      } catch (error) {
        console.error('Error deleting nomination:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa đơn tiến cử');
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ứng viên, job title, công ty, ID, CTV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 border rounded-lg text-xs"
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
            className="px-4 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
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
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
            style={{
              backgroundColor: hoveredResetButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            Reset
          </button>
          <button
            onClick={() => navigate('/admin/nominations/create')}
            onMouseEnter={() => setHoveredAddNominationButton(true)}
            onMouseLeave={() => setHoveredAddNominationButton(false)}
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredAddNominationButton ? '#eab308' : '#facc15',
              color: '#111827'
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm đơn tiến cử
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="pending">Đang chờ</option>
              <option value="interviewed">Đã phỏng vấn</option>
              <option value="accepted">Đã nhận việc</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>Từ ngày:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
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
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold" style={{ color: '#111827' }}>Đến ngày:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
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
            onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('next')}
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
            onMouseEnter={() => currentPage < totalPages && setHoveredPaginationNavButton('last')}
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
                <th className="px-3 py-2 text-center text-xs font-semibold border-b w-10" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === nominations.length && nominations.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ứng viên</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Job</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Công ty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>CTV</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Admin</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Admin phụ trách</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Trạng thái</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ngày tiến cử</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ngày PV</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Phí giới thiệu</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Lương</th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="14" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : nominations.length === 0 ? (
                <tr>
                  <td colSpan="14" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                nominations.map((nomination, index) => {
                  const statusInfo = getStatusLabel(nomination.status);
                  const appliedDate = nomination.appliedAt 
                    ? new Date(nomination.appliedAt).toLocaleDateString('vi-VN')
                    : '-';
                  const interviewDate = nomination.interviewDate 
                    ? new Date(nomination.interviewDate).toLocaleDateString('vi-VN')
                    : '—';
                  
                  // Get salary display
                  let salaryDisplay = '—';
                  if (nomination.annualSalary) {
                    salaryDisplay = `${nomination.annualSalary.toLocaleString('vi-VN')}万円/năm`;
                  } else if (nomination.monthlySalary) {
                    salaryDisplay = `${nomination.monthlySalary.toLocaleString('vi-VN')}万円/tháng`;
                  } else if (nomination.job?.estimatedSalary) {
                    salaryDisplay = nomination.job.estimatedSalary;
                  }

                  const statusStyle = getStatusColorStyle(statusInfo.value);
                  return (
                    <tr
                      key={nomination.id}
                      className="transition-colors"
                      style={{
                        backgroundColor: hoveredRowIndex === index ? '#f9fafb' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredRowIndex(index)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
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
                          onClick={() => navigate(`/admin/nominations/${nomination.id}`)}
                          onMouseEnter={() => setHoveredIdLinkIndex(index)}
                          onMouseLeave={() => setHoveredIdLinkIndex(null)}
                          className="font-medium text-xs flex items-center gap-1"
                          style={{
                            color: hoveredIdLinkIndex === index ? '#1e40af' : '#2563eb'
                          }}
                        >
                          {nomination.id}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[10px]" style={{ backgroundColor: '#a855f7' }}>
                            {(nomination.cv?.name || nomination.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {nomination.cvId ? (
                              <button
                                onClick={() => navigate(`/admin/candidates/${nomination.cvId}`)}
                                onMouseEnter={() => setHoveredCandidateLinkIndex(index)}
                                onMouseLeave={() => setHoveredCandidateLinkIndex(null)}
                                className="text-xs font-semibold"
                                style={{
                                  color: hoveredCandidateLinkIndex === index ? '#2563eb' : '#111827'
                                }}
                              >
                                {nomination.cv?.name || nomination.name || '-'}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold" style={{ color: '#111827' }}>
                                {nomination.cv?.name || nomination.name || '-'}
                              </span>
                            )}
                            {nomination.cv?.code && (
                              <p className="text-[10px]" style={{ color: '#6b7280' }}>{nomination.cv.code}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {nomination.jobId ? (
                          <button
                            onClick={() => navigate(`/admin/jobs/${nomination.jobId}`)}
                            onMouseEnter={() => setHoveredJobLinkIndex(index)}
                            onMouseLeave={() => setHoveredJobLinkIndex(null)}
                            className="text-xs font-medium flex items-center gap-1"
                            style={{
                              color: hoveredJobLinkIndex === index ? '#2563eb' : '#111827'
                            }}
                          >
                            <Briefcase className="w-3 h-3" />
                            {nomination.job?.title || nomination.job?.jobCode || '-'}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: '#374151' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                          <Building2 className="w-3 h-3" style={{ color: '#9ca3af' }} />
                          {nomination.job?.company?.name || nomination.companyName || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {nomination.collaboratorId ? (
                          <button
                            onClick={() => navigate(`/admin/collaborators/${nomination.collaboratorId}`)}
                            onMouseEnter={() => setHoveredCollaboratorLinkIndex(index)}
                            onMouseLeave={() => setHoveredCollaboratorLinkIndex(null)}
                            className="text-xs font-medium"
                            style={{
                              color: hoveredCollaboratorLinkIndex === index ? '#1e40af' : '#2563eb'
                            }}
                          >
                            {nomination.collaborator?.name || nomination.collaborator?.code || '-'}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {nomination.adminId ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3" style={{ color: '#9ca3af' }} />
                            <span className="text-xs font-medium" style={{ color: '#111827' }}>
                              {nomination.admin?.name || nomination.admin?.email || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {nomination.adminResponsibleId ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3" style={{ color: '#60a5fa' }} />
                            <span className="text-xs font-medium" style={{ color: '#1e3a8a' }}>
                              {nomination.adminResponsible?.name || nomination.adminResponsible?.email || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={statusStyle}>
                          {getStatusIcon(statusInfo.value)}
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                          {appliedDate}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                        {nomination.interviewDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                            {interviewDate}
                          </div>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#111827' }}>
                          <DollarSign className="w-3 h-3" style={{ color: '#16a34a' }} />
                          {nomination.referralFee ? `${nomination.referralFee.toLocaleString('vi-VN')}đ` : '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>{salaryDisplay}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/nominations/${nomination.id}`)}
                            onMouseEnter={() => setHoveredViewButtonIndex(index)}
                            onMouseLeave={() => setHoveredViewButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredViewButtonIndex === index ? '#1e40af' : '#2563eb',
                              backgroundColor: hoveredViewButtonIndex === index ? '#eff6ff' : 'transparent'
                            }}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/nominations/${nomination.id}/edit`)}
                            onMouseEnter={() => setHoveredEditButtonIndex(index)}
                            onMouseLeave={() => setHoveredEditButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredEditButtonIndex === index ? '#1f2937' : '#4b5563',
                              backgroundColor: hoveredEditButtonIndex === index ? '#f3f4f6' : 'transparent'
                            }}
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(nomination.id)}
                            onMouseEnter={() => setHoveredDeleteButtonIndex(index)}
                            onMouseLeave={() => setHoveredDeleteButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredDeleteButtonIndex === index ? '#991b1b' : '#dc2626',
                              backgroundColor: hoveredDeleteButtonIndex === index ? '#fef2f2' : 'transparent'
                            }}
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

export default AdminNominationsPage;
