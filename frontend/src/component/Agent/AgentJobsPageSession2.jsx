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
  Download,
  Heart,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import apiService from '../../services/api';


const AgentJobsPageSession2 = ({ jobs: propJobs, filters, showAllJobs = false, enablePagination = false, useAdminAPI = false }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [ctvProfile, setCtvProfile] = useState(null);
  const limit = showAllJobs ? 10 : 3; // Show 10 jobs per page if showAllJobs, otherwise 3

  // Load CTV profile to get rank level (only for CTV users)
  useEffect(() => {
    if (!useAdminAPI) {
      const loadCTVProfile = async () => {
        try {
          const response = await apiService.getCTVProfile();
          if (response.success && response.data) {
            setCtvProfile(response.data.collaborator || response.data);
          }
        } catch (error) {
          console.error('Error loading CTV profile:', error);
        }
      };
      loadCTVProfile();
    }
  }, [useAdminAPI]);

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
      
      // Use getAdminJobs for admin users, getCTVJobs for CTV users
      const response = useAdminAPI 
        ? await apiService.getAdminJobs(params)
        : await apiService.getCTVJobs(params);
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
      companyCommission: 'Có thể nhận',
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

    // Helper function to parse number from string with thousand separators
    // Salary range can be in different formats:
    // - "3.000.000" = 3,000,000 base units = 3 million (7 digits)
    // - "343.800.000" = 343,800,000 base units = 343.8 million (9 digits)
    // - "343.800" = 343.8 million (already in millions, 6 digits with separator)
    // - "3" = 3 million (already in millions, 1 digit)
    const parseNumber = (str) => {
      if (!str) return 0;
      const originalStr = String(str);
      // Remove all dots and commas (thousand separators), then parse
      const cleaned = originalStr.replace(/[.,]/g, '');
      const num = parseFloat(cleaned) || 0;
      
      // Count digits to determine the scale
      const digitCount = cleaned.replace(/[^0-9]/g, '').length;
      const hasSeparators = /[.,]/.test(originalStr);
      
      // If number has 7+ digits, it's definitely in base units (yen/VND)
      // Convert to millions: 3,000,000 -> 3 million
      if (digitCount >= 7) {
        return num / 1000000;
      }
      // If number has 4-6 digits with separators, it could be:
      // - "3.000" = 3,000 (thousands) -> 3 million if it's actually 3,000,000
      // - "343.800" = 343.8 million (already in millions with decimal separator)
      // We need to check: if it has a pattern like "343.800" (digits.digits), treat as decimal
      else if (digitCount >= 4 && hasSeparators) {
        // Check if it looks like a decimal in millions (e.g., "343.800" = 343.8)
        // Pattern: digits.digits where the part after dot is 3 digits (thousand separator in decimal)
        const decimalPattern = /^(\d+)\.(\d{3})$/;
        if (decimalPattern.test(originalStr)) {
          // It's already in millions with decimal separator: "343.800" = 343.8 million
          // Parse as decimal: replace the last dot with nothing, then divide by 1000
          // "343.800" -> "343800" -> 343800 -> 343.8
          const beforeDot = originalStr.split('.')[0];
          const afterDot = originalStr.split('.').slice(1).join('');
          return parseFloat(beforeDot + '.' + afterDot);
        }
        // Otherwise, it's likely thousands that need conversion
        // "3.000" = 3,000 -> 3 million (if it's actually 3,000,000)
        return num / 1000;
      }
      // If number is small (< 1000) or has 1-3 digits, assume it's already in millions
      // Example: "3" = 3 million
      else {
        return num;
      }
    };

    // Helper function to parse salary range "min - max" (supports thousand separators)
    const parseSalaryRange = (rangeStr) => {
      if (!rangeStr) return null;
      // Match pattern: "number - number" (supports dots, commas, spaces)
      // Examples: "3.000.000 - 8.000.000", "3000000 - 8000000", "3,000,000 - 8,000,000"
      const rangeMatch = rangeStr.match(/([\d.,]+)\s*-\s*([\d.,]+)/);
      if (rangeMatch) {
        const minSalary = parseNumber(rangeMatch[1]);
        const maxSalary = parseNumber(rangeMatch[2]);
        if (minSalary > 0 && maxSalary > 0) {
          return { min: minSalary, max: maxSalary, avg: (minSalary + maxSalary) / 2 };
        }
      }
      return null;
    };

    // Calculate commission based on salary range, job percent, and CTV rank percent
    const jobValues = job.jobValues || job.profits || [];
    let commissionText = 'Liên hệ';
    
    // Get CTV rank level percent
    const ctvRankPercent = ctvProfile?.rankLevel?.percent ? parseFloat(ctvProfile.rankLevel.percent) : 0;
    
    // Get salary range with type = "year"
    const salaryRanges = job.salaryRanges || [];
    const yearSalaryRange = salaryRanges.find(sr => sr.type === 'year' || sr.type === 'Year' || sr.type === 'YEAR');
    
    if (jobValues.length > 0) {
      const firstJobValue = jobValues[0];
      const commissionType = job.jobCommissionType || 'fixed';
      const value = firstJobValue.value;
      const valueId = firstJobValue.valueId || firstJobValue.valueRef?.id;
      
      // Parse salary range if available
      const salaryRangeData = yearSalaryRange && yearSalaryRange.salaryRange 
        ? parseSalaryRange(yearSalaryRange.salaryRange) 
        : null;
      
      // Check if valueId = 6 (exception case - display fixed amount directly)
      if (valueId === 6) {
        if (value !== null && value !== undefined) {
          if (commissionType === 'fixed') {
            const fixedAmount = parseFloat(value) || 0;
            if (fixedAmount > 0) {
              // CTV nhận % theo level
              const ctvAmount = ctvRankPercent > 0 ? fixedAmount * (ctvRankPercent / 100) : fixedAmount;
              commissionText = `${Math.round(ctvAmount).toLocaleString('vi-VN')} triệu`;
            }
          } else if (commissionType === 'percent') {
            // Nếu có salary range, tính dựa trên đó
            if (salaryRangeData) {
              const jobPercent = parseFloat(value) || 0;
              const platformCommissionMin = salaryRangeData.min * (jobPercent / 100);
              const platformCommissionMax = salaryRangeData.max * (jobPercent / 100);
              const ctvMinAmount = ctvRankPercent > 0 
                ? platformCommissionMin * (ctvRankPercent / 100) 
                : platformCommissionMin;
              const ctvMaxAmount = ctvRankPercent > 0 
                ? platformCommissionMax * (ctvRankPercent / 100) 
                : platformCommissionMax;
              
              // Format with appropriate precision to preserve difference between min and max
              const formatCommission = (amount) => {
                if (amount < 1) {
                  // For amounts < 1 million, show 2 decimal places
                  return amount.toFixed(2).replace(/\.?0+$/, '');
                } else if (amount < 10) {
                  // For amounts 1-10 million, show 1 decimal place
                  return amount.toFixed(1).replace(/\.?0+$/, '');
                } else {
                  // For amounts >= 10 million, round to integer
                  return Math.round(amount).toString();
                }
              };
              
              const formattedMin = formatCommission(ctvMinAmount);
              const formattedMax = formatCommission(ctvMaxAmount);
              commissionText = `${formattedMin.replace('.', ',')} - ${formattedMax.replace('.', ',')} triệu`;
            } else {
              commissionText = `${value}%`;
            }
          }
        }
      } else {
        // Normal case: calculate based on salary range
        if (salaryRangeData && commissionType === 'percent' && value !== null && value !== undefined) {
          const jobPercent = parseFloat(value) || 0;
          
          // Calculate min and max commission: salary * jobPercent * ctvRankPercent
          const platformCommissionMin = salaryRangeData.min * (jobPercent / 100);
          const platformCommissionMax = salaryRangeData.max * (jobPercent / 100);
          
          const ctvMinAmount = ctvRankPercent > 0 
            ? platformCommissionMin * (ctvRankPercent / 100) 
            : platformCommissionMin;
          const ctvMaxAmount = ctvRankPercent > 0 
            ? platformCommissionMax * (ctvRankPercent / 100) 
            : platformCommissionMax;
          
          // Format with appropriate precision to preserve difference between min and max
          const formatCommission = (amount) => {
            if (amount < 1) {
              // For amounts < 1 million, show 2 decimal places
              return amount.toFixed(2).replace(/\.?0+$/, '');
            } else if (amount < 10) {
              // For amounts 1-10 million, show 1 decimal place
              return amount.toFixed(1).replace(/\.?0+$/, '');
            } else {
              // For amounts >= 10 million, round to integer
              return Math.round(amount).toString();
            }
          };
          
          const formattedMin = formatCommission(ctvMinAmount);
          const formattedMax = formatCommission(ctvMaxAmount);
          commissionText = `${formattedMin.replace('.', ',')} - ${formattedMax.replace('.', ',')} triệu`;
        } else if (commissionType === 'fixed' && value !== null && value !== undefined) {
          // Fixed amount
          const amount = parseFloat(value) || 0;
          if (amount > 0) {
            commissionText = `${amount.toLocaleString('vi-VN')} triệu`;
          }
        } else if (commissionType === 'percent' && value !== null && value !== undefined) {
          // Percent but no salary range
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
    
    // Get application conditions (requirements with type 'application' or all requirements combined)
    const applicationRequirements = requirements
      .filter(req => req.type === 'application')
      .map(req => stripHtml(req.content || ''));
    
    // If no application type, combine technique and education as application conditions
    const applicationConditions = applicationRequirements.length > 0 
      ? applicationRequirements 
      : [...techniqueRequirements, ...educationRequirements];

    // Get job content (description)
    const jobContent = stripHtml(job.description || job.jobContent || '');

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
    
    // Get additional info
    const ageRange = job.ageRange || job.age || '';
    const nationality = job.nationality || '';
    const gender = job.gender || '';
    const educationLevel = job.educationLevel || '';
    const category = job.category?.name || '';
    
    // Format dates
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      } catch (error) {
        return '';
      }
    };
    
    const updatedAt = formatDate(job.updatedAt);
    const publishedAt = formatDate(job.publishedAt || job.createdAt);

    return {
      id: String(job.id),
      jobCode: job.jobCode || job.id,
      tags,
      title: job.title || '',
      company: job.company?.name || '',
      recruitingCompany: job.recruitingCompany,
      category,
      techniqueRequirements,
      educationRequirements,
      applicationConditions,
      jobContent,
      location: locationText,
      salary: salaryText,
      commission: commissionText,
      ageRange,
      nationality,
      gender,
      educationLevel,
      updatedAt,
      publishedAt,
    };
  };

  const displayJobs = jobs.length > 0 ? jobs.map(formatJob) : [];

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f1f1;
        }
      `}</style>
      <div className="w-full h-full flex flex-col py-2 sm:py-2">
        {/* Job Listings with Scroll */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0 relative">
        {/* Pagination - Show at top if showAllJobs and enablePagination */}
        {showAllJobs && enablePagination && (
          <div className="sticky top-0 z-10 mb-4 bg-white rounded-lg shadow-sm p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm text-gray-600 w-full sm:w-auto">
                {language === 'vi' 
                  ? `Hiển thị ${jobs.length} / ${totalJobs} công việc`
                  : language === 'en'
                  ? `Showing ${jobs.length} / ${totalJobs} jobs`
                  : `${jobs.length} / ${totalJobs} 件を表示`
                }
              </div>
              <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === 'vi' ? 'Trang đầu' : language === 'en' ? 'First page' : '最初のページ'}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === 'vi' ? 'Trang trước' : language === 'en' ? 'Previous page' : '前のページ'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-0.5">
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
                        className={`w-8 h-8 text-xs font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === 'vi' ? 'Trang sau' : language === 'en' ? 'Next page' : '次のページ'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === 'vi' ? 'Trang cuối' : language === 'en' ? 'Last page' : '最後のページ'}
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

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
        <div className={`space-y-3 sm:space-y-4 md:space-y-6 ${showAllJobs && enablePagination ? '' : 'pb-20'}`}>
            {displayJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => {
                // Save referrer to sessionStorage for reliable back navigation
                if (useAdminAPI) {
                  // Check if we're on group-jobs page
                  const currentPath = window.location.pathname;
                  console.log('Current path when clicking job:', currentPath);
                  if (currentPath.includes('/admin/group-jobs')) {
                    sessionStorage.setItem('jobDetailReferrer', '/admin/group-jobs');
                    console.log('Set referrer to /admin/group-jobs');
                  } else {
                    sessionStorage.setItem('jobDetailReferrer', '/admin/jobs');
                    console.log('Set referrer to /admin/jobs');
                  }
                }
                // Pass state to indicate where user came from
                const fromPage = useAdminAPI 
                  ? (window.location.pathname.includes('/admin/group-jobs') ? 'group-jobs' : 'jobs')
                  : 'agent-jobs';
                navigate(useAdminAPI ? `/admin/jobs/${job.id}` : `/agent/jobs/${job.id}`, {
                  state: { from: fromPage }
                });
              }}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6">
                {/* Main Content - Left Column */}
                <div className="flex-1 flex flex-col space-y-4 min-w-0">
                  {/* Header Section */}
                  <div className="space-y-3 pb-2 border-b border-gray-100">
                    {/* Job Code */}
                    <div className="text-xs sm:text-xs text-gray-500 font-medium">
                      {language === 'vi' ? 'ID công việc' : language === 'en' ? 'Job ID' : '求人ID'}: <span className="text-gray-700">{job.jobCode}</span>
                    </div>
                    
                    {/* Tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {job.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border ${getTagColorClass(tag.color)}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Job Title */}
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-blue-600 leading-tight pr-2">
                      {job.title}
                    </h2>

                    {/* Category and Company */}
                    <div className="space-y-1.5 sm:space-y-2">
                      {job.category && (
                        <div className="text-xs sm:text-sm text-gray-700">
                          <span className="font-semibold text-gray-600">{language === 'vi' ? 'Phân loại công việc' : language === 'en' ? 'Job Category' : '職種分類'}:</span>
                          <span className="ml-1 sm:ml-2 break-words">{job.category}</span>
                        </div>
                      )}

                      {/* Company Name */}
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs sm:text-sm text-gray-700">
                          <span className="font-semibold text-gray-600">{t.hiringCompany}:</span>
                          <span className="ml-1 sm:ml-2 break-words">{job.recruitingCompany?.companyName || job.company || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Sections Container */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Nội dung công việc - Scrollable */}
                    {job.jobContent && (
                      <div className="flex flex-col h-40 sm:h-48 md:h-52 border border-gray-200 rounded-lg bg-gray-50/50">
                        <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-2 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-800">
                            {language === 'vi' ? 'Nội dung công việc' : language === 'en' ? 'Job Content' : '仕事内容'}
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line custom-scrollbar min-h-0">
                          {job.jobContent}
                        </div>
                      </div>
                    )}

                    {/* Điều kiện ứng tuyển - Scrollable */}
                    {job.applicationConditions && job.applicationConditions.length > 0 && (
                      <div className="flex flex-col h-40 sm:h-48 md:h-52 border border-gray-200 rounded-lg bg-gray-50/50">
                        <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-2 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-800">
                            {language === 'vi' ? 'Điều kiện ứng tuyển' : language === 'en' ? 'Application Conditions' : '応募条件'}
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 space-y-2 custom-scrollbar min-h-0">
                          {job.applicationConditions.map((condition, index) => (
                            <div key={index} className="flex items-start gap-2 sm:gap-2.5">
                              <span className="text-blue-500 flex-shrink-0 mt-0.5 font-bold">•</span>
                              <span className="whitespace-pre-line leading-relaxed">{condition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Side Panel - Right Column */}
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-3 sm:space-y-4">
                  {/* Commission Section */}
                  {job.commission && (
                    <div className="bg-gradient-to-br from-red-50 via-red-50 to-red-100 border-2 border-red-300 rounded-lg p-3 sm:p-4 md:p-5 shadow-sm">
                      <div className="text-xs font-semibold text-red-800 mb-2 sm:mb-3 uppercase tracking-wider">
                        {t.companyCommission || 'Hoa hồng'}
                      </div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-900 leading-tight">
                        {job.commission}
                      </div>
                    </div>
                  )}

                  {/* Quick Info Panel */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 shadow-sm">
                    <div className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-300">
                      {language === 'vi' ? 'Thông tin nhanh' : language === 'en' ? 'Quick Info' : 'クイック情報'}
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {/* Thu nhập hàng năm */}
                      {job.salary && (
                        <div className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5">
                            {language === 'vi' ? 'Thu nhập hàng năm' : language === 'en' ? 'Annual income' : '年収'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-900 font-semibold leading-relaxed break-words">{job.salary}</div>
                        </div>
                      )}

                      {/* Tuổi */}
                      {job.ageRange && (
                        <div className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5">
                            {language === 'vi' ? 'Tuổi' : language === 'en' ? 'Age' : '年齢'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-900 font-semibold break-words">{job.ageRange}</div>
                        </div>
                      )}

                      {/* Quốc tịch */}
                      {job.nationality && (
                        <div className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5">
                            {language === 'vi' ? 'Quốc tịch' : language === 'en' ? 'Nationality' : '国籍'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-900 font-semibold break-words">{job.nationality}</div>
                        </div>
                      )}

                      {/* Giới tính */}
                      {job.gender && (
                        <div className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5">
                            {language === 'vi' ? 'Giới tính' : language === 'en' ? 'Gender' : '性別'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-900 font-semibold break-words">{job.gender}</div>
                        </div>
                      )}

                      {/* Trình độ học vấn */}
                      {job.educationLevel && (
                        <div className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5">
                            {language === 'vi' ? 'Trình độ học vấn' : language === 'en' ? 'Education level' : '学歴'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-900 font-semibold break-words">{job.educationLevel}</div>
                        </div>
                      )}

                      {/* Địa chỉ làm việc */}
                      {job.location && (
                        <div className="pb-2 sm:pb-3 border-b border-gray-200 last:border-0">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 sm:mb-1.5">
                            {language === 'vi' ? 'Nơi làm việc' : language === 'en' ? 'Work locations' : '勤務地'}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-900 font-semibold leading-relaxed whitespace-pre-line break-words">{job.location}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Section - Dates and Action Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200">
                {/* Date Information - Left Side */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  {job.updatedAt && (
                    <>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        <span className="break-words">
                          {language === 'vi' ? 'Ngày cập nhật' : language === 'en' ? 'Update date' : '更新日'}: {job.updatedAt}
                        </span>
                      </div>
                      {job.publishedAt && (
                        <>
                          <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                            <span className="break-words">
                              {language === 'vi' ? 'Ngày xuất bản' : language === 'en' ? 'Publication date' : '公開日'}: {job.publishedAt}
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {!job.updatedAt && job.publishedAt && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                      <span className="break-words">
                        {language === 'vi' ? 'Ngày xuất bản' : language === 'en' ? 'Publication date' : '公開日'}: {job.publishedAt}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Right Side */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement download functionality
                      console.log('Download job:', job.id);
                    }}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{language === 'vi' ? 'Tải xuống' : language === 'en' ? 'Download' : 'ダウンロード'}</span>
                    <span className="sm:hidden">{language === 'vi' ? 'Tải' : language === 'en' ? 'Download' : 'ダウンロード'}</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement save functionality
                      console.log('Save job:', job.id);
                    }}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{language === 'vi' ? 'Giữ gìn' : language === 'en' ? 'Save' : '保存'}</span>
                  </button>

                  {/* Suggest Candidate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement suggest candidate functionality
                      console.log('Suggest candidate for job:', job.id);
                    }}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{language === 'vi' ? 'Đề xuất một ứng cử viên' : language === 'en' ? 'Suggest a candidate' : '候補者を提案'}</span>
                    <span className="sm:hidden">{language === 'vi' ? 'Đề xuất' : language === 'en' ? 'Suggest' : '提案'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        
        {/* Footer - Show viewMore button if not pagination */}
        {!showAllJobs || !enablePagination ? (
          <div className="sticky bottom-4 text-center z-10 mt-4">
            <button 
              onClick={() => navigate(useAdminAPI ? '/admin/jobs' : '/agent/jobs')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-2xl"
            >
              {t.viewMore}
            </button>
          </div>
        ) : null}
      </div>
    </div>
    </>
  );
};

export default AgentJobsPageSession2;

