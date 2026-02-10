import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
} from 'lucide-react';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  // Hover states
  const [hoveredSearchButton, setHoveredSearchButton] = useState(false);
  const [hoveredResetButton, setHoveredResetButton] = useState(false);
  const [hoveredExportButton, setHoveredExportButton] = useState(false);
  const [hoveredPaginationNavButton, setHoveredPaginationNavButton] = useState(null);
  const [hoveredPaginationButtonIndex, setHoveredPaginationButtonIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredIdLinkIndex, setHoveredIdLinkIndex] = useState(null);
  const [hoveredRequestIdLinkIndex, setHoveredRequestIdLinkIndex] = useState(null);
  const [hoveredCollaboratorLinkIndex, setHoveredCollaboratorLinkIndex] = useState(null);
  const [hoveredCandidateLinkIndex, setHoveredCandidateLinkIndex] = useState(null);
  const [hoveredJobLinkIndex, setHoveredJobLinkIndex] = useState(null);
  const [hoveredViewButtonIndex, setHoveredViewButtonIndex] = useState(null);
  const [hoveredApproveButtonIndex, setHoveredApproveButtonIndex] = useState(null);
  const [hoveredRejectButtonIndex, setHoveredRejectButtonIndex] = useState(null);
  const [hoveredMarkAsPaidButtonIndex, setHoveredMarkAsPaidButtonIndex] = useState(null);
  const [hoveredMoreButtonIndex, setHoveredMoreButtonIndex] = useState(null);

  // Map status từ số sang string
  // Theo model: 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối, 3: Đã thanh toán
  const mapStatus = (status) => {
    const statusMap = {
      0: { key: 'pending', label: 'Chờ duyệt' },
      1: { key: 'approved', label: 'Đã duyệt' },
      2: { key: 'rejected', label: 'Đã từ chối' },
      3: { key: 'paid', label: 'Đã thanh toán' },
    };
    return statusMap[status] || { key: 'pending', label: 'Chờ duyệt' };
  };

  // Load payment requests từ API
  const loadPaymentRequests = async () => {
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

      if (statusFilter) {
        // Map từ string sang số
        const statusMap = {
          'pending': 0,
          'approved': 1,
          'rejected': 2,
          'paid': 3,
        };
        params.status = statusMap[statusFilter] !== undefined ? statusMap[statusFilter] : '';
      }

      if (dateFrom) {
        params.approvedFrom = dateFrom;
      }

      if (dateTo) {
        params.approvedTo = dateTo;
      }

      const response = await apiService.getAdminPaymentRequests(params);

      if (response.success && response.data) {
        // Map dữ liệu từ API sang format của component
        const mappedPayments = response.data.paymentRequests.map((payment) => {
          const statusInfo = mapStatus(payment.status);
          return {
            id: payment.id,
            requestId: payment.id.toString(),
            collaboratorName: payment.collaborator?.name || '—',
            collaboratorId: payment.collaboratorId,
            candidateName: payment.jobApplication?.cv?.name || payment.jobApplication?.cv?.fullName || '—',
            candidateId: payment.jobApplication?.cv?.code || '—',
            jobTitle: payment.jobApplication?.job?.title || '—',
            jobId: payment.jobApplication?.jobId,
            companyName: payment.jobApplication?.job?.company?.name || '—',
            applicationId: payment.jobApplicationId,
            amount: parseFloat(payment.amount) || 0,
            status: statusInfo.key,
            statusLabel: statusInfo.label,
            requestDate: payment.createdAt || payment.created_at,
            approvedDate: payment.approvedAt || payment.approved_at || '—',
            paidDate: payment.status === 3 ? (payment.updatedAt || payment.updated_at || '—') : '—',
            paymentMethod: '—', // TODO: Thêm paymentMethod vào model nếu cần
            cvId: payment.jobApplication?.cvId || payment.jobApplication?.cv?.id,
          };
        });

        setPaymentRequests(mappedPayments);
        setPagination(response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      setPaymentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentRequests();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo]);

  // Sample data - payment requests (fallback)
  const samplePaymentRequests = [
    {
      id: 'PAY001',
      requestId: 'REQ001',
      collaboratorName: 'Nguyen Thi X',
      collaboratorId: 'CTV001',
      candidateName: 'Nguyen Van A',
      candidateId: '00044572',
      jobTitle: 'Software Engineer',
      jobId: 'JOB001',
      companyName: 'Tech Company A',
      applicationId: 'APP001',
      amount: 500000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-10',
      approvedDate: '2025-01-12',
      paidDate: '2025-01-15',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY002',
      requestId: 'REQ002',
      collaboratorName: 'Tran Van Y',
      collaboratorId: 'CTV002',
      candidateName: 'Tran Thi B',
      candidateId: '00044064',
      jobTitle: 'Project Manager',
      jobId: 'JOB002',
      companyName: 'Business Corp',
      applicationId: 'APP002',
      amount: 800000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-08',
      approvedDate: '2025-01-10',
      paidDate: '2025-01-13',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY003',
      requestId: 'REQ003',
      collaboratorName: 'Le Thi Z',
      collaboratorId: 'CTV003',
      candidateName: 'Le Van C',
      candidateId: '00043293',
      jobTitle: 'Frontend Developer',
      jobId: 'JOB003',
      companyName: 'Web Solutions',
      applicationId: 'APP003',
      amount: 600000,
      status: 'approved',
      statusLabel: 'Đã duyệt',
      requestDate: '2025-01-15',
      approvedDate: '2025-01-18',
      paidDate: '—',
      paymentMethod: '—',
    },
    {
      id: 'PAY004',
      requestId: 'REQ004',
      collaboratorName: 'Nguyen Thi X',
      collaboratorId: 'CTV001',
      candidateName: 'Pham Thi D',
      candidateId: '00043103',
      jobTitle: 'Backend Developer',
      jobId: 'JOB004',
      companyName: 'Tech Startup',
      applicationId: 'APP004',
      amount: 700000,
      status: 'pending',
      statusLabel: 'Chờ duyệt',
      requestDate: '2025-01-20',
      approvedDate: '—',
      paidDate: '—',
      paymentMethod: '—',
    },
    {
      id: 'PAY005',
      requestId: 'REQ005',
      collaboratorName: 'Pham Van W',
      collaboratorId: 'CTV004',
      candidateName: 'Hoang Van E',
      candidateId: '00042979',
      jobTitle: 'DevOps Engineer',
      jobId: 'JOB005',
      companyName: 'Cloud Services',
      applicationId: 'APP005',
      amount: 550000,
      status: 'rejected',
      statusLabel: 'Đã từ chối',
      requestDate: '2025-01-12',
      approvedDate: '—',
      paidDate: '—',
      paymentMethod: '—',
    },
    {
      id: 'PAY006',
      requestId: 'REQ006',
      collaboratorName: 'Tran Van Y',
      collaboratorId: 'CTV002',
      candidateName: 'Vu Thi F',
      candidateId: '00042966',
      jobTitle: 'UI/UX Designer',
      jobId: 'JOB006',
      companyName: 'Design Studio',
      applicationId: 'APP006',
      amount: 650000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-05',
      approvedDate: '2025-01-07',
      paidDate: '2025-01-10',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY007',
      requestId: 'REQ007',
      collaboratorName: 'Hoang Thi V',
      collaboratorId: 'CTV005',
      candidateName: 'Dao Van G',
      candidateId: '00042950',
      jobTitle: 'Data Analyst',
      jobId: 'JOB007',
      companyName: 'Data Corp',
      applicationId: 'APP007',
      amount: 750000,
      status: 'paid',
      statusLabel: 'Đã thanh toán',
      requestDate: '2025-01-03',
      approvedDate: '2025-01-05',
      paidDate: '2025-01-08',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: 'PAY008',
      requestId: 'REQ008',
      collaboratorName: 'Le Thi Z',
      collaboratorId: 'CTV003',
      candidateName: 'Bui Thi H',
      candidateId: '00042949',
      jobTitle: 'QA Engineer',
      jobId: 'JOB008',
      companyName: 'Quality Assurance Inc',
      applicationId: 'APP008',
      amount: 500000,
      status: 'approved',
      statusLabel: 'Đã duyệt',
      requestDate: '2025-01-18',
      approvedDate: '2025-01-20',
      paidDate: '—',
      paymentMethod: '—',
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  // Statistics - tính từ dữ liệu thực tế
  const totalPaid = paymentRequests
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = paymentRequests
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalApproved = paymentRequests
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRejected = paymentRequests
    .filter(p => p.status === 'rejected')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingCount = paymentRequests.filter(p => p.status === 'pending').length;
  const totalApprovedCount = paymentRequests.filter(p => p.status === 'approved').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fef9c3', color: '#854d0e' };
      case 'approved':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'paid':
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
      case 'approved':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'paid':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(paymentRequests.map((_, index) => index)));
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
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPaymentRequests();
  };

  const handleApprove = async (id) => {
    if (window.confirm(`Bạn có chắc muốn duyệt yêu cầu thanh toán ${id}?`)) {
      try {
        const response = await apiService.approvePaymentRequest(id);
        if (response.success) {
          alert('Duyệt yêu cầu thanh toán thành công!');
          loadPaymentRequests();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi duyệt yêu cầu thanh toán');
        }
      } catch (error) {
        console.error('Error approving payment request:', error);
        alert(error.message || 'Có lỗi xảy ra khi duyệt yêu cầu thanh toán');
      }
    }
  };

  const handleReject = async (id) => {
    const rejectedReason = window.prompt('Nhập lý do từ chối:');
    if (rejectedReason && rejectedReason.trim()) {
      try {
        const response = await apiService.rejectPaymentRequest(id, rejectedReason.trim());
        if (response.success) {
          alert('Từ chối yêu cầu thanh toán thành công!');
          loadPaymentRequests();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi từ chối yêu cầu thanh toán');
        }
      } catch (error) {
        console.error('Error rejecting payment request:', error);
        alert(error.message || 'Có lỗi xảy ra khi từ chối yêu cầu thanh toán');
      }
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (window.confirm(`Bạn có chắc muốn đánh dấu đã thanh toán cho ${id}?`)) {
      try {
        const response = await apiService.markPaymentRequestAsPaid(id);
        if (response.success) {
          alert('Đánh dấu đã thanh toán thành công!');
          loadPaymentRequests();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi đánh dấu đã thanh toán');
        }
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert(error.message || 'Có lỗi xảy ra khi đánh dấu đã thanh toán');
      }
    }
  };

  const filteredPayments = paymentRequests;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>Tổng đã thanh toán</p>
              <p className="text-lg font-bold" style={{ color: '#16a34a' }}>
                {totalPaid.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {paymentRequests.filter(p => p.status === 'paid').length} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
              <CheckCircle className="w-6 h-6" style={{ color: '#16a34a' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>Chờ duyệt</p>
              <p className="text-lg font-bold" style={{ color: '#ca8a04' }}>
                {totalPending.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {totalPendingCount} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef9c3' }}>
              <Clock className="w-6 h-6" style={{ color: '#ca8a04' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>Đã duyệt (chờ thanh toán)</p>
              <p className="text-lg font-bold" style={{ color: '#2563eb' }}>
                {totalApproved.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {totalApprovedCount} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
              <AlertCircle className="w-6 h-6" style={{ color: '#2563eb' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4 border" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: '#4b5563' }}>Đã từ chối</p>
              <p className="text-lg font-bold" style={{ color: '#dc2626' }}>
                {totalRejected.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>
                {paymentRequests.filter(p => p.status === 'rejected').length} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fee2e2' }}>
              <XCircle className="w-6 h-6" style={{ color: '#dc2626' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-lg p-3 border mb-3 flex-shrink-0" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ứng viên, CTV, job title, công ty, ID..."
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
            onMouseEnter={() => setHoveredExportButton(true)}
            onMouseLeave={() => setHoveredExportButton(false)}
            className="px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredExportButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Xuất Excel
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
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="paid">Đã thanh toán</option>
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
                    checked={selectedRows.size === filteredPayments.length && filteredPayments.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded"
                    style={{
                      accentColor: '#2563eb',
                      borderColor: '#d1d5db'
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Mã yêu cầu</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>CTV</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ứng viên</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Job</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Công ty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Số tiền</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Trạng thái</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ngày yêu cầu</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ngày duyệt</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Ngày thanh toán</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Phương thức</th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e5e7eb' }}>
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs" style={{ color: '#6b7280' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                <tr
                  key={payment.id}
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
                      onClick={() => navigate(`/admin/payments/${payment.id}`)}
                      onMouseEnter={() => setHoveredIdLinkIndex(index)}
                      onMouseLeave={() => setHoveredIdLinkIndex(null)}
                      className="font-medium text-xs flex items-center gap-1"
                      style={{
                        color: hoveredIdLinkIndex === index ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {payment.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/nominations/${payment.applicationId}`)}
                      onMouseEnter={() => setHoveredRequestIdLinkIndex(index)}
                      onMouseLeave={() => setHoveredRequestIdLinkIndex(null)}
                      className="font-medium text-xs"
                      style={{
                        color: hoveredRequestIdLinkIndex === index ? '#1e40af' : '#2563eb'
                      }}
                    >
                      {payment.requestId}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/collaborators/${payment.collaboratorId}`)}
                      onMouseEnter={() => setHoveredCollaboratorLinkIndex(index)}
                      onMouseLeave={() => setHoveredCollaboratorLinkIndex(null)}
                      className="text-xs font-medium flex items-center gap-1"
                      style={{
                        color: hoveredCollaboratorLinkIndex === index ? '#1e40af' : '#2563eb'
                      }}
                    >
                      <Users className="w-3 h-3" />
                      {payment.collaboratorName}
                    </button>
                    <p className="text-[10px]" style={{ color: '#6b7280' }}>{payment.collaboratorId}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[10px]" style={{ backgroundColor: '#a855f7' }}>
                        {payment.candidateName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/admin/candidates/${payment.candidateId}`)}
                          onMouseEnter={() => setHoveredCandidateLinkIndex(index)}
                          onMouseLeave={() => setHoveredCandidateLinkIndex(null)}
                          className="text-xs font-semibold"
                          style={{
                            color: hoveredCandidateLinkIndex === index ? '#2563eb' : '#111827'
                          }}
                        >
                          {payment.candidateName}
                        </button>
                        <p className="text-[10px]" style={{ color: '#6b7280' }}>{payment.candidateId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/jobs/${payment.jobId}`)}
                      onMouseEnter={() => setHoveredJobLinkIndex(index)}
                      onMouseLeave={() => setHoveredJobLinkIndex(null)}
                      className="text-xs font-medium flex items-center gap-1"
                      style={{
                        color: hoveredJobLinkIndex === index ? '#2563eb' : '#111827'
                      }}
                    >
                      <Briefcase className="w-3 h-3" />
                      {payment.jobTitle}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#374151' }}>
                      <Building2 className="w-3 h-3" style={{ color: '#9ca3af' }} />
                      {payment.companyName}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#111827' }}>
                      <DollarSign className="w-3 h-3" style={{ color: '#16a34a' }} />
                      {payment.amount.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      {payment.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                      {new Date(payment.requestDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    {payment.approvedDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.approvedDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>
                    {payment.paidDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" style={{ color: '#9ca3af' }} />
                        {new Date(payment.paidDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: '#374151' }}>{payment.paymentMethod}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/payments/${payment.id}`)}
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
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            onMouseEnter={() => setHoveredApproveButtonIndex(index)}
                            onMouseLeave={() => setHoveredApproveButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredApproveButtonIndex === index ? '#15803d' : '#16a34a',
                              backgroundColor: hoveredApproveButtonIndex === index ? '#dcfce7' : 'transparent'
                            }}
                            title="Duyệt"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            onMouseEnter={() => setHoveredRejectButtonIndex(index)}
                            onMouseLeave={() => setHoveredRejectButtonIndex(null)}
                            className="p-1 rounded transition-colors"
                            style={{
                              color: hoveredRejectButtonIndex === index ? '#991b1b' : '#dc2626',
                              backgroundColor: hoveredRejectButtonIndex === index ? '#fee2e2' : 'transparent'
                            }}
                            title="Từ chối"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {payment.status === 'approved' && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          onMouseEnter={() => setHoveredMarkAsPaidButtonIndex(index)}
                          onMouseLeave={() => setHoveredMarkAsPaidButtonIndex(null)}
                          className="p-1 rounded transition-colors"
                          style={{
                            color: hoveredMarkAsPaidButtonIndex === index ? '#15803d' : '#16a34a',
                            backgroundColor: hoveredMarkAsPaidButtonIndex === index ? '#dcfce7' : 'transparent'
                          }}
                          title="Đánh dấu đã thanh toán"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onMouseEnter={() => setHoveredMoreButtonIndex(index)}
                        onMouseLeave={() => setHoveredMoreButtonIndex(null)}
                        className="p-1 rounded transition-colors"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
