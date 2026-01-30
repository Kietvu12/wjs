import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Settings,
  Info,
  ExternalLink,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Target,
  DollarSign,
  Eye,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('OR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  useEffect(() => {
    loadCampaigns();
  }, [currentPage, itemsPerPage, selectedStatus, dateFrom, dateTo]);

  const loadCampaigns = async () => {
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

      // Map status từ frontend labels sang backend numbers
      if (selectedStatus) {
        const statusMap = {
          'active': 1,
          'upcoming': 0, // Có thể là 0 hoặc cần check date
          'ended': 2,
          'inactive': 0
        };
        params.status = statusMap[selectedStatus] !== undefined ? statusMap[selectedStatus] : selectedStatus;
      }

      if (dateFrom) {
        params.startDateFrom = dateFrom;
      }
      if (dateTo) {
        params.endDateTo = dateTo;
      }

      const response = await apiService.getAdminCampaigns(params);
      if (response.success && response.data) {
        setCampaigns(response.data.campaigns || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine status from campaign data
  const getCampaignStatus = (campaign) => {
    if (campaign.status === 1) return 'active';
    if (campaign.status === 2) return 'ended';
    const now = new Date();
    const startDate = new Date(campaign.startDate || campaign.start_date);
    const endDate = new Date(campaign.endDate || campaign.end_date);
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'ended';
    if (campaign.status === 0) return 'inactive';
    return 'active';
  };

  // Mock data for campaigns (fallback)
  const sampleCampaigns = [
    {
      id: 'CAMP001',
      name: 'Chiến dịch Tuyển dụng Mùa Xuân 2025',
      description: 'Tuyển dụng hàng loạt các vị trí IT, xây dựng, và dịch vụ cho mùa xuân 2025',
      startDate: '2025/01/15',
      endDate: '2025/03/31',
      status: 'active',
      budget: 50000000,
      jobsCount: 45,
      views: 12500,
      applications: 320,
      nominations: 85,
      createdAt: '2024/12/20',
      updatedAt: '2025/01/10',
    },
    {
      id: 'CAMP002',
      name: 'Chiến dịch Tuyển dụng IT Specialist',
      description: 'Tuyển dụng chuyên sâu các vị trí IT, Software Engineer, DevOps',
      startDate: '2025/02/01',
      endDate: '2025/04/30',
      status: 'upcoming',
      budget: 30000000,
      jobsCount: 25,
      views: 0,
      applications: 0,
      nominations: 0,
      createdAt: '2025/01/05',
      updatedAt: '2025/01/08',
    },
    {
      id: 'CAMP003',
      name: 'Chiến dịch Tuyển dụng Xây dựng Q1 2025',
      description: 'Tuyển dụng các vị trí kỹ sư xây dựng, quản lý dự án',
      startDate: '2024/12/01',
      endDate: '2025/02/28',
      status: 'active',
      budget: 40000000,
      jobsCount: 30,
      views: 9800,
      applications: 245,
      nominations: 62,
      createdAt: '2024/11/15',
      updatedAt: '2025/01/12',
    },
    {
      id: 'CAMP004',
      name: 'Chiến dịch Tuyển dụng Dịch vụ Khách hàng',
      description: 'Tuyển dụng nhân viên dịch vụ khách hàng, tư vấn viên',
      startDate: '2024/10/01',
      endDate: '2024/12/31',
      status: 'ended',
      budget: 20000000,
      jobsCount: 18,
      views: 15200,
      applications: 410,
      nominations: 95,
      createdAt: '2024/09/20',
      updatedAt: '2025/01/01',
    },
    {
      id: 'CAMP005',
      name: 'Chiến dịch Tuyển dụng Marketing & Sales',
      description: 'Tuyển dụng các vị trí Marketing Manager, Sales Executive',
      startDate: '2025/01/20',
      endDate: '2025/05/31',
      status: 'active',
      budget: 35000000,
      jobsCount: 22,
      views: 5600,
      applications: 128,
      nominations: 35,
      createdAt: '2024/12/28',
      updatedAt: '2025/01/15',
    },
    {
      id: 'CAMP006',
      name: 'Chiến dịch Tuyển dụng Bảo vệ & An ninh',
      description: 'Tuyển dụng nhân viên bảo vệ, an ninh cho các tòa nhà và khu vực',
      startDate: '2025/03/01',
      endDate: '2025/06/30',
      status: 'upcoming',
      budget: 25000000,
      jobsCount: 15,
      views: 0,
      applications: 0,
      nominations: 0,
      createdAt: '2025/01/10',
      updatedAt: '2025/01/10',
    },
    {
      id: 'CAMP007',
      name: 'Chiến dịch Tuyển dụng Thời trang & Retail',
      description: 'Tuyển dụng nhân viên bán hàng, quản lý cửa hàng thời trang',
      startDate: '2024/11/01',
      endDate: '2025/01/31',
      status: 'active',
      budget: 18000000,
      jobsCount: 12,
      views: 7200,
      applications: 185,
      nominations: 42,
      createdAt: '2024/10/15',
      updatedAt: '2025/01/14',
    },
    {
      id: 'CAMP008',
      name: 'Chiến dịch Tuyển dụng Healthcare',
      description: 'Tuyển dụng y tá, điều dưỡng, nhân viên y tế',
      startDate: '2025/02/15',
      endDate: '2025/08/31',
      status: 'upcoming',
      budget: 45000000,
      jobsCount: 35,
      views: 0,
      applications: 0,
      nominations: 0,
      createdAt: '2025/01/12',
      updatedAt: '2025/01/12',
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(campaigns.map((_, index) => index)));
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
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    setSearchMode('OR');
    setCurrentPage(1);
    loadCampaigns();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCampaigns();
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa chiến dịch ${id}?`)) {
      try {
        const response = await apiService.deleteAdminCampaign(id);
        if (response.success) {
          alert('Xóa chiến dịch thành công!');
          loadCampaigns();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi xóa chiến dịch');
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa chiến dịch');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        label: 'Đang hoạt động',
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
      },
      upcoming: {
        label: 'Sắp diễn ra',
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Clock,
      },
      ended: {
        label: 'Đã kết thúc',
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: XCircle,
      },
      inactive: {
        label: 'Ngừng hoạt động',
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
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
              placeholder="ID, tên chiến dịch, mô tả"
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
          <button className="text-gray-600 hover:text-gray-800 p-1.5">
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/admin/campaigns/create')}
            className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded text-xs font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm chiến dịch
          </button>
          <button className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900 transition-colors flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Cài đặt
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Trạng thái:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ended">Đã kết thúc</option>
              <option value="inactive">Ngừng hoạt động</option>
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
                    checked={selectedRows.size === campaigns.length && campaigns.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200 w-[110px]">
                  ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200 w-[220px]">
                  Tên chiến dịch
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200 w-[260px]">
                  Mô tả
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[150px]">
                  Thời gian
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 border-b border-gray-200 w-[140px]">
                  Ngân sách
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[90px]">
                  Số job
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[90px]">
                  Lượt xem
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[90px]">
                  Ứng tuyển
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[90px]">
                  Tiến cử
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[130px]">
                  Trạng thái
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-[110px]">
                  Ngày tạo
                </th>
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
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-3 py-8 text-center text-xs text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign, index) => {
                  const campaignStatus = getCampaignStatus(campaign);
                  const startDate = campaign.startDate || campaign.start_date 
                    ? new Date(campaign.startDate || campaign.start_date).toLocaleDateString('vi-VN')
                    : '—';
                  const endDate = campaign.endDate || campaign.end_date 
                    ? new Date(campaign.endDate || campaign.end_date).toLocaleDateString('vi-VN')
                    : '—';
                  const createdAt = campaign.createdAt || campaign.created_at
                    ? new Date(campaign.createdAt || campaign.created_at).toLocaleDateString('vi-VN')
                    : '—';
                  
                  return (
                <tr
                  key={campaign.id}
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
                      onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                    >
                      {campaign.id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                        <Target className="w-4 h-4" />
                      </div>
                      <button
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                        className="text-xs font-semibold text-gray-900 hover:text-blue-600 max-w-[200px] truncate"
                      >
                        {campaign.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs text-gray-700 max-w-[260px] truncate block">
                      {campaign.description}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="inline-flex items-center justify-center gap-1 text-xs text-gray-700">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>
                        {startDate} ~ {endDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center justify-end gap-1 text-xs text-gray-700">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      <span className="font-semibold">—</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => navigate(`/admin/jobs?campaign=${campaign.id}`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3" />
                      {campaign.jobCampaigns?.length || 0}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="inline-flex items-center justify-center gap-1 text-xs text-gray-700">
                      <Eye className="w-3 h-3 text-gray-400" />
                      {campaign.viewsCount || 0}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="inline-flex items-center justify-center gap-1 text-xs text-gray-700">
                      <Users className="w-3 h-3 text-gray-400" />
                      {campaign.applicationsCount || 0}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="inline-flex items-center justify-center gap-1 text-xs text-gray-700">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      {campaign.nominationsCount || 0}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {getStatusBadge(campaignStatus)}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-700">
                    <div className="inline-flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {createdAt}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}/edit`)}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
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
    </div>
  );
};

export default CampaignsPage;
