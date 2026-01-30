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
import ChatBox from '../../component/Chat/ChatBox';


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
  const [showChatBox, setShowChatBox] = useState(false);
  const [selectedJobApplicationId, setSelectedJobApplicationId] = useState(null);

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
      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên ứng viên, job title, công ty, ID, CTV..."
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
          <button
            onClick={() => navigate('/admin/nominations/create')}
            className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded-lg font-semibold text-xs hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm đơn tiến cử
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
              <option value="pending">Đang chờ</option>
              <option value="interviewed">Đã phỏng vấn</option>
              <option value="accepted">Đã nhận việc</option>
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
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-10">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === nominations.length && nominations.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ứng viên</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Job</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Công ty</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">CTV</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Trạng thái</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ngày tiến cử</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ngày PV</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Phí giới thiệu</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Lương</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-3 py-8 text-center text-xs text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : nominations.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-3 py-8 text-center text-xs text-gray-500">
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

                  return (
                    <tr
                      key={nomination.id}
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
                          onClick={() => navigate(`/admin/nominations/${nomination.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                        >
                          {nomination.id}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                            {(nomination.name || nomination.cv?.fullName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {nomination.cvId ? (
                              <button
                                onClick={() => navigate(`/admin/candidates/${nomination.cvId}`)}
                                className="text-xs font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {nomination.name || nomination.cv?.fullName || '-'}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-gray-900">
                                {nomination.name || '-'}
                              </span>
                            )}
                            {nomination.cv?.code && (
                              <p className="text-[10px] text-gray-500">{nomination.cv.code}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {nomination.jobId ? (
                          <button
                            onClick={() => navigate(`/admin/jobs/${nomination.jobId}`)}
                            className="text-xs font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1"
                          >
                            <Briefcase className="w-3 h-3" />
                            {nomination.job?.title || nomination.job?.jobCode || '-'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-700">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          {nomination.job?.company?.name || nomination.companyName || '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {nomination.collaboratorId ? (
                          <button
                            onClick={() => navigate(`/admin/collaborators/${nomination.collaboratorId}`)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            {nomination.collaborator?.code || nomination.collaborator?.name || '-'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(statusInfo.value)}`}>
                          {getStatusIcon(statusInfo.value)}
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {appliedDate}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {nomination.interviewDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {interviewDate}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-gray-900">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          {nomination.referralFee ? `${nomination.referralFee.toLocaleString('vi-VN')}đ` : '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">{salaryDisplay}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/nominations/${nomination.id}`)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedJobApplicationId(nomination.id);
                              setShowChatBox(true);
                            }}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Gửi tin nhắn"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/nominations/${nomination.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(nomination.id)}
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

      {/* Chat Box */}
      {showChatBox && (
        <ChatBox
          userType="admin"
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

export default AdminNominationsPage;
