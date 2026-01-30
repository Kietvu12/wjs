import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { getJobApplicationStatus } from '../../utils/jobApplicationStatus';
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
  Briefcase,
  User,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import ChatBox from '../../component/Chat/ChatBox';


const NominationsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [showChatBox, setShowChatBox] = useState(false);
  const [selectedJobApplicationId, setSelectedJobApplicationId] = useState(null);

  // Map status từ số sang object (sử dụng utility function)
  const mapStatus = (status) => {
    const statusInfo = getJobApplicationStatus(status);
    // Map category to simple value for filter compatibility
    let key = 'pending';
    if (statusInfo.category === 'success' || status === 8 || status === 11) {
      key = 'accepted';
    } else if (statusInfo.category === 'rejected' || statusInfo.category === 'cancelled') {
      key = 'rejected';
    } else if (statusInfo.category === 'interview') {
      key = 'interviewed';
    } else if (statusInfo.category === 'processing') {
      key = 'pending';
    }
    return { key, label: statusInfo.label, color: statusInfo.color };
  };

  // Map status từ string sang số (cho filter) - giữ nguyên để tương thích với filter hiện tại
  const mapStatusToNumber = (statusString) => {
    // Filter vẫn dùng pending/interviewed/accepted/rejected
    // Nhưng backend sẽ nhận status number thực tế (1-17)
    // Tạm thời giữ nguyên logic cũ, có thể cải thiện sau
    const statusMap = {
      'pending': '', // Không filter, lấy tất cả
      'interviewed': '', // Không filter, lấy tất cả
      'accepted': '', // Không filter, lấy tất cả
      'rejected': '', // Không filter, lấy tất cả
    };
    return statusMap[statusString] !== undefined ? statusMap[statusString] : '';
  };

  // Load nominations từ API
  const loadNominations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'applied_at',
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

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiService.getJobApplications(params);

      if (response.success && response.data) {
        // Map dữ liệu từ API sang format của component
        const mappedNominations = (response.data.jobApplications || []).map((app) => {
          const statusInfo = mapStatus(app.status);
          return {
            id: app.id,
            candidateName: app.name || app.cv?.name || '—',
            candidateId: app.cv?.code || app.cvCode || '—',
            jobTitle: app.job?.title || '—',
            jobId: app.jobId,
            companyName: app.job?.company?.name || '—',
            status: statusInfo.key,
            statusLabel: statusInfo.label,
            statusColor: statusInfo.color, // Thêm statusColor để dùng trong UI
            appliedDate: app.appliedAt || app.applied_at || app.createdAt || app.created_at,
            interviewDate: app.interviewDate || app.interview_date || '—',
            referralFee: app.referralFee || app.referral_fee || 0,
            salary: app.annualSalary 
              ? `${app.annualSalary.toLocaleString('vi-VN')}万円` 
              : app.monthlySalary || app.monthly_salary
                ? `${(app.monthlySalary || app.monthly_salary).toLocaleString('vi-VN')}万円/月` 
                : app.job?.estimatedSalary || '—',
            cvId: app.cv?.id || app.cvId,
            jobSlug: app.job?.slug,
          };
        });

        setNominations(mappedNominations);
        setPagination(response.data.pagination || {
          total: 0,
          page: currentPage,
          limit: itemsPerPage,
          totalPages: 1
        });
      } else {
        setError(response.message || 'Không thể tải danh sách đơn tiến cử');
        setNominations([]);
      }
    } catch (err) {
      console.error('Error loading nominations:', err);
      setError(err.message || 'Lỗi khi tải danh sách đơn tiến cử');
      setNominations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNominations();
  }, [currentPage, itemsPerPage, statusFilter, dateFrom, dateTo]);

  const totalItems = pagination.total;
  const totalPages = pagination.totalPages;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'interviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
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
      case 'interviewed':
        return <AlertCircle className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadNominations();
  };

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
              <option value="pending">Đang chờ</option>
              <option value="interviewed">Đã phỏng vấn</option>
              <option value="accepted">Đã nhận việc</option>
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
            const pageNum = i + 1;
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
                    checked={selectedRows.size === nominations.length && nominations.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ứng viên</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Job</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Công ty</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ngày tiến cử</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Ngày PV</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Phí giới thiệu</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 border-b border-gray-200">Lương</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 border-b border-gray-200">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : nominations.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy đơn tiến cử nào
                  </td>
                </tr>
              ) : (
                nominations.map((nomination, index) => (
                <tr
                  key={nomination.id}
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
                      onClick={() => navigate(`/agent/nominations/${nomination.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                    >
                      {nomination.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {nomination.candidateName.charAt(0)}
                      </div>
                      <div>
                        {nomination.cvId ? (
                          <button
                            onClick={() => navigate(`/agent/candidates/${nomination.cvId}`)}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {nomination.candidateName}
                          </button>
                        ) : (
                          <span className="text-sm font-semibold text-gray-900">
                            {nomination.candidateName}
                          </span>
                        )}
                        <p className="text-xs text-gray-500">{nomination.candidateId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {nomination.jobId ? (
                      <button
                        onClick={() => navigate(`/agent/jobs/${nomination.jobId}${nomination.jobSlug ? `?slug=${nomination.jobSlug}` : ''}`)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Briefcase className="w-3 h-3" />
                        {nomination.jobTitle}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {nomination.jobTitle}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      {nomination.companyName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${nomination.statusColor || getStatusColor(nomination.status)}`}>
                      {getStatusIcon(nomination.status)}
                      {nomination.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {nomination.appliedDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(nomination.appliedDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {nomination.interviewDate && nomination.interviewDate !== '—' ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(nomination.interviewDate).toLocaleDateString('vi-VN')}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      {nomination.referralFee > 0 ? `${nomination.referralFee.toLocaleString('vi-VN')}đ` : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{nomination.salary}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/agent/nominations/${nomination.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJobApplicationId(nomination.id);
                          setShowChatBox(true);
                        }}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                        title="Gửi tin nhắn"
                      >
                        <Send className="w-4 h-4" />
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

      {/* Chat Box */}
      {showChatBox && (
        <ChatBox
          userType="ctv"
          initialJobApplicationId={selectedJobApplicationId}
          onClose={() => {
            setShowChatBox(false);
            setSelectedJobApplicationId(null);
          }}
        />
      )}
    </div>
  );
};

export default NominationsPage;
