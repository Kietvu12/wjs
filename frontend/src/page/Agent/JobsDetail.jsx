import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  FileText,
  Award,
  Heart,
  Share2,
  Copy,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Phone,
  Mail,
  Globe,
  Check,
  XCircle,
  AlertCircle,
  Bookmark,
  Settings,
  User,
  UserPlus,
  Download,
  Zap
} from 'lucide-react';
import apiService from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Helper function to strip HTML tags and format text
const stripHtml = (html) => {
  if (!html) return '';
  if (!html.includes('<')) return html;
  
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    
    // Convert <br> to newlines
    const breaks = tmp.querySelectorAll('br');
    breaks.forEach(br => br.replaceWith('\n'));
    
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
    
    // Convert <ul><li> and <ol><li> to bullet points
    const lists = tmp.querySelectorAll('ul, ol');
    lists.forEach(list => {
      const items = list.querySelectorAll('li');
      const bulletPoints = Array.from(items)
        .map(li => li.textContent.trim())
        .filter(Boolean)
        .map(text => `• ${text}`)
        .join('\n');
      
      if (bulletPoints) {
        const textNode = document.createTextNode(`\n${bulletPoints}\n`);
        if (list.parentNode) {
          list.parentNode.replaceChild(textNode, list);
        }
      } else {
        list.remove();
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
    // Fallback: simple regex to remove HTML tags
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
};

const JobsDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    main: true, // Thẻ chính luôn mở
    requirements: true,
    location: true,
    benefits: true,
    interview: true,
    company: true,
  });

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getJobById(jobId);
      
      if (response.success && response.data?.job) {
        setJob(response.data.job);
        setIsFavorite(response.data.job.isFavorite || false);
      } else {
        setError('Không tìm thấy thông tin việc làm');
      }
    } catch (err) {
      console.error('Error loading job detail:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải thông tin việc làm');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleFavorite = async () => {
    // TODO: Implement favorite toggle API
    setIsFavorite(!isFavorite);
  };

  const handleApply = () => {
    navigate(`/agent/jobs/${jobId}/nominate`);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Collapsible Card Component
  const CollapsibleCard = ({ 
    title, 
    icon: Icon, 
    sectionKey, 
    children, 
    defaultExpanded = true,
    className = ''
  }) => {
    const isExpanded = expandedSections[sectionKey] ?? defaultExpanded;
    
    return (
      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${className}`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />}
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 text-left">
              {title}
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 flex-shrink-0 transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 flex-shrink-0 transition-transform" />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/agent/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách việc làm
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  // Format data
  const techniqueRequirements = (job.requirements || [])
    .filter(req => req.type === 'technique')
    .map(req => ({ content: stripHtml(req.content), status: req.status }));
  
  const educationRequirements = (job.requirements || [])
    .filter(req => req.type === 'education')
    .map(req => ({ content: stripHtml(req.content), status: req.status }));

  // Process working locations - each detail is separate, strip HTML from each
  const workingLocations = (job.workingLocationDetails || [])
    .map(detail => {
      if (!detail.content) return null;
      const stripped = stripHtml(detail.content);
      // Split by newlines if there are multiple locations in one content
      return stripped.split('\n').map(loc => loc.trim()).filter(Boolean);
    })
    .filter(Boolean)
    .flat(); // Flatten array of arrays

  const salaryRanges = (job.salaryRangeDetails || [])
    .map(detail => stripHtml(detail.content))
    .filter(Boolean);

  const overtimeAllowances = (job.overtimeAllowanceDetails || [])
    .map(detail => stripHtml(detail.content))
    .filter(Boolean);

  const smokingPolicyDetails = (job.smokingPolicyDetails || [])
    .map(detail => stripHtml(detail.content))
    .filter(Boolean);

  const workingHours = (job.workingHourDetails || [])
    .map(detail => stripHtml(detail.content))
    .filter(Boolean);

  const businessFields = (job.company?.businessFields || [])
    .map(field => stripHtml(field.content))
    .filter(Boolean);

  const offices = job.company?.offices || [];

  const getRecruitmentTypeText = (type) => {
    const types = {
      1: 'Nhân viên chính thức',
      2: 'Nhân viên chính thức (công ty haken; hợp đồng vô thời hạn)',
      3: 'Nhân viên haken (hợp đồng có thời hạn)',
      4: 'Nhân viên hợp đồng'
    };
    return types[type] || 'Không xác định';
  };

  const getInterviewLocationText = (location) => {
    const locations = {
      1: 'Việt Nam',
      2: 'Nhật Bản',
      3: 'Việt Nam & Nhật Bản'
    };
    return locations[location] || 'Không xác định';
  };

  // Calculate average salary if available
  const getAverageSalary = () => {
    if (salaryRanges.length > 0) {
      // Try to extract numbers from salary ranges
      const numbers = salaryRanges.join(' ').match(/[\d,]+/g);
      if (numbers && numbers.length > 0) {
        const avg = numbers.reduce((sum, num) => sum + parseFloat(num.replace(/,/g, '')), 0) / numbers.length;
        return `${Math.round(avg).toLocaleString('vi-VN')} triệu`;
      }
    }
    return salaryRanges[0] || 'Thỏa thuận';
  };

  const benefits = (job.benefits || [])
    .map(benefit => stripHtml(benefit.content))
    .filter(Boolean);

  const smokingPolicies = (job.smokingPolicies || [])
    .map(policy => policy.allow ? 'Cho phép hút thuốc' : 'Không cho phép hút thuốc');

  // Get job tags
  const jobTags = [];
  if (job.isHot) {
    jobTags.push({ label: 'JobShare Selection', color: 'green' });
  }
  const isInCampaign = job.jobCampaigns && job.jobCampaigns.length > 0;
  if (isInCampaign) {
    jobTags.push({ label: 'Campaign', color: 'blue' });
  } else if (job.isPinned) {
    jobTags.push({ label: 'Ứng tuyển trực tiếp', color: 'orange' });
  }
  if (job.recruitmentType === 1) {
    jobTags.push({ label: 'Nhân viên toàn thời gian (hợp đồng lâu dài)', color: 'blue' });
  }

  // Get application conditions and requirements
  const applicationConditions = (job.requirements || [])
    .filter(req => req.type === 'application')
    .map(req => stripHtml(req.content || ''));

  // Get disqualifications (NG items)
  const disqualifications = (job.disqualifications || [])
    .map(item => stripHtml(item.content || item.name || ''))
    .filter(Boolean);

  // Get welcome conditions
  const welcomeConditions = (job.welcomeConditions || [])
    .map(item => stripHtml(item.content || item.name || ''))
    .filter(Boolean);

  // Get job features/highlights
  const jobFeatures = [];
  if (job.weekendOff) jobFeatures.push('Đóng cửa vào cuối tuần và ngày lễ');
  if (job.maternityLeave) jobFeatures.push('Có chế độ nghỉ thai sản/cha con');
  if (job.scoutOk) jobFeatures.push('Scout OK (công bố tên công ty OK)');
  if (job.noExpOk) jobFeatures.push('Không có kinh nghiệm trong bất kỳ loại công việc OK');
  if (job.noIndustryExpOk) jobFeatures.push('Không cho phép kinh nghiệm trong ngành');
  if (job.mediaOk) jobFeatures.push('Media publication OK (công bố tên công ty OK)');
  if (job.completelyNoExpOk) jobFeatures.push('Hoàn toàn thiếu kinh nghiệm OK');

  // Calculate commission for main card
  const getCommissionText = () => {
    if (job.jobValues && job.jobValues.length > 0) {
      const firstJobValue = job.jobValues[0];
      const value = firstJobValue.value;
      if (value !== null && value !== undefined) {
        if (job.jobCommissionType === 'percent') {
          return `${parseFloat(value).toLocaleString('vi-VN')}%`;
        } else {
          return `${parseFloat(value).toLocaleString('vi-VN')} triệu`;
        }
      }
    }
    return 'Liên hệ';
  };

  // Helper function to get tag color class
  const getTagColorClass = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[color] || colors.green;
  };

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

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full overflow-hidden bg-gray-50 p-4 sm:p-5 lg:p-6">
      {/* Main Content - Left Column */}
      <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar">
        <div className="w-full max-w-none space-y-5">
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
            <button
              onClick={() => navigate('/agent/jobs')}
              className="mb-5 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base group"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại</span>
            </button>

            {/* Job ID */}
            <div className="text-xs sm:text-sm text-gray-500 mb-3">
              ID công việc: <span className="text-gray-700 font-semibold">{job.jobCode || job.id}</span>
            </div>

            {/* Tags */}
            {jobTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {jobTags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getTagColorClass(tag.color)}`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Job Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-4 leading-tight">
              {job.title}
            </h1>

            {/* Category */}
            {job.category && (
              <div className="text-xs sm:text-sm text-gray-700 mb-3">
                <span className="font-semibold text-gray-600">Phân loại công việc:</span>
                <span className="ml-2">{job.category.name}</span>
              </div>
            )}

            {/* Company Name */}
            <div className="flex items-start gap-2 mb-4">
              <Building2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-gray-700">
                <span className="font-semibold text-gray-600">Các công ty tuyển dụng:</span>
                <span className="ml-2">{job.recruitingCompany?.companyName || 'N/A'}</span>
              </div>
            </div>

            {/* Job Features */}
            {jobFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {jobFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium border border-blue-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Date Information */}
          {(updatedAt || publishedAt) && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-600">
                {updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span className="font-medium">Ngày cập nhật {updatedAt}</span>
                  </div>
                )}
                {updatedAt && publishedAt && (
                  <div className="hidden sm:block h-5 w-px bg-gray-300"></div>
                )}
                {publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span className="font-medium">Ngày xuất bản {publishedAt}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orange Notice Box */}
          <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-orange-900">
              <p className="font-bold mb-2 text-sm sm:text-base">Thông báo quan trọng</p>
              <p className="leading-relaxed">
                Thông tin trong các mục được đánh dấu bằng dấu này là dành cho đại lý. Hãy cẩn thận đừng chia sẻ với các ứng viên. 
                Bạn cũng có thể chuyển sang chỉ hiển thị thông tin ứng viên.
              </p>
            </div>
          </div>

          {/* Thẻ chính: Thông tin chung */}
          <CollapsibleCard
            title="Thông tin chung"
            icon={FileText}
            sectionKey="main"
            defaultExpanded={true}
          >
            <div className="space-y-5 pt-2">
              {/* Job Description */}
              {job.description && (
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mb-3">Nội dung công việc:</div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {stripHtml(job.description)}
                  </div>
                </div>
              )}

              {/* Salary Range */}
              {salaryRanges.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-800 mb-3">Mức lương:</div>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                    {salaryRanges.map((salary, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{salary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {/* Annual Income */}
                {salaryRanges.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Thu nhập hàng năm
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">{getAverageSalary()}</div>
                  </div>
                )}

                {/* Age */}
                {job.ageRange && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tuổi
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">{job.ageRange}</div>
                  </div>
                )}

                {/* Nationality */}
                {job.nationality && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Quốc tịch
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">{job.nationality}</div>
                  </div>
                )}

                {/* Application Category */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Danh mục ứng dụng
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">Giữa chừng</div>
                </div>

                {/* Number of Companies */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Số lượng công ty có kinh nghiệm
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">Không có câu hỏi</div>
                </div>

                {/* Gender */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tình dục
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">Không có câu hỏi</div>
                </div>

                {/* Education Level */}
                {job.educationLevel && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Trình độ học vấn
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">{job.educationLevel}</div>
                  </div>
                )}

                {/* Workplace */}
                {workingLocations.length > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Nơi làm việc
                    </div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 leading-relaxed">
                      {workingLocations.slice(0, 3).join(', ')}
                      {workingLocations.length > 3 && `, ${workingLocations.length - 3} trường hợp khác`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleCard>

          {/* Điều kiện ứng tuyển */}
          <CollapsibleCard
            title="Điều kiện ứng tuyển"
            icon={Users}
            sectionKey="requirements"
            defaultExpanded={true}
          >
            <div className="space-y-6 pt-2">
              {/* Candidate Profile (Thông số kỹ thuật) */}
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                  Thông số kỹ thuật
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Age */}
                  {job.ageRange && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 min-w-[120px]">Tuổi:</span>
                      <span className="text-gray-900 font-medium">{job.ageRange}</span>
                    </div>
                  )}

                  {/* Number of Companies */}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[120px]">Số lượng công ty có kinh nghiệm:</span>
                    <span className="text-gray-900 font-medium">Không có câu hỏi</span>
                  </div>

                  {/* Education */}
                  {job.educationLevel && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 min-w-[120px]">Trình độ học vấn:</span>
                      <span className="text-gray-900 font-medium">{job.educationLevel}</span>
                    </div>
                  )}

                  {/* Gender */}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[120px]">Giới tính:</span>
                    <span className="text-gray-900 font-medium">Không có câu hỏi</span>
                  </div>

                  {/* Nationality */}
                  {job.nationality && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 min-w-[120px]">Quốc tịch:</span>
                      <span className="text-gray-900 font-medium">{job.nationality}</span>
                    </div>
                  )}

                  {/* Industry Experience */}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[120px]">Số năm kinh nghiệm (ngành):</span>
                    <span className="text-gray-900 font-medium">Không cho phép kinh nghiệm trong ngành</span>
                  </div>

                  {/* Other Experiences */}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 min-w-[120px]">Kinh nghiệm khác:</span>
                    <span className="text-gray-900 font-medium">Không có (hoàn toàn thiếu kinh nghiệm OK)</span>
                  </div>
                </div>
              </div>

              {/* Required (Bắt buộc) */}
              {(techniqueRequirements.length > 0 || applicationConditions.length > 0) && (
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mb-3">Bắt buộc</div>
                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Required Years of Experience */}
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 min-w-[120px]">Số năm kinh nghiệm (loại công việc):</span>
                      <span className="text-gray-900 font-medium">Không có kinh nghiệm trong bất kỳ loại công việc OK</span>
                    </div>

                    {/* Application Conditions */}
                    {applicationConditions.length > 0 && (
                      <div>
                        <div className="text-gray-500 mb-2">Điều kiện ứng dụng:</div>
                        <ul className="space-y-1 ml-4">
                          {applicationConditions.map((condition, index) => (
                            <li key={index} className="text-gray-900">
                              ■ {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technique Requirements as Application Conditions */}
                    {techniqueRequirements.length > 0 && applicationConditions.length === 0 && (
                      <div>
                        <div className="text-gray-500 mb-2">Điều kiện ứng dụng:</div>
                        <ul className="space-y-1 ml-4">
                          {techniqueRequirements.map((req, index) => (
                            <li key={index} className="text-gray-900">
                              ■ {req.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Welcome Conditions */}
              {welcomeConditions.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mb-3">Điều kiện chào mừng</div>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600 ml-4">
                    {welcomeConditions.map((condition, index) => (
                      <li key={index}>• {condition}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disqualifications (Mục tiêu NG) */}
              {disqualifications.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mb-3">Mục tiêu NG</div>
                  <ul className="space-y-1 text-xs sm:text-sm text-gray-600 ml-4">
                    {disqualifications.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleCard>

          {/* Nơi làm việc */}
          {workingLocations.length > 0 && (
            <CollapsibleCard
              title="Nơi làm việc"
              icon={MapPin}
              sectionKey="location"
              defaultExpanded={true}
            >
              <div className="space-y-2 pt-2 text-xs sm:text-sm text-gray-600">
                {workingLocations.map((location, index) => (
                  <div key={index} className="leading-relaxed whitespace-pre-line">
                    {location.includes('•') ? location : `• ${location}`}
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}

          {/* Chính sách đãi ngộ */}
          {(benefits.length > 0 || workingHours.length > 0 || overtimeAllowances.length > 0 || smokingPolicies.length > 0 || smokingPolicyDetails.length > 0) && (
            <CollapsibleCard
              title="Chính sách đãi ngộ"
              icon={Award}
              sectionKey="benefits"
              defaultExpanded={true}
            >
              <div className="space-y-4 pt-2">
                {benefits.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Phúc lợi:</div>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-400 mt-1 flex-shrink-0">•</span>
                          <span className="flex-1">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {workingHours.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Thời gian làm việc:</div>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {workingHours.map((hour, index) => (
                        <li key={index}>• {hour}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {overtimeAllowances.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Phụ cấp làm thêm:</div>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {overtimeAllowances.map((allowance, index) => (
                        <li key={index}>• {allowance}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {smokingPolicies.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Chính sách hút thuốc:</div>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {smokingPolicies.map((policy, index) => (
                        <li key={index}>• {policy}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {smokingPolicyDetails.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Chi tiết chính sách hút thuốc:</div>
                    <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
                      {smokingPolicyDetails.map((detail, index) => (
                        <li key={index}>• {detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          )}

          {/* Quy trình phỏng vấn */}
          {job.instruction && (
            <CollapsibleCard
              title="Quy trình phỏng vấn"
              icon={AlertCircle}
              sectionKey="interview"
              defaultExpanded={true}
            >
              <div className="pt-2 text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {stripHtml(job.instruction)}
              </div>
            </CollapsibleCard>
          )}

          {/* Thông tin công ty */}
          {job.recruitingCompany && (
            <CollapsibleCard
              title="Thông tin công ty"
              icon={Building2}
              sectionKey="company"
              defaultExpanded={true}
            >
              <div className="space-y-4 pt-2">
                {/* Recruiting Company */}
                {job.recruitingCompany && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Công ty tuyển dụng:</div>
                    <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                      {job.recruitingCompany.companyName && (
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{job.recruitingCompany.companyName}</div>
                      )}
                      {job.recruitingCompany.revenue && (
                        <div>
                          <span className="font-medium">Doanh thu:</span> {job.recruitingCompany.revenue}
                        </div>
                      )}
                      {job.recruitingCompany.numberOfEmployees && (
                        <div>
                          <span className="font-medium">Số nhân viên:</span> {job.recruitingCompany.numberOfEmployees}
                        </div>
                      )}
                      {job.recruitingCompany.headquarters && (
                        <div>
                          <span className="font-medium">Trụ sở:</span> {job.recruitingCompany.headquarters}
                        </div>
                      )}
                      {job.recruitingCompany.establishedDate && (
                        <div>
                          <span className="font-medium">Thành lập:</span> {job.recruitingCompany.establishedDate}
                        </div>
                      )}
                    </div>
                    {job.recruitingCompany.companyIntroduction && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-3">
                        {stripHtml(job.recruitingCompany.companyIntroduction)}
                      </p>
                    )}
                    {job.recruitingCompany.services && job.recruitingCompany.services.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Dịch vụ:</div>
                        <div className="flex flex-wrap gap-1">
                          {job.recruitingCompany.services.map((service, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                              {service.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.recruitingCompany.businessSectors && job.recruitingCompany.businessSectors.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Lĩnh vực:</div>
                        <div className="flex flex-wrap gap-1">
                          {job.recruitingCompany.businessSectors.map((sector, index) => (
                            <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                              {sector.sectorName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleCard>
          )}
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-4 lg:top-6">
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Suggest Candidate Button - Yellow */}
            <button
              onClick={handleApply}
              className="w-full bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 py-3 px-4 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Đề xuất một ứng cử viên</span>
            </button>

            {/* Copy URL Button - Light Blue */}
            <button
              onClick={handleCopyUrl}
              className="w-full border-2 border-blue-400 bg-white text-blue-600 py-3 px-4 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Copy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-center leading-tight">Sao chép URL công việc<br />(dành cho ứng viên)</span>
            </button>

            {/* Download Button - Light Blue */}
            <button
              onClick={() => {
                // TODO: Implement download functionality
                console.log('Download job:', jobId);
              }}
              className="w-full border-2 border-blue-400 bg-white text-blue-600 py-3 px-4 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tải xuống</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {/* Save Button - Light Blue */}
            <button
              onClick={handleToggleFavorite}
              className="w-full border-2 border-blue-400 bg-white text-blue-600 py-3 px-4 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>Giữ gìn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default JobsDetail;
