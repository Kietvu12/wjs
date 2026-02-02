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
  ChevronLeft,
  GraduationCap,
  XCircle,
  AlertCircle,
  Settings,
  User,
  Edit
} from 'lucide-react';
import apiService from '../../services/api';

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

const AdminJobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminJobById(jobId);
      
      if (response.success && response.data?.job) {
        setJob(response.data.job);
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

  const handleApply = () => {
    navigate(`/admin/jobs/${jobId}/nominate`);
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
            onClick={() => navigate('/admin/jobs')}
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

  return (
    <div className="flex gap-8 h-full overflow-hidden bg-white">
      {/* Main Content - Left Column */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-none py-8 px-8 space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/admin/jobs')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
              <button
                onClick={() => navigate(`/admin/jobs/${jobId}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 flex-wrap">
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {workingLocations.length > 0 
                  ? (workingLocations.length > 1 
                      ? `${workingLocations[0]} và ${workingLocations.length - 1} địa điểm khác`
                      : workingLocations[0])
                  : 'N/A'}
              </span>
              <span className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {getAverageSalary()}
              </span>
            </div>
          </div>

          {/* About the job / Mô tả công việc */}
          {job.description && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Về công việc
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {stripHtml(job.description)}
              </div>
            </div>
          )}

          {/* Responsibilities / Yêu cầu tuyển dụng */}
          {techniqueRequirements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                Trách nhiệm
              </h2>
              <ul className="space-y-3">
                {techniqueRequirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="text-gray-700 flex-1">{req.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required qualifications / Học vấn */}
          {educationRequirements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Yêu cầu trình độ
              </h2>
              <ul className="space-y-3">
                {educationRequirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="text-gray-700 flex-1">{req.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits / Phúc lợi */}
          {benefits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Phúc lợi
              </h2>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="text-gray-700 flex-1">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills / Lĩnh vực kinh doanh */}
          {businessFields.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Kỹ năng
              </h2>
              <div className="flex flex-wrap gap-2">
                {businessFields.map((field, index) => (
                  <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Salary Range Details */}
          {salaryRanges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Chi tiết mức lương
              </h2>
              <ul className="space-y-2">
                {salaryRanges.map((salary, index) => (
                  <li key={index} className="text-gray-700">• {salary}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Working Location Details */}
          {workingLocations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Chi tiết địa điểm làm việc
              </h2>
              <div className="space-y-3">
                {workingLocations.map((location, index) => (
                  <div key={index} className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {location.includes('•') ? location : `• ${location}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(job.instruction || workingHours.length > 0 || overtimeAllowances.length > 0 || smokingPolicies.length > 0) && (
            <div className="space-y-6">
              {job.instruction && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    Hướng dẫn ứng tuyển
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {stripHtml(job.instruction)}
                  </div>
                </div>
              )}

              {workingHours.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Thời gian làm việc
                  </h2>
                  <ul className="space-y-2">
                    {workingHours.map((hour, index) => (
                      <li key={index} className="text-gray-700">• {hour}</li>
                    ))}
                  </ul>
                </div>
              )}

              {overtimeAllowances.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Phụ cấp làm thêm
                  </h2>
                  <ul className="space-y-2">
                    {overtimeAllowances.map((allowance, index) => (
                      <li key={index} className="text-gray-700">• {allowance}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Smoking Policy */}
              {smokingPolicies.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    Chính sách hút thuốc
                  </h2>
                  <ul className="space-y-2">
                    {smokingPolicies.map((policy, index) => (
                      <li key={index} className="text-gray-700">• {policy}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Smoking Policy Details */}
              {smokingPolicyDetails.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <XCircle className="w-6 h-6" />
                    Chi tiết chính sách hút thuốc
                  </h2>
                  <ul className="space-y-2">
                    {smokingPolicyDetails.map((detail, index) => (
                      <li key={index} className="text-gray-700">• {detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Right Column */}
      <div className="w-96 flex-shrink-0 bg-white border-l border-gray-100 p-6">
        <div className="sticky top-6 space-y-6">
          {/* Location */}
          {workingLocations.length > 0 && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Location</div>
              <div className="text-lg font-medium text-gray-900">
                {workingLocations.length > 1 
                  ? `${workingLocations[0]} (+${workingLocations.length - 1})`
                  : workingLocations[0]}
              </div>
            </div>
          )}

          {/* Average Salary */}
          <div>
            <div className="text-sm text-gray-500 mb-1">Average Salary</div>
            <div className="text-lg font-medium text-gray-900">{getAverageSalary()}</div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-2">Details</div>
            {job.category && (
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Industry</div>
                  <div className="text-sm font-medium text-gray-900">{job.category.name}</div>
                </div>
              </div>
            )}
            {job.recruitmentType && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Employment Type</div>
                  <div className="text-sm font-medium text-gray-900">{getRecruitmentTypeText(job.recruitmentType)}</div>
                </div>
              </div>
            )}
            {job.category && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Job Functions</div>
                  <div className="text-sm font-medium text-gray-900">{job.category.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleApply}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base"
            >
              Tiến cử ứng viên
            </button>
          </div>

          {/* Recruiting Company Information */}
          {job.recruitingCompany && (
            <div className="pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-3">Công ty tuyển dụng</div>
              <div className="space-y-3">
                {job.recruitingCompany.companyName && (
                  <div className="font-semibold text-gray-900">{job.recruitingCompany.companyName}</div>
                )}
                <div className="space-y-2 text-sm text-gray-600">
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
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stripHtml(job.recruitingCompany.companyIntroduction).substring(0, 150)}
                    {stripHtml(job.recruitingCompany.companyIntroduction).length > 150 ? '...' : ''}
                  </p>
                )}
                {job.recruitingCompany.services && job.recruitingCompany.services.length > 0 && (
                  <div>
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
                  <div>
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
            </div>
          )}

          {/* Job posted by */}
          {job.company && (
            <div className="pt-6 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-3">Công ty nguồn (Job posted by)</div>
              <div className="flex items-start gap-3">
                {job.company.logo ? (
                  <img
                    src={job.company.logo}
                    alt={job.company.name}
                    className="w-12 h-12 object-contain rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{job.company.name}</div>
                  {offices.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">{stripHtml(offices[0].address)}</div>
                  )}
                  {job.company.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {stripHtml(job.company.description).substring(0, 150)}
                      {stripHtml(job.company.description).length > 150 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Open jobs */}
          <div className="pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {job.company?.name ? `${job.company.name} có ` : ''}nhiều việc làm khác
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobDetailPage;
