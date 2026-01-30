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
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });

  useEffect(() => {
    loadCompanies();
  }, [currentPage, itemsPerPage, selectedType, selectedStatus, searchQuery]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'id',
        sortOrder: 'DESC'
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedType) {
        params.type = selectedType;
      }

      if (selectedStatus) {
        params.status = selectedStatus === 'active' ? '1' : '0';
      }

      const response = await apiService.getCompanies(params);
      if (response.success && response.data) {
        setCompanies(response.data.companies || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: itemsPerPage,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      alert('Lỗi khi tải danh sách doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa doanh nghiệp "${name}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteCompany(id);
      if (response.success) {
        alert('Xóa doanh nghiệp thành công!');
        loadCompanies();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa doanh nghiệp');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa doanh nghiệp');
    }
  };

  const handleToggleStatus = async (company) => {
    try {
      const response = await apiService.toggleCompanyStatus(company.id);
      if (response.success) {
        alert('Cập nhật trạng thái thành công!');
        loadCompanies();
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadCompanies();
  };


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(companies.map((_, index) => index)));
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filter Section */}
      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3 flex-shrink-0">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã công ty, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
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
          <button
            onClick={loadCompanies}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Làm mới
          </button>
          <button
            onClick={() => navigate('/admin/companies/create')}
            className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded text-xs font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm doanh nghiệp
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Loại:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="Tuyển dụng">Tuyển dụng</option>
              <option value="Bảo vệ">Bảo vệ</option>
              <option value="IT">IT</option>
              <option value="Xây dựng">Xây dựng</option>
              <option value="Thời trang">Thời trang</option>
              <option value="Thiết kế">Thiết kế</option>
              <option value="QA">QA</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-900">Trạng thái:</label>
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
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || loading}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {[...Array(Math.min(7, pagination.totalPages))].map((_, i) => {
            const pageNum = i + 1;
            if (pagination.totalPages > 7) {
              // Show first, last, and pages around current
              if (pageNum === 1 || pageNum === pagination.totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                return <span key={pageNum} className="px-1 text-xs text-gray-400">...</span>;
              }
              return null;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                disabled={loading}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages || loading}
            className="px-1.5 py-1 bg-white border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(pagination.totalPages)}
            disabled={currentPage >= pagination.totalPages || loading}
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
            disabled={loading}
            className="px-2.5 py-1 border border-gray-300 rounded text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-xs text-gray-700 font-semibold">
            {pagination.total} items
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg border border-gray-200 min-h-0 relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            Chưa có doanh nghiệp nào
          </div>
        ) : (
          <div className="overflow-x-auto h-full">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === companies.length && companies.length > 0}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Tên công ty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Mã công ty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Loại</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Số điện thoại</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Địa chỉ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Website</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Số job</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 border-b border-gray-200">Ngày tạo</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-900 border-b border-gray-200">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company, index) => (
                  <tr
                    key={company.id}
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
                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                      >
                        {company.id}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                            {company.name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}`)}
                          className="text-xs font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {company.name || '—'}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs font-medium text-gray-700">{company.companyCode || '—'}</span>
                    </td>
                    <td className="px-3 py-2">
                      {company.type ? (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                          {company.type}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {company.email ? (
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Mail className="w-3 h-3 text-gray-400" />
                          {company.email}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {company.phone ? (
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {company.phone}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {company.address ? (
                        <div className="flex items-center gap-1 text-xs text-gray-700 max-w-[200px] truncate">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{company.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">Website</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/admin/jobs?company=${company.id}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Briefcase className="w-3 h-3" />
                        {company.jobsCount || 0}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleToggleStatus(company)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                          company.status
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {company.status ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {company.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(company.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/companies/${company.id}/edit`)}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id, company.name)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
