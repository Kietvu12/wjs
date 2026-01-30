import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import apiService from '../../services/api';


const AgentJobsPageSession2 = ({ jobs: propJobs, filters, showAllJobs = false, enablePagination = false }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const limit = showAllJobs ? 10 : 3; // Show 10 jobs per page if showAllJobs, otherwise 3

  // Load initial jobs on mount (only if no propJobs and no filters)
  useEffect(() => {
    if (propJobs === undefined || propJobs === null) {
      // Only load if no special filters from URL
      if (!filters || (!filters.campaignId && !filters.pickupId && !filters.postId && !filters.isHot && !filters.isPinned)) {
        loadInitialJobs(1);
      }
    }
  }, []);

  // Update jobs when propJobs changes (from search)
  useEffect(() => {
    if (propJobs !== undefined && propJobs !== null) {
      // Use jobs from props (from search) - can be empty array
      if (showAllJobs) {
        setJobs(propJobs);
        // Reset to page 1 when new search results come in
        setCurrentPage(1);
      } else {
        setJobs(propJobs.slice(0, 3)); // Only show first 3 jobs
      }
    }
  }, [propJobs, showAllJobs]);

  // Load jobs when filters change or page changes (only if showAllJobs and enablePagination and no propJobs from search)
  useEffect(() => {
    if (showAllJobs && enablePagination && propJobs === null) {
      // Reset to page 1 when filters change
      if (filters && (filters.campaignId || filters.pickupId || filters.postId || filters.isHot || filters.isPinned)) {
        setCurrentPage(1);
        loadInitialJobs(1);
      } else if (!filters || (!filters.campaignId && !filters.pickupId && !filters.postId && !filters.isHot && !filters.isPinned)) {
        // Load with current page if no special filters
        loadInitialJobs(currentPage);
      }
    }
  }, [currentPage, filters]);

  const loadInitialJobs = async (page = 1) => {
    try {
      setLoading(true);
      // Build params with current filters if available
      const params = { page, limit };
      
      if (filters) {
        // Apply filters from search
        if (filters.keyword && filters.keyword.trim()) {
          params.search = filters.keyword.trim();
        }
        // Category filter - ưu tiên jobTypeIds (Loại công việc), sau đó fieldIds (Lĩnh vực), cuối cùng businessTypeIds (Loại hình kinh doanh)
        if (filters.jobTypeIds && filters.jobTypeIds.length > 0) {
          params.categoryId = parseInt(filters.jobTypeIds[0]);
        } else if (filters.fieldIds && filters.fieldIds.length > 0) {
          params.categoryId = parseInt(filters.fieldIds[0]);
        } else if (filters.businessTypeIds && filters.businessTypeIds.length > 0) {
          params.categoryId = parseInt(filters.businessTypeIds[0]);
        }
        // Support old filter names for backward compatibility
        if (!params.categoryId) {
          if (filters.jobChildIds && filters.jobChildIds.length > 0) {
            params.categoryId = parseInt(filters.jobChildIds[0]);
          } else if (filters.jobParentIds && filters.jobParentIds.length > 0) {
            params.categoryId = parseInt(filters.jobParentIds[0]);
          }
        }
        if (filters.locations && filters.locations.length > 0) {
          params.location = filters.locations[0];
        }
        if (filters.salaryMin) {
          params.minSalary = String(filters.salaryMin);
        }
        if (filters.salaryMax) {
          params.maxSalary = String(filters.salaryMax);
        }
        // Support campaign, article, event, pickup, post filters
        if (filters.campaignId) {
          params.campaignId = filters.campaignId;
        }
        if (filters.articleId) {
          params.articleId = filters.articleId;
        }
        if (filters.eventId) {
          params.eventId = filters.eventId;
        }
        if (filters.pickupId) {
          params.pickupId = filters.pickupId;
        }
        if (filters.postId) {
          params.postId = filters.postId;
        }
        if (filters.isHot) {
          params.isHot = true;
        }
        if (filters.isPinned) {
          params.isPinned = true;
        }
      }
      
      params.sortBy = 'created_at';
      params.sortOrder = 'DESC';
      
      const response = await apiService.getCTVJobs(params);
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
          setTotalJobs(response.data.pagination.total || 0);
          setCurrentPage(response.data.pagination.page || 1);
        }
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Mock data for job listings (removed - no longer used)
const mockJobs = [
  {
    id: '00304192-9fcd0',
    tags: [
      { label: 'JobShare Selection', color: 'green' },
      { label: 'Ứng tuyển trực tiếp', color: 'orange' },
      { label: 'Nhân viên chính thức (hợp đồng không thời hạn)', color: 'blue' },
    ],
    title: '【Tuyển dụng toàn quốc!】Chuyển việc OK ở bất kỳ đâu tại Nhật Bản. Bắt đầu từ số không trong quản lý thi công xây dựng ~ Chào đón người chưa có kinh nghiệm ● Đào tạo & hỗ trợ chu đáo để bắt đầu yên tâm. Phụ nữ cũng đang hoạt động tích cực ~',
    category: 'Kỹ thuật xây dựng & dân dụng / Quản lý thi công & Giám sát công trình【Xây dựng】',
    company: 'Công ty TNHH Nikken Total Sourcing',
    keywords: [
      'Chấp nhận chưa có kinh nghiệm nghề',
      'Chấp nhận chưa có kinh nghiệm ngành',
      'Chấp nhận hoàn toàn chưa có kinh nghiệm',
      'Đăng tải trên phương tiện truyền thông OK (công khai tên công ty)',
      'Tuyển dụng qua headhunter OK (công khai tên công ty)',
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
  },
  {
    id: '00180228-54b9a',
    tags: [
      { label: 'JobShare Selection', color: 'green' },
      { label: 'Ứng tuyển trực tiếp', color: 'orange' },
      { label: 'Nhân viên chính thức (hợp đồng không thời hạn)', color: 'blue' },
    ],
    title: 'Thực hiện tuyển chọn 1 ngày! Tuyển chọn tốc độ cao Nhân viên bảo vệ quen thuộc với "Bạn có đang SECOM không?"! (Beat Engineer) ◆ Lương trung bình 621 triệu yên/năm / Thưởng tối đa 198 triệu yên / Có nhà ở công ty & ký túc xá độc thân / OK nghỉ 10 ngày liên tiếp',
    category: 'Công nhân kỹ năng, Thiết bị, Giao thông & Vận tải / Bảo vệ, Bảo vệ',
    company: 'Công ty TNHH SECOM',
    keywords: [
      'Chấp nhận chưa có kinh nghiệm nghề',
      'Chấp nhận chưa có kinh nghiệm ngành',
      'Chấp nhận hoàn toàn chưa có kinh nghiệm',
      'Đăng tải trên phương tiện truyền thông OK (công khai tên công ty)',
      'Tuyển dụng qua headhunter OK (công khai tên công ty)',
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
  },
];

  const translations = {
    vi: {
      headerTitle: 'JobShare Workstation',
      viewSkilledJobs: 'Xem việc làm kỹ năng quốc tế',
      viewNoExpJobs: 'Xem việc làm chấp nhận chưa có kinh nghiệm',
      companyInfo: 'Hội thảo thông tin công ty tuyển dụng',
      jobId: 'Mã việc làm',
      jobCategory: 'Phân loại nghề nghiệp',
      hiringCompany: 'Công ty tuyển dụng',
      companyCommission: 'Công ty bạn',
      fullAmount: 'Toàn bộ',
      sameDayPayment: 'Có thể thanh toán trong ngày',
      viewMore: 'Xem thêm JobShare Workstation khác',
    },
    en: {
      headerTitle: 'JobShare Workstation',
      viewSkilledJobs: 'View skilled foreign worker jobs',
      viewNoExpJobs: 'View jobs OK for no experience',
      companyInfo: 'Company information session for hiring companies',
      jobId: 'Job ID',
      jobCategory: 'Job Category',
      hiringCompany: 'Hiring Company',
      companyCommission: 'Your company',
      fullAmount: 'Full amount',
      sameDayPayment: 'Same-day deposit OK',
      viewMore: 'View other JobShare Workstation',
    },
    ja: {
      headerTitle: 'JobShare Workstation',
      viewSkilledJobs: '技人国求人を見る',
      viewNoExpJobs: '未経験OK求人を見る',
      companyInfo: '採用企業会社説明会',
      jobId: '求人ID',
      jobCategory: '職種分類',
      hiringCompany: '採用企業',
      companyCommission: '貴社',
      fullAmount: '全額',
      sameDayPayment: '即日入金OK',
      viewMore: '他のJobShare Workstationを見る',
    },
  };

  const t = translations[language] || translations.vi;

  const getTagColorClass = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[color] || colors.green;
  };

  // Strip HTML tags and format text
  const stripHtml = (html) => {
    if (!html) return '';
    
    // Check if it's already plain text
    if (!html.includes('<')) return html;
    
    try {
      // Create a temporary div element
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      
      // Convert <ul><li> and <ol><li> to bullet points
      const lists = tmp.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        const bulletPoints = Array.from(items).map(li => {
          const text = li.textContent.trim();
          return text ? `• ${text}` : '';
        }).filter(Boolean).join('\n');
        
        if (bulletPoints) {
          const textNode = document.createTextNode(bulletPoints);
          if (list.parentNode) {
            list.parentNode.replaceChild(textNode, list);
          }
        } else {
          list.remove();
        }
      });
      
      // Convert <br> to newlines
      const breaks = tmp.querySelectorAll('br');
      breaks.forEach(br => {
        br.replaceWith('\n');
      });
      
      // Convert <p> to newlines
      const paragraphs = tmp.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
          p.replaceWith(`\n${text}\n`);
        } else {
          p.remove();
        }
      });
      
      // Get text content
      let text = tmp.textContent || tmp.innerText || '';
      
      // Clean up extra whitespace and newlines
      text = text
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
        .replace(/[ \t]+/g, ' ') // Multiple spaces to single space
        .trim();
      
      return text;
    } catch (error) {
      console.error('Error stripping HTML:', error);
      // Fallback: simple regex to remove HTML tags
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  };

  // Format job data from API
  const formatJob = (job) => {
    const tags = [];
    if (job.isHot) {
      tags.push({ label: 'JobShare Selection', color: 'green' });
    }
    // Check if job belongs to a campaign (from jobCampaigns)
    const isInCampaign = job.jobCampaigns && job.jobCampaigns.length > 0;
    // Priority: Campaign tag should be shown if job is in campaign
    // Only show "Ứng tuyển trực tiếp" if job is pinned but NOT in campaign
    if (isInCampaign) {
      tags.push({ label: 'Campaign', color: 'blue' });
    } else if (job.isPinned) {
      tags.push({ label: 'Ứng tuyển trực tiếp', color: 'orange' });
    }

    // Get commission info from jobValues
    const jobValues = job.jobValues || job.profits || [];
    let commissionText = 'Liên hệ';
    
    if (jobValues.length > 0) {
      const firstJobValue = jobValues[0];
      const commissionType = job.jobCommissionType || 'fixed';
      const value = firstJobValue.value;
      
      if (value !== null && value !== undefined) {
        if (commissionType === 'fixed') {
          const amount = parseInt(value) || 0;
          if (amount > 0) {
            commissionText = `${amount.toLocaleString('vi-VN')} triệu`;
          }
        } else if (commissionType === 'percent') {
          commissionText = `${value}%`;
        }
      }
    }

    // Get requirements: technique and education
    const requirements = job.requirements || [];
    const techniqueRequirements = requirements
      .filter(req => req.type === 'technique')
      .map(req => stripHtml(req.content || ''));
    const educationRequirements = requirements
      .filter(req => req.type === 'education')
      .map(req => stripHtml(req.content || ''));

    // Get working location details
    const workingLocationDetails = job.workingLocationDetails || [];
    const locationText = workingLocationDetails
      .map(detail => stripHtml(detail.content || ''))
      .filter(Boolean)
      .join(', ') || stripHtml(job.workLocation || '');

    // Get salary range details
    const salaryRangeDetails = job.salaryRangeDetails || [];
    const salaryText = salaryRangeDetails
      .map(detail => stripHtml(detail.content || ''))
      .filter(Boolean)
      .join(', ') || stripHtml(job.estimatedSalary || '');

    return {
      id: String(job.id),
      jobCode: job.jobCode || job.id,
      tags,
      title: job.title || '',
      company: job.company?.name || '',
      techniqueRequirements,
      educationRequirements,
      location: locationText,
      salary: salaryText,
      commission: commissionText,
    };
  };

  const displayJobs = jobs.length > 0 ? jobs.map(formatJob) : [];

  return (
    <div className="w-full h-full flex flex-col py-6">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t.headerTitle}</h1>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium">
            {t.viewSkilledJobs}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium">
            {t.viewNoExpJobs}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium">
            {t.companyInfo}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Job Listings with Scroll */}
      <div className="flex-1 overflow-y-auto pr-2 min-h-0 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-2">Không tìm thấy công việc nào</p>
              <p className="text-gray-400 text-sm">Vui lòng thử lại với bộ lọc khác</p>
            </div>
          </div>
        ) : (
        <div className="space-y-4 sm:space-y-6 pb-20">
            {displayJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/agent/jobs/${job.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Main Content */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  {/* Tags */}
                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getTagColorClass(tag.color)}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Job Title */}
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
                    {job.title}
                  </h2>

                  {/* Company Name */}
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{t.hiringCompany}:</span> {job.company}
                    </div>
                  </div>

                  {/* Yêu cầu tuyển dụng (Technique) */}
                  {job.techniqueRequirements && job.techniqueRequirements.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Yêu cầu tuyển dụng:</div>
                        <div className="text-sm text-gray-700 space-y-1">
                          {job.techniqueRequirements.map((req, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-gray-400 flex-shrink-0">•</span>
                              <span className="whitespace-pre-line">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Học vấn (Education) */}
                  {job.educationRequirements && job.educationRequirements.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Học vấn:</div>
                        <div className="text-sm text-gray-700 space-y-1">
                          {job.educationRequirements.map((req, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-gray-400 flex-shrink-0">•</span>
                              <span className="whitespace-pre-line">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Địa chỉ làm việc */}
                  {job.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Địa chỉ làm việc:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-line">{job.location}</div>
                      </div>
                    </div>
                  )}

                  {/* Range lương */}
                  {job.salary && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Mức lương:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-line">{job.salary}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Commission Section */}
                {job.commission && (
                  <div className="w-full sm:w-48 flex-shrink-0">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-4">
                      <div className="text-xs font-medium text-red-800 mb-2 uppercase tracking-wide">
                        {t.companyCommission || 'Hoa hồng'}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-red-900">
                        {job.commission}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
        
        {/* Footer - Show pagination if showAllJobs, otherwise show viewMore button */}
        {showAllJobs && enablePagination ? (
          <div className="sticky bottom-4 z-10 mt-6">
            <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">
                {t.showing} {jobs.length} {t.of} {totalJobs} {t.jobs}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.previous}
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.next}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="sticky bottom-4 text-center z-10 mt-4">
            <button 
              onClick={() => navigate('/agent/jobs')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-2xl"
            >
              {t.viewMore}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentJobsPageSession2;

