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
  ArrowRight,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Eye,
} from 'lucide-react';


const AdminJobsPage = () => {
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState('OR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadJobs();
    loadCompanies();
  }, [currentPage, itemsPerPage, selectedStatus, selectedCompany]);

  const loadJobs = async () => {
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

      if (selectedStatus) {
        params.status = selectedStatus === 'active' ? 1 : selectedStatus === 'inactive' ? 0 : selectedStatus;
      }

      if (selectedCompany) {
        params.companyId = selectedCompany;
      }

      const response = await apiService.getAdminJobs(params);
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
        setPagination(response.data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await apiService.getCompanies({ limit: 100 });
      if (response.success && response.data) {
        setCompanies(response.data.companies || []);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  // Mock data for job listings (fallback)
  const sampleJobs = [
    {
      id: '00304192-9fcd0',
      tags: [
        { label: 'JoBins Selection', color: 'green' },
        { label: 'Ứng tuyển trực tiếp', color: 'orange' },
        { label: 'Nhân viên chính thức', color: 'blue' },
      ],
      title: '【Tuyển dụng toàn quốc!】Chuyển việc OK ở bất kỳ đâu tại Nhật Bản. Bắt đầu từ số không trong quản lý thi công xây dựng ~ Chào đón người chưa có kinh nghiệm ● Đào tạo & hỗ trợ chu đáo để bắt đầu yên tâm. Phụ nữ cũng đang hoạt động tích cực ~',
      category: 'Kỹ thuật xây dựng & dân dụng / Quản lý thi công & Giám sát công trình【Xây dựng】',
      company: 'Công ty TNHH Nikken Total Sourcing',
      companyId: 'COMP001',
      keywords: [
        'Chấp nhận chưa có kinh nghiệm nghề',
        'Chấp nhận chưa có kinh nghiệm ngành',
        'Chấp nhận hoàn toàn chưa có kinh nghiệm',
        'Đăng tải trên phương tiện truyền thông OK',
        'Tuyển dụng qua headhunter OK',
        'Nghỉ thứ 7 và Chủ nhật',
        'Có thành tích nghỉ thai sản/nuôi con',
      ],
      details: [
        'Hỗ trợ toàn quốc, quản lý thi công xây dựng cho người chưa có kinh nghiệm, phí giới thiệu 77 triệu yên, đào tạo chu đáo, tuyển gấp bắt đầu giữa tháng 1',
        'Mã việc làm: 00318682-b9948 - Đảm bảo phỏng vấn cho tất cả ứng viên',
        'Tỉnh Mie Yokkaichi / Kỹ sư bảo trì thiết bị bán dẫn / Chấp nhận chưa có kinh nghiệm',
        'Tuyển chọn tốc độ',
      ],
      commission: {
        company: 'Cố định 77 triệu yên',
        full: 'Cố định 77 triệu yên',
        sameDayPayment: true,
      },
      status: 'active',
      views: 1520,
      applications: 45,
      nominations: 12,
      createdAt: '2025/01/10',
      updatedAt: '2025/01/15',
    },
    {
      id: '00180228-54b9a',
      tags: [
        { label: 'JoBins Selection', color: 'green' },
        { label: 'Ứng tuyển trực tiếp', color: 'orange' },
        { label: 'Nhân viên chính thức', color: 'blue' },
      ],
      title: 'Thực hiện tuyển chọn 1 ngày! Tuyển chọn tốc độ cao Nhân viên bảo vệ quen thuộc với "Bạn có đang SECOM không?"! (Beat Engineer) ◆ Lương trung bình 621 triệu yên/năm / Thưởng tối đa 198 triệu yên / Có nhà ở công ty & ký túc xá độc thân / OK nghỉ 10 ngày liên tiếp',
      category: 'Công nhân kỹ năng, Thiết bị, Giao thông & Vận tải / Bảo vệ, Bảo vệ',
      company: 'Công ty TNHH SECOM',
      companyId: 'COMP002',
      keywords: [
        'Chấp nhận chưa có kinh nghiệm nghề',
        'Chấp nhận chưa có kinh nghiệm ngành',
        'Chấp nhận hoàn toàn chưa có kinh nghiệm',
        'Đăng tải trên phương tiện truyền thông OK',
        'Tuyển dụng qua headhunter OK',
        'Có thể sử dụng tiếng Anh',
        'Có chế độ nhà ở công ty / Hỗ trợ tiền thuê nhà',
      ],
      details: [
        'Giới hạn khu vực',
        'Tổ chức hội tuyển chọn 1 ngày',
        'Tuyển chọn tốc độ cao nhanh hơn cả tuyển chọn thông thường',
        'Lịch trình cũng mở vào tháng 1/2026',
      ],
      commission: {
        company: '36% lương lý thuyết hàng năm',
        full: '36% lương lý thuyết hàng năm',
        sameDayPayment: true,
      },
      status: 'active',
      views: 1310,
      applications: 38,
      nominations: 9,
      createdAt: '2025/01/08',
      updatedAt: '2025/01/12',
    },
    {
      id: '00234567-8abcd',
      tags: [
        { label: 'JoBins Selection', color: 'green' },
        { label: 'Ứng tuyển trực tiếp', color: 'orange' },
      ],
      title: 'Software Engineer - React/Node.js Developer cho Startup công nghệ tại Tokyo',
      category: 'IT / Phát triển phần mềm',
      company: 'Tech Startup Japan',
      companyId: 'COMP003',
      keywords: [
        'Chấp nhận chưa có kinh nghiệm nghề',
        'Có thể sử dụng tiếng Anh',
        'Làm việc từ xa OK',
        'Flexible working hours',
      ],
      details: [
        'Tuyển dụng Software Engineer với kinh nghiệm React và Node.js',
        'Làm việc tại Tokyo hoặc remote',
        'Lương cạnh tranh + equity',
        'Môi trường làm việc quốc tế',
      ],
      commission: {
        company: '30% lương lý thuyết hàng năm',
        full: '30% lương lý thuyết hàng năm',
        sameDayPayment: false,
      },
      status: 'active',
      views: 980,
      applications: 22,
      nominations: 5,
      createdAt: '2025/01/05',
      updatedAt: '2025/01/10',
    },
    {
      id: '00345678-9ef01',
      tags: [
        { label: 'JoBins Selection', color: 'green' },
        { label: 'Nhân viên chính thức', color: 'blue' },
      ],
      title: 'Project Manager - Quản lý dự án xây dựng tại Osaka',
      category: 'Xây dựng / Quản lý dự án',
      company: 'Construction Corp Japan',
      companyId: 'COMP004',
      keywords: [
        'Chấp nhận chưa có kinh nghiệm nghề',
        'Đào tạo tại chỗ',
        'Lương thưởng hấp dẫn',
        'Nghỉ thứ 7 và Chủ nhật',
      ],
      details: [
        'Tuyển dụng Project Manager cho dự án xây dựng lớn tại Osaka',
        'Yêu cầu: Kinh nghiệm quản lý dự án, giao tiếp tốt',
        'Lương: 600-800 triệu yên/năm',
        'Bắt đầu làm việc: Tháng 2/2025',
      ],
      commission: {
        company: '40% lương lý thuyết hàng năm',
        full: '40% lương lý thuyết hàng năm',
        sameDayPayment: true,
      },
      status: 'inactive',
      views: 750,
      applications: 15,
      nominations: 3,
      createdAt: '2024/12/20',
      updatedAt: '2025/01/08',
    },
    {
      id: '00456789-0fgh2',
      tags: [
        { label: 'Ứng tuyển trực tiếp', color: 'orange' },
        { label: 'Nhân viên chính thức', color: 'blue' },
      ],
      title: 'Marketing Manager - Quản lý Marketing cho thương hiệu thời trang',
      category: 'Marketing / Quảng cáo',
      company: 'Fashion Brand Japan',
      companyId: 'COMP005',
      keywords: [
        'Chấp nhận chưa có kinh nghiệm nghề',
        'Có thể sử dụng tiếng Anh',
        'Làm việc từ xa OK',
        'Creative environment',
      ],
      details: [
        'Tuyển dụng Marketing Manager cho thương hiệu thời trang quốc tế',
        'Quản lý team marketing 5 người',
        'Lương: 500-700 triệu yên/năm',
        'Làm việc tại Tokyo hoặc remote',
      ],
      commission: {
        company: '35% lương lý thuyết hàng năm',
        full: '35% lương lý thuyết hàng năm',
        sameDayPayment: false,
      },
      status: 'active',
      views: 620,
      applications: 18,
      nominations: 4,
      createdAt: '2025/01/03',
      updatedAt: '2025/01/09',
    },
  ];

  const totalItems = pagination.total || 0;
  const totalPages = pagination.totalPages || 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(jobs.map((_, index) => index)));
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
    setSelectedCompany('');
    setSearchMode('OR');
    setCurrentPage(1);
    loadJobs();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadJobs();
  };

  const getTagColorClass = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[color] || colors.green;
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
              placeholder="ID, tiêu đề job, công ty, category, keywords"
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
            onClick={() => navigate('/admin/jobs/create')}
            className="px-3 py-1.5 bg-yellow-400 text-gray-900 rounded text-xs font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm job
          </button>
          <button className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900 transition-colors flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Cài đặt
          </button>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-3 flex-wrap">
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
            <label className="text-xs font-semibold text-gray-900">Công ty</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
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

      {/* Job Listings */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">Không có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {jobs.map((job, index) => {
              const statusLabel = job.status === 1 ? 'active' : job.status === 0 ? 'draft' : 'inactive';
              const createdAt = job.createdAt 
                ? new Date(job.createdAt).toLocaleDateString('vi-VN')
                : '-';
              const updatedAt = job.updatedAt 
                ? new Date(job.updatedAt).toLocaleDateString('vi-VN')
                : '-';
              
              // Build tags from job data
              const jobTags = [];
              if (job.isHot) jobTags.push({ label: 'Hot', color: 'orange' });
              if (job.isPinned) jobTags.push({ label: 'Pinned', color: 'blue' });
              if (job.status === 1) jobTags.push({ label: 'Published', color: 'green' });
              
              // Build commission info from profits
              // Cấu trúc: job_setting_profits có type (1: Phí cố định, 2: Phí %), setting_type (1: JLPT, 2: Experience, 3: Khác)
              // settings là JSON array chứa các mức phí theo điều kiện
              const profits = job.profits || [];
              let commissionText = job.referralAmount ? `${job.referralAmount.toLocaleString('vi-VN')} VND` : '—';
              let sameDayPayment = job.feeReference === 1;
              
              if (profits.length > 0) {
                // Xử lý tất cả các profit records
                profits.forEach((profit) => {
                  // Cập nhật sameDayPayment nếu có
                  if (profit.sameDayPayment) {
                    sameDayPayment = true;
                  }
                  
                  // Parse settings - có thể là array hoặc string JSON
                  let settingsArray = [];
                  if (Array.isArray(profit.settings)) {
                    settingsArray = profit.settings;
                  } else if (typeof profit.settings === 'string') {
                    try {
                      settingsArray = JSON.parse(profit.settings);
                    } catch (e) {
                      settingsArray = [];
                    }
                  } else if (typeof profit.settings === 'object' && profit.settings !== null) {
                    // Nếu là object, chuyển thành array
                    settingsArray = Object.values(profit.settings);
                  }
                  
                  if (settingsArray.length === 0) return;
                  
                  // Chỉ cập nhật commissionText nếu chưa có giá trị từ profits
                  if (commissionText === (job.referralAmount ? `${job.referralAmount.toLocaleString('vi-VN')} VND` : '—')) {
                    // Xử lý theo setting_type
                    const settingType = profit.settingType || profit.setting_type;
                    
                    if (settingType === 1) {
                      // JLPT-based: settings array có 12 phần tử
                      // Tìm mức phí đầu tiên khác 0
                      for (let i = 0; i < settingsArray.length; i++) {
                        const value = settingsArray[i];
                        const amount = parseFloat(value) || 0;
                        if (amount > 0) {
                          if (profit.type === 1) {
                            commissionText = `${amount.toLocaleString('vi-VN')} yên`;
                          } else if (profit.type === 2) {
                            commissionText = `${amount}%`;
                          }
                          break;
                        }
                      }
                    } else if (settingType === 2) {
                      // Experience-based: settings array có 7 phần tử
                      // Index 3-4: Dưới 3 năm kinh nghiệm
                      // Index 5-6: Trên 3 năm kinh nghiệm
                      for (let i = 3; i < settingsArray.length; i++) {
                        const value = settingsArray[i];
                        const amount = parseFloat(value) || 0;
                        if (amount > 0) {
                          if (profit.type === 1) {
                            commissionText = `${amount.toLocaleString('vi-VN')} yên`;
                          } else if (profit.type === 2) {
                            commissionText = `${amount}%`;
                          }
                          break;
                        }
                      }
                    } else {
                      // setting_type = 3 hoặc không có: áp dụng chung, không có điều kiện
                      const firstValue = settingsArray[0];
                      if (firstValue !== null) {
                        const amount = parseFloat(firstValue) || 0;
                        if (amount > 0) {
                          if (profit.type === 1) {
                            commissionText = `${amount.toLocaleString('vi-VN')} yên`;
                          } else if (profit.type === 2) {
                            commissionText = `${amount}%`;
                          }
                        }
                      }
                    }
                  }
                });
              }
              
              const commission = {
                company: commissionText,
                full: commissionText,
                sameDayPayment: sameDayPayment
              };
              
              return (
                <div
                  key={job.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-3 min-w-0">
                      {/* Job ID and Status */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Mã việc làm:</span> {job.jobCode || job.id}
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={statusLabel}
                            className={`px-2 py-1 rounded text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                              statusLabel === 'active'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Published</option>
                            <option value="inactive">Closed</option>
                          </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/jobs/${job.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/jobs/${job.id}/edit`);
                        }}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement delete
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {jobTags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTagColorClass(tag.color)}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>

                      {/* Job Title */}
                      <h2 
                        className="text-sm font-semibold text-gray-900 leading-snug cursor-pointer hover:text-blue-600"
                        onClick={() => navigate(`/admin/jobs/${job.id}`)}
                      >
                        {job.title}
                      </h2>

                      {/* Job Category */}
                      <div className="flex items-start gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Phân loại:</span> {job.category?.name || '-'}
                        </div>
                      </div>

                      {/* Hiring Company */}
                      <div className="flex items-start gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Công ty:</span>{' '}
                          {job.companyId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/companies/${job.companyId}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {job.company?.name || job.companyName}
                            </button>
                          ) : (
                            <span>{job.companyName || '-'}</span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{job.viewsCount || 0} lượt xem</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{job.statistics?.totalApplications || 0} ứng tuyển</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{job.statistics?.nyushaCount || 0} nyusha</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Tạo: {createdAt}</span>
                        </div>
                      </div>

                      {/* Description preview */}
                      {job.description && (
                        <div className="text-xs text-gray-700 line-clamp-2">
                          {job.description.substring(0, 200)}...
                        </div>
                      )}
                    </div>

                    {/* Commission Section */}
                    <div className="w-44 flex-shrink-0 space-y-2">
                      {/* Company Commission */}
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                        <div className="text-[10px] font-medium text-red-800 mb-1">
                          Công ty bạn
                        </div>
                        <div className="text-sm font-bold text-red-900">
                          {commission.company}
                        </div>
                      </div>

                      {/* Full Amount */}
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
                        <div className="text-[10px] font-medium text-blue-800 mb-1">
                          Toàn bộ
                        </div>
                        <div className="text-sm font-bold text-blue-900">
                          {commission.full}
                        </div>
                        {commission.sameDayPayment && (
                          <div className="mt-1.5 text-[10px] text-blue-700 font-medium">
                            Có thể thanh toán trong ngày
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && jobs.length > 0 && currentPage < totalPages && (
          <div className="text-center py-4">
            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold shadow-lg flex items-center gap-2 mx-auto"
            >
              Xem thêm job
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;
