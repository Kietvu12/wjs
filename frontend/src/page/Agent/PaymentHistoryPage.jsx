import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Filter,
  ExternalLink,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Briefcase,
  Building2,
  Download,
} from 'lucide-react';


const PaymentHistoryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
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

  // Map status từ string sang số (cho filter)
  const mapStatusToNumber = (statusString) => {
    const statusMap = {
      'pending': 0,
      'approved': 1,
      'rejected': 2,
      'paid': 3,
    };
    return statusMap[statusString] !== undefined ? statusMap[statusString] : '';
  };

  // Load payments từ API
  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (statusFilter) {
        params.status = mapStatusToNumber(statusFilter);
      }

      if (dateFrom) {
        params.startDate = dateFrom;
      }

      if (dateTo) {
        params.endDate = dateTo;
      }

      const response = await apiService.getPaymentRequests(params);

      if (response.success && response.data) {
        // Map dữ liệu từ API sang format của component
        const mappedPayments = response.data.paymentRequests.map((payment) => {
          const statusInfo = mapStatus(payment.status);
          return {
            id: payment.id,
            requestId: payment.id.toString(), // Sử dụng ID làm requestId
            candidateName: payment.jobApplication?.cv?.fullName || payment.jobApplication?.name || '—',
            candidateId: payment.jobApplication?.cv?.code || '—',
            jobTitle: payment.jobApplication?.job?.title || '—',
            jobId: payment.jobApplication?.jobId,
            companyName: payment.jobApplication?.job?.company?.name || payment.jobApplication?.job?.companyName || '—',
            applicationId: payment.jobApplicationId,
            amount: payment.amount || 0,
            status: statusInfo.key,
            statusLabel: statusInfo.label,
            requestDate: payment.createdAt || payment.created_at,
            approvedDate: payment.approvedAt || payment.approved_at || '—',
            paidDate: payment.status === 3 ? (payment.updatedAt || payment.updated_at || '—') : '—',
            paymentMethod: payment.paymentMethod || payment.payment_method || '—',
            cvId: payment.jobApplication?.cvId || payment.jobApplication?.cv?.id,
            jobSlug: payment.jobApplication?.job?.slug,
          };
        });

        setPayments(mappedPayments);
        setPagination(response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: 1
        });
      } else {
        setError(response.message || 'Không thể tải lịch sử thanh toán');
        setPayments([]);
      }
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(err.message || 'Lỗi khi tải lịch sử thanh toán');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo]);

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;

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
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <AlertCircle className="w-4 h-4" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(payments.map((_, index) => index)));
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
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadPayments();
  };

  const totalAmount = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'approved' || p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ứng viên, job title, công ty, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-bold text-gray-900">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="paid">Đã thanh toán</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-900">Từ ngày:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-900">Đến ngày:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Tổng đã thanh toán</p>
              <p className="text-lg font-bold text-green-600">
                {totalAmount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-xs text-gray-600">Chờ thanh toán</p>
              <p className="text-lg font-bold text-yellow-600">
                {pendingAmount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
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
            let pageNum;
            if (totalPages <= 7) {
              pageNum = i + 1;
            } else {
              if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
            }
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
          <span className="text-sm text-gray-700 font-bold">{totalItems} items</span>
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
                    checked={selectedRows.size === payments.length && payments.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Mã yêu cầu</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ứng viên</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Job</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Công ty</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ngày yêu cầu</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ngày duyệt</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ngày thanh toán</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Phương thức</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 border-b border-gray-200">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy yêu cầu thanh toán nào
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleSelectRow(index)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/agent/payment-history/${payment.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                    >
                      {payment.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/agent/nominations/${payment.applicationId}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      {payment.requestId}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {payment.candidateName.charAt(0)}
                      </div>
                      <div>
                        {payment.cvId ? (
                          <button
                            onClick={() => navigate(`/agent/candidates/${payment.cvId}`)}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {payment.candidateName}
                          </button>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">
                            {payment.candidateName}
                          </span>
                        )}
                        <p className="text-xs text-gray-500">{payment.candidateId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {payment.jobId ? (
                      <button
                        onClick={() => navigate(`/agent/jobs/${payment.jobId}${payment.jobSlug ? `?slug=${payment.jobSlug}` : ''}`)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Briefcase className="w-3 h-3" />
                        {payment.jobTitle}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {payment.jobTitle}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      {payment.companyName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {payment.amount.toLocaleString('vi-VN')}đ
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      {payment.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {payment.requestDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(payment.requestDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {payment.approvedDate && payment.approvedDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(payment.approvedDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {payment.paidDate && payment.paidDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(payment.paidDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{payment.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/agent/payment-history/${payment.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors">
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

export default PaymentHistoryPage;
