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
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Tổng đã thanh toán</p>
              <p className="text-lg font-bold text-green-600">
                {totalPaid.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {paymentRequests.filter(p => p.status === 'paid').length} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Chờ duyệt</p>
              <p className="text-lg font-bold text-yellow-600">
                {totalPending.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {totalPendingCount} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Đã duyệt (chờ thanh toán)</p>
              <p className="text-lg font-bold text-blue-600">
                {totalApproved.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {totalApprovedCount} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Đã từ chối</p>
              <p className="text-lg font-bold text-red-600">
                {totalRejected.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                {paymentRequests.filter(p => p.status === 'rejected').length} yêu cầu
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ứng viên, CTV, job title, công ty, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-semibold text-xs hover:bg-gray-200 transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Xuất Excel
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <label className="text-xs font-semibold text-gray-900">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="paid">Đã thanh toán</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Từ ngày:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Đến ngày:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            const pageNum = i + 1;
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
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredPayments.length && filteredPayments.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Mã yêu cầu</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">CTV</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ứng viên</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Job</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Công ty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Số tiền</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Trạng thái</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ngày yêu cầu</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ngày duyệt</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ngày thanh toán</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Phương thức</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50 transition-colors"
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
                      onClick={() => navigate(`/admin/payments/${payment.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                    >
                      {payment.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/nominations/${payment.applicationId}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      {payment.requestId}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/collaborators/${payment.collaboratorId}`)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Users className="w-3 h-3" />
                      {payment.collaboratorName}
                    </button>
                    <p className="text-[10px] text-gray-500">{payment.collaboratorId}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                        {payment.candidateName.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/admin/candidates/${payment.candidateId}`)}
                          className="text-xs font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {payment.candidateName}
                        </button>
                        <p className="text-[10px] text-gray-500">{payment.candidateId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => navigate(`/admin/jobs/${payment.jobId}`)}
                      className="text-xs font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3" />
                      {payment.jobTitle}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs text-gray-700">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      {payment.companyName}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      {payment.amount.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.statusLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(payment.requestDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {payment.approvedDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(payment.approvedDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {payment.paidDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(payment.paidDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">{payment.paymentMethod}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/payments/${payment.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {payment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Duyệt"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Từ chối"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {payment.status === 'approved' && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Đánh dấu đã thanh toán"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors">
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
