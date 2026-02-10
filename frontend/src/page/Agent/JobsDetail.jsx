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

  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredCollapsibleCard, setHoveredCollapsibleCard] = useState({});
  const [hoveredSuggestButton, setHoveredSuggestButton] = useState(false);
  const [hoveredCopyButton, setHoveredCopyButton] = useState(false);
  const [hoveredDownloadButton, setHoveredDownloadButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);
  const [hoveredBackToListButton, setHoveredBackToListButton] = useState(false);

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
    const isHovered = hoveredCollapsibleCard[sectionKey] || false;
    
    return (
      <div className={`rounded-xl transition-shadow ${className}`} style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid', boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onMouseEnter={() => setHoveredCollapsibleCard(prev => ({ ...prev, [sectionKey]: true }))} onMouseLeave={() => setHoveredCollapsibleCard(prev => ({ ...prev, [sectionKey]: false }))}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-5 sm:p-6 transition-colors rounded-t-xl"
          style={{
            backgroundColor: isHovered ? '#f9fafb' : 'transparent'
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#2563eb' }} />}
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-left" style={{ color: '#111827' }}>
              {title}
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform" style={{ color: '#6b7280' }} />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 transition-transform" style={{ color: '#6b7280' }} />
          )}
        </button>
        {isExpanded && (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t" style={{ borderColor: '#f3f4f6' }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'white' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
          <p style={{ color: '#4b5563' }}>Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'white' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: '#ef4444' }}>{error}</p>
          <button
            onClick={() => navigate('/agent/jobs')}
            onMouseEnter={() => setHoveredBackToListButton(true)}
            onMouseLeave={() => setHoveredBackToListButton(false)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackToListButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
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

  // Helper function to get tag color style
  const getTagColorStyle = (color) => {
    const colors = {
      green: { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' },
      orange: { backgroundColor: '#fed7aa', color: '#9a3412', borderColor: '#fdba74' },
      blue: { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' },
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
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full overflow-hidden p-4 sm:p-5 lg:p-6" style={{ backgroundColor: '#f9fafb' }}>
      {/* Main Content - Left Column */}
      <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar">
        <div className="w-full max-w-none space-y-5">
          {/* Header Section */}
          <div className="rounded-xl shadow-sm p-5 sm:p-6" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid' }}>
            <button
              onClick={() => navigate('/agent/jobs')}
              onMouseEnter={() => setHoveredBackButton(true)}
              onMouseLeave={() => setHoveredBackButton(false)}
              className="mb-5 flex items-center gap-2 transition-colors text-sm sm:text-base group"
              style={{
                color: hoveredBackButton ? '#111827' : '#4b5563'
              }}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" style={{ transform: hoveredBackButton ? 'translateX(-4px)' : 'translateX(0)' }} />
              <span>Quay lại</span>
            </button>

            {/* Job ID */}
            <div className="text-xs sm:text-sm mb-3" style={{ color: '#6b7280' }}>
              ID công việc: <span className="font-semibold" style={{ color: '#374151' }}>{job.jobCode || job.id}</span>
            </div>

            {/* Tags */}
            {jobTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {jobTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                    style={getTagColorStyle(tag.color)}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Job Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 leading-tight" style={{ color: '#2563eb' }}>
              {job.title}
            </h1>

            {/* Category */}
            {job.category && (
              <div className="text-xs sm:text-sm mb-3" style={{ color: '#374151' }}>
                <span className="font-semibold" style={{ color: '#4b5563' }}>Phân loại công việc:</span>
                <span className="ml-2">{job.category.name}</span>
              </div>
            )}

            {/* Company Name */}
            <div className="flex items-start gap-2 mb-4">
              <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6b7280' }} />
              <div className="text-xs sm:text-sm" style={{ color: '#374151' }}>
                <span className="font-semibold" style={{ color: '#4b5563' }}>Các công ty tuyển dụng:</span>
                <span className="ml-2">{job.recruitingCompany?.companyName || 'N/A'}</span>
              </div>
            </div>

            {/* Job Features */}
            {jobFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {jobFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border"
                    style={{ backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Date Information */}
          {(updatedAt || publishedAt) && (
            <div className="rounded-xl shadow-sm p-4 sm:p-5" style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                {updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6b7280' }} />
                    <span className="font-medium">Ngày cập nhật {updatedAt}</span>
                  </div>
                )}
                {updatedAt && publishedAt && (
                  <div className="hidden sm:block h-5 w-px" style={{ backgroundColor: '#d1d5db' }}></div>
                )}
                {publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#6b7280' }} />
                    <span className="font-medium">Ngày xuất bản {publishedAt}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orange Notice Box */}
          <div className="rounded-xl p-4 sm:p-5 flex items-start gap-3 shadow-sm" style={{ backgroundColor: '#fff7ed', borderColor: '#fdba74', borderWidth: '2px', borderStyle: 'solid' }}>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" style={{ color: '#ea580c' }} />
            <div className="text-xs sm:text-sm" style={{ color: '#9a3412' }}>
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
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#1f2937' }}>Nội dung công việc:</div>
                  <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm" style={{ color: '#374151' }}>
                    {stripHtml(job.description)}
                  </div>
                </div>
              )}

              {/* Salary Range */}
              {salaryRanges.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#1f2937' }}>Mức lương:</div>
                  <ul className="space-y-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                    {salaryRanges.map((salary, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1" style={{ color: '#2563eb' }}>•</span>
                        <span>{salary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                {/* Annual Income */}
                {salaryRanges.length > 0 && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      Thu nhập hàng năm
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{getAverageSalary()}</div>
                  </div>
                )}

                {/* Age */}
                {job.ageRange && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      Tuổi
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{job.ageRange}</div>
                  </div>
                )}

                {/* Nationality */}
                {job.nationality && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      Quốc tịch
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{job.nationality}</div>
                  </div>
                )}

                {/* Application Category */}
                <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                    Danh mục ứng dụng
                  </div>
                  <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>Giữa chừng</div>
                </div>

                {/* Number of Companies */}
                <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                    Số lượng công ty có kinh nghiệm
                  </div>
                  <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>Không có câu hỏi</div>
                </div>

                {/* Gender */}
                <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                    Tình dục
                  </div>
                  <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>Không có câu hỏi</div>
                </div>

                {/* Education Level */}
                {job.educationLevel && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      Trình độ học vấn
                    </div>
                    <div className="text-sm sm:text-base font-bold" style={{ color: '#111827' }}>{job.educationLevel}</div>
                  </div>
                )}

                {/* Workplace */}
                {workingLocations.length > 0 && (
                  <div className="sm:col-span-2 rounded-lg p-3" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>
                      Nơi làm việc
                    </div>
                    <div className="text-sm sm:text-base font-bold leading-relaxed" style={{ color: '#111827' }}>
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
                <div className="text-xs sm:text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#111827' }}>
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#ea580c' }} />
                  Thông số kỹ thuật
                </div>
                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Age */}
                  {job.ageRange && (
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Tuổi:</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{job.ageRange}</span>
                    </div>
                  )}

                  {/* Number of Companies */}
                  <div className="flex items-start gap-2">
                    <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Số lượng công ty có kinh nghiệm:</span>
                    <span className="font-medium" style={{ color: '#111827' }}>Không có câu hỏi</span>
                  </div>

                  {/* Education */}
                  {job.educationLevel && (
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Trình độ học vấn:</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{job.educationLevel}</span>
                    </div>
                  )}

                  {/* Gender */}
                  <div className="flex items-start gap-2">
                    <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Giới tính:</span>
                    <span className="font-medium" style={{ color: '#111827' }}>Không có câu hỏi</span>
                  </div>

                  {/* Nationality */}
                  {job.nationality && (
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Quốc tịch:</span>
                      <span className="font-medium" style={{ color: '#111827' }}>{job.nationality}</span>
                    </div>
                  )}

                  {/* Industry Experience */}
                  <div className="flex items-start gap-2">
                    <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Số năm kinh nghiệm (ngành):</span>
                    <span className="font-medium" style={{ color: '#111827' }}>Không cho phép kinh nghiệm trong ngành</span>
                  </div>

                  {/* Other Experiences */}
                  <div className="flex items-start gap-2">
                    <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Kinh nghiệm khác:</span>
                    <span className="font-medium" style={{ color: '#111827' }}>Không có (hoàn toàn thiếu kinh nghiệm OK)</span>
                  </div>
                </div>
              </div>

              {/* Required (Bắt buộc) */}
              {(techniqueRequirements.length > 0 || applicationConditions.length > 0) && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#111827' }}>Bắt buộc</div>
                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Required Years of Experience */}
                    <div className="flex items-start gap-2">
                      <span className="min-w-[120px]" style={{ color: '#6b7280' }}>Số năm kinh nghiệm (loại công việc):</span>
                      <span className="font-medium" style={{ color: '#111827' }}>Không có kinh nghiệm trong bất kỳ loại công việc OK</span>
                    </div>

                    {/* Application Conditions */}
                    {applicationConditions.length > 0 && (
                      <div>
                        <div className="mb-2" style={{ color: '#6b7280' }}>Điều kiện ứng dụng:</div>
                        <ul className="space-y-1 ml-4">
                          {applicationConditions.map((condition, index) => (
                            <li key={index} style={{ color: '#111827' }}>
                              ■ {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technique Requirements as Application Conditions */}
                    {techniqueRequirements.length > 0 && applicationConditions.length === 0 && (
                      <div>
                        <div className="mb-2" style={{ color: '#6b7280' }}>Điều kiện ứng dụng:</div>
                        <ul className="space-y-1 ml-4">
                          {techniqueRequirements.map((req, index) => (
                            <li key={index} style={{ color: '#111827' }}>
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
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#111827' }}>Điều kiện chào mừng</div>
                  <ul className="space-y-1 text-xs sm:text-sm ml-4" style={{ color: '#4b5563' }}>
                    {welcomeConditions.map((condition, index) => (
                      <li key={index}>• {condition}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disqualifications (Mục tiêu NG) */}
              {disqualifications.length > 0 && (
                <div>
                  <div className="text-xs sm:text-sm font-bold mb-3" style={{ color: '#111827' }}>Mục tiêu NG</div>
                  <ul className="space-y-1 text-xs sm:text-sm ml-4" style={{ color: '#4b5563' }}>
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
              <div className="space-y-2 pt-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
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
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>Phúc lợi:</div>
                    <ul className="space-y-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 flex-shrink-0" style={{ color: '#9ca3af' }}>•</span>
                          <span className="flex-1">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {workingHours.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>Thời gian làm việc:</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {workingHours.map((hour, index) => (
                        <li key={index}>• {hour}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {overtimeAllowances.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>Phụ cấp làm thêm:</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {overtimeAllowances.map((allowance, index) => (
                        <li key={index}>• {allowance}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {smokingPolicies.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>Chính sách hút thuốc:</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {smokingPolicies.map((policy, index) => (
                        <li key={index}>• {policy}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {smokingPolicyDetails.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#374151' }}>Chi tiết chính sách hút thuốc:</div>
                    <ul className="space-y-1 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
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
              <div className="pt-2 text-xs sm:text-sm leading-relaxed whitespace-pre-line" style={{ color: '#4b5563' }}>
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
                    <div className="text-xs sm:text-sm font-semibold mb-3" style={{ color: '#374151' }}>Công ty tuyển dụng:</div>
                    <div className="space-y-2 text-xs sm:text-sm" style={{ color: '#4b5563' }}>
                      {job.recruitingCompany.companyName && (
                        <div className="font-semibold text-sm sm:text-base" style={{ color: '#111827' }}>{job.recruitingCompany.companyName}</div>
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
                      <p className="text-xs sm:text-sm leading-relaxed mt-3" style={{ color: '#4b5563' }}>
                        {stripHtml(job.recruitingCompany.companyIntroduction)}
                      </p>
                    )}
                    {job.recruitingCompany.services && job.recruitingCompany.services.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Dịch vụ:</div>
                        <div className="flex flex-wrap gap-1">
                          {job.recruitingCompany.services.map((service, index) => (
                            <span key={index} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                              {service.serviceName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job.recruitingCompany.businessSectors && job.recruitingCompany.businessSectors.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Lĩnh vực:</div>
                        <div className="flex flex-wrap gap-1">
                          {job.recruitingCompany.businessSectors.map((sector, index) => (
                            <span key={index} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
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
              onMouseEnter={() => setHoveredSuggestButton(true)}
              onMouseLeave={() => setHoveredSuggestButton(false)}
              className="w-full py-3 px-4 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
              style={{
                backgroundColor: hoveredSuggestButton ? '#facc15' : '#fbbf24',
                color: '#111827',
                boxShadow: hoveredSuggestButton ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Đề xuất một ứng cử viên</span>
            </button>

            {/* Copy URL Button - Light Blue */}
            <button
              onClick={handleCopyUrl}
              onMouseEnter={() => setHoveredCopyButton(true)}
              onMouseLeave={() => setHoveredCopyButton(false)}
              className="w-full border-2 py-3 px-4 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
              style={{
                borderColor: '#60a5fa',
                backgroundColor: hoveredCopyButton ? '#eff6ff' : 'white',
                color: '#2563eb',
                boxShadow: hoveredCopyButton ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
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
              onMouseEnter={() => setHoveredDownloadButton(true)}
              onMouseLeave={() => setHoveredDownloadButton(false)}
              className="w-full border-2 py-3 px-4 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
              style={{
                borderColor: '#60a5fa',
                backgroundColor: hoveredDownloadButton ? '#eff6ff' : 'white',
                color: '#2563eb',
                boxShadow: hoveredDownloadButton ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Tải xuống</span>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {/* Save Button - Light Blue */}
            <button
              onClick={handleToggleFavorite}
              onMouseEnter={() => setHoveredSaveButton(true)}
              onMouseLeave={() => setHoveredSaveButton(false)}
              className="w-full border-2 py-3 px-4 rounded-xl transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
              style={{
                borderColor: '#60a5fa',
                backgroundColor: hoveredSaveButton ? '#eff6ff' : 'white',
                color: '#2563eb',
                boxShadow: hoveredSaveButton ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
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
