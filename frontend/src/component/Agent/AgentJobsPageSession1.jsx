import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  Star,
  CheckSquare,
  Plus,
  X,
  ChevronDown,
  Clock,
  RotateCw,
  Bookmark,
  Heart,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


// Mock data for static options
const mockLocations = [
  'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Fukuoka', 'Sapporo', 'Sendai',
  'Hiroshima', 'Kobe', 'Chiba', 'Saitama', 'Kanagawa', 'Aichi', 'Hyogo'
];

const mockEmploymentTypes = [
  'Nhân viên chính thức',
  'Nhân viên hợp đồng',
  'Bán thời gian / Thời vụ',
  'Nhân viên tạm thời',
  'Ủy thác công việc',
];

const mockVisaTypes = [
  'Kỹ thuật / Nhân văn / Quốc tế',
  'Kỹ năng đặc định',
  'Thực tập kỹ năng',
  'Thường trú nhân',
  'Vợ/chồng người Nhật',
  'Định cư',
];

const mockHighlights = [
  'Chưa có kinh nghiệm OK',
  'Ít làm thêm giờ',
  'Nghỉ thứ 7, Chủ nhật, ngày lễ',
  'Có thể làm việc từ xa',
  'Không chuyển công tác',
  'Có tăng lương',
  'Có thưởng',
  'Có bảo hiểm xã hội đầy đủ',
];

// Header Navigation Buttons Component
const HeaderNavigationButtons = ({ 
  onSearchHistoryClick, 
  onSavedCriteriaClick, 
  onSavedListClick,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="mb-2">
        <div className="flex flex-col gap-1">
          <button
            onClick={onSearchHistoryClick}
            className="flex items-center gap-1.5 px-2 py-1.5 transition-colors justify-start border border-gray-300 rounded text-[10px] hover:bg-gray-50"
          >
            <Clock className="w-3 h-3 text-orange-500" />
            <span className="font-medium text-blue-900 truncate">Lịch sử</span>
          </button>
          <button
            onClick={onSavedCriteriaClick}
            className="flex items-center gap-1.5 px-2 py-1.5 transition-colors justify-start border border-gray-300 rounded text-[10px] hover:bg-gray-50"
          >
            <Bookmark className="w-3 h-3 text-blue-400" />
            <span className="font-medium text-blue-900 truncate">Tiêu chí đã lưu</span>
          </button>
          <button
            onClick={onSavedListClick}
            className="flex items-center gap-1.5 px-2 py-1.5 transition-colors justify-start border border-gray-300 rounded text-[10px] hover:bg-gray-50"
          >
            <Heart className="w-3 h-3 text-red-500" />
            <span className="font-medium text-blue-900 truncate">Danh sách (61)</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <div className="flex items-center gap-0">
        <button
          onClick={onSearchHistoryClick}
          className="flex items-center gap-2 px-4 py-2 transition-colors flex-1 justify-center border-r border-gray-300"
        >
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-medium text-blue-900 whitespace-nowrap">Lịch sử tìm kiếm</span>
        </button>
        <button
          onClick={onSavedCriteriaClick}
          className="flex items-center gap-2 px-4 py-2 transition-colors flex-1 justify-center border-r border-gray-300"
        >
          <Bookmark className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-medium text-blue-900 whitespace-nowrap">Tiêu chí tìm kiếm đã lưu</span>
        </button>
        <button
          onClick={onSavedListClick}
          className="flex items-center gap-2 px-4 py-2 transition-colors flex-1 justify-center"
        >
          <Heart className="w-5 h-5 text-red-500" />
          <span className="text-xs font-medium text-blue-900 whitespace-nowrap">
            Danh sách lưu giữ <span className="font-bold">61 miếng</span>
          </span>
        </button>
      </div>
    </div>
  );
};

const AgentJobsPageSession1 = ({ onSearch, onFiltersChange, compact = false }) => {
  const { language } = useLanguage();
  const t = translations[language];

  // State
  const [filters, setFilters] = useState({
    keyword: '',
    keywordMode: 'OR',
    locations: [],
    businessTypeIds: [], // Loại hình kinh doanh (parentId = null)
    fieldIds: [], // Lĩnh vực (parentId tham chiếu đến businessType)
    jobTypeIds: [], // Loại công việc (parentId tham chiếu đến field)
    age: null,
    salaryMin: '',
    salaryMax: '',
    employmentType: null,
    visaType: null,
    highlights: [],
    booleans: {
      positionNoExpOk: false,
      industryNoExpOk: false,
      weekendOff: false,
      noExpOk: false,
    },
  });

  const [showKeywordMode, setShowKeywordMode] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showBusinessTypeModal, setShowBusinessTypeModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingJobTypes, setLoadingJobTypes] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  const [businessTypes, setBusinessTypes] = useState([]); // Loại hình kinh doanh
  const [locations, setLocations] = useState([]); // Địa điểm làm việc
  const [loading, setLoading] = useState(false);
  
  // New modal states
  const [showSearchHistoryModal, setShowSearchHistoryModal] = useState(false);
  const [showSavedCriteriaModal, setShowSavedCriteriaModal] = useState(false);
  const [showSavedListModal, setShowSavedListModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadBusinessTypes();
    loadLocations();
  }, []);

  // Load business types (Loại hình kinh doanh - parentId = null)
  const loadBusinessTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobCategories({ parentId: null, status: 1 });
      if (response.success && response.data?.categories) {
        setBusinessTypes(response.data.categories.map(cat => ({
          id: String(cat.id),
          name: cat.name
        })));
      }
    } catch (error) {
      console.error('Error loading business types:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load locations from jobs (working locations)
  const loadLocations = async () => {
    try {
      // Load jobs to extract unique locations
      const response = await apiService.getCTVJobs({ limit: 1000, status: 1 });
      if (response.success && response.data?.jobs) {
        const locationSet = new Set();
        response.data.jobs.forEach(job => {
          if (job.workingLocations && job.workingLocations.length > 0) {
            job.workingLocations.forEach(wl => {
              if (wl.location) {
                locationSet.add(wl.location);
              }
            });
          }
        });
        setLocations(Array.from(locationSet).sort());
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      // Fallback to mock data
      setLocations(mockLocations);
    }
  };

  // Fetch fields (Lĩnh vực) when business type changes
  useEffect(() => {
    if (filters.businessTypeIds.length > 0) {
      setLoadingFields(true);
      fetchFieldsByBusinessTypes(filters.businessTypeIds).then((fields) => {
        setAvailableFields(fields);
        setLoadingFields(false);
        // Reset fieldIds and jobTypeIds when business type changes
        setFilters(prev => ({ ...prev, fieldIds: [], jobTypeIds: [] }));
      });
    } else {
      setAvailableFields([]);
      setFilters(prev => ({ ...prev, fieldIds: [], jobTypeIds: [] }));
    }
  }, [filters.businessTypeIds]);

  // Fetch job types (Loại công việc) when field changes
  useEffect(() => {
    if (filters.fieldIds.length > 0) {
      setLoadingJobTypes(true);
      fetchJobTypesByFields(filters.fieldIds).then((jobTypes) => {
        setAvailableJobTypes(jobTypes);
        setLoadingJobTypes(false);
        // Reset jobTypeIds when field changes
        setFilters(prev => ({ ...prev, jobTypeIds: [] }));
      });
    } else {
      setAvailableJobTypes([]);
      setFilters(prev => ({ ...prev, jobTypeIds: [] }));
    }
  }, [filters.fieldIds]);

  // Fetch fields (Lĩnh vực) from API - children of business types
  const fetchFieldsByBusinessTypes = async (businessTypeIds) => {
    try {
      const allFields = [];
      for (const businessTypeId of businessTypeIds) {
        const response = await apiService.getJobCategoryChildren(parseInt(businessTypeId));
        if (response.success && response.data?.categories) {
          const fields = response.data.categories.map(cat => ({
            id: String(cat.id),
            name: cat.name,
            parentId: String(cat.parentId || businessTypeId)
          }));
          allFields.push(...fields);
        }
      }
      return allFields;
    } catch (error) {
      console.error('Error fetching fields:', error);
      return [];
    }
  };

  // Fetch job types (Loại công việc) from API - children of fields
  const fetchJobTypesByFields = async (fieldIds) => {
    try {
      const allJobTypes = [];
      for (const fieldId of fieldIds) {
        const response = await apiService.getJobCategoryChildren(parseInt(fieldId));
        if (response.success && response.data?.categories) {
          const jobTypes = response.data.categories.map(cat => ({
            id: String(cat.id),
            name: cat.name,
            parentId: String(cat.parentId || fieldId)
          }));
          allJobTypes.push(...jobTypes);
        }
      }
      return allJobTypes;
    } catch (error) {
      console.error('Error fetching job types:', error);
      return [];
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      // Build query params
      const params = {
        page: 1,
        limit: 10,
      };

      // Keyword search
      if (filters.keyword && filters.keyword.trim()) {
        params.search = filters.keyword.trim();
      }

      // Category filter - ưu tiên jobTypeIds (Loại công việc), sau đó fieldIds (Lĩnh vực), cuối cùng businessTypeIds (Loại hình kinh doanh)
      if (filters.jobTypeIds.length > 0) {
        // Nếu có nhiều job types, lấy đầu tiên (API chỉ hỗ trợ 1 categoryId)
        params.categoryId = parseInt(filters.jobTypeIds[0]);
      } else if (filters.fieldIds.length > 0) {
        // Nếu không có job type, dùng field (Lĩnh vực)
        params.categoryId = parseInt(filters.fieldIds[0]);
      } else if (filters.businessTypeIds.length > 0) {
        // Nếu không có field, dùng business type (Loại hình kinh doanh)
        params.categoryId = parseInt(filters.businessTypeIds[0]);
      }

      // Location filter - có thể gửi nhiều location hoặc chỉ lấy đầu tiên
      // API hiện tại chỉ hỗ trợ 1 location, nên lấy đầu tiên
      if (filters.locations.length > 0) {
        params.location = filters.locations[0];
      }

      // Salary filters
      if (filters.salaryMin) {
        params.minSalary = String(filters.salaryMin);
      }

      if (filters.salaryMax) {
        params.maxSalary = String(filters.salaryMax);
      }

      // Hot jobs filter (nếu có highlight "Hot" hoặc checkbox nào đó)
      // Có thể thêm logic để set isHot dựa trên filters.booleans hoặc highlights

      // Sort options (có thể thêm UI để chọn sort)
      params.sortBy = 'created_at';
      params.sortOrder = 'DESC';

      const response = await apiService.getCTVJobs(params);
      if (response.success && response.data) {
        setResultCount(response.data.pagination?.total || 0);
        // Pass filters and results to parent
        if (onSearch) {
          onSearch(response.data.jobs || []);
        }
        if (onFiltersChange) {
          onFiltersChange(filters);
        }
      } else {
        // Nếu không có kết quả, vẫn truyền empty array
        setResultCount(0);
        if (onSearch) {
          onSearch([]);
        }
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      setResultCount(0);
      // Truyền empty array khi có lỗi
      if (onSearch) {
        onSearch([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setFilters({
      keyword: '',
      keywordMode: 'OR',
      locations: [],
      businessTypeIds: [],
      fieldIds: [],
      jobTypeIds: [],
      age: null,
      salaryMin: '',
      salaryMax: '',
      employmentType: null,
      visaType: null,
      highlights: [],
      booleans: {
        positionNoExpOk: false,
        industryNoExpOk: false,
        weekendOff: false,
        noExpOk: false,
      },
    });
  };

  const toggleLocation = (location) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location],
    }));
  };

  const toggleBusinessType = (businessTypeId) => {
    setFilters(prev => ({
      ...prev,
      businessTypeIds: prev.businessTypeIds.includes(businessTypeId)
        ? prev.businessTypeIds.filter(id => id !== businessTypeId)
        : [...prev.businessTypeIds, businessTypeId],
    }));
  };

  const toggleField = (fieldId) => {
    setFilters(prev => ({
      ...prev,
      fieldIds: prev.fieldIds.includes(fieldId)
        ? prev.fieldIds.filter(id => id !== fieldId)
        : [...prev.fieldIds, fieldId],
    }));
  };

  const toggleJobType = (jobTypeId) => {
    setFilters(prev => ({
      ...prev,
      jobTypeIds: prev.jobTypeIds.includes(jobTypeId)
        ? prev.jobTypeIds.filter(id => id !== jobTypeId)
        : [...prev.jobTypeIds, jobTypeId],
    }));
  };

  const toggleHighlight = (highlight) => {
    setFilters(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight],
    }));
  };

  const getSelectedBusinessTypeNames = () => {
    return filters.businessTypeIds
      .map(id => businessTypes.find(bt => bt.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getSelectedFieldNames = () => {
    return filters.fieldIds
      .map(id => availableFields.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getSelectedJobTypeNames = () => {
    return filters.jobTypeIds
      .map(id => availableJobTypes.find(jt => jt.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getSelectedHighlightsNames = () => {
    return filters.highlights.join(', ');
  };

  // Modal Component
  const MultiSelectModal = ({ 
    isOpen, 
    onClose, 
    title, 
    options, 
    selected, 
    onToggle,
    loading = false 
  }) => {
    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        onClick={onClose}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                {options.map((option) => {
                  const id = typeof option === 'string' ? option : option.id;
                  const name = typeof option === 'string' ? option : option.name;
                  const isSelected = selected.includes(id);
                  return (
                    <label
                      key={id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-900">{name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filter Block Component
  const FilterBlock = ({ 
    icon: Icon, 
    label, 
    children, 
    helperText,
    compact = false
  }) => (
    <div className={`flex ${compact ? 'gap-1.5' : 'gap-2'} min-w-0`}>
      <div className="flex-shrink-0 pt-0.5">
        <Icon className={compact ? "w-3 h-3 text-gray-600" : "w-4 h-4 text-gray-600"} />
      </div>
      <div className={`flex-1 ${compact ? 'space-y-0.5' : 'space-y-1'} min-w-0`}>
        <label className={compact ? "text-[10px] font-medium text-gray-700" : "text-xs font-medium text-gray-700"}>{label}</label>
        {children}
        {helperText && (
          <p className={compact ? "text-[10px] text-gray-500" : "text-xs text-gray-500"}>{helperText}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className={compact ? "w-full" : "w-full md:w-[600px]"}>
      {/* Header Navigation */}
      <HeaderNavigationButtons
        onSearchHistoryClick={() => setShowSearchHistoryModal(true)}
        onSavedCriteriaClick={() => setShowSavedCriteriaModal(true)}
        onSavedListClick={() => setShowSavedListModal(true)}
        compact={compact}
      />

      <div className={`bg-white ${compact ? 'rounded-lg' : 'rounded-2xl'} border border-gray-200 ${compact ? 'p-2' : 'p-4'} ${compact ? 'space-y-1.5' : 'space-y-2.5'}`}>
        {/* A. Freeword / Keyword */}
        <FilterBlock icon={Search} label={language === 'vi' ? 'Từ khóa' : language === 'en' ? 'Keyword' : 'フリーワード'} compact={compact}>
          <div className="relative">
            <div className={`absolute ${compact ? 'left-2' : 'left-3'} top-1/2 -translate-y-1/2 z-10`}>
              <div className="relative">
                <button
                  onClick={() => setShowKeywordMode(!showKeywordMode)}
                  className={`flex items-center gap-0.5 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'} ${compact ? 'text-[10px]' : 'text-xs'} font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors`}
                >
                  {filters.keywordMode}
                  <ChevronDown className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                </button>
                {showKeywordMode && (
                  <div className={`absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 ${compact ? 'min-w-[60px]' : 'min-w-[80px]'}`}>
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, keywordMode: 'OR' }));
                        setShowKeywordMode(false);
                      }}
                      className={`w-full ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs'} text-left hover:bg-gray-50`}
                    >
                      OR
                    </button>
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, keywordMode: 'AND' }));
                        setShowKeywordMode(false);
                      }}
                      className={`w-full ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs'} text-left hover:bg-gray-50`}
                    >
                      AND
                    </button>
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder={language === 'vi' ? 'ID, tên job, nội dung công việc…' : language === 'en' ? 'ID, job name, job description…' : 'ID、求人名、業務内容…'}
              className={`w-full ${compact ? 'pl-16 pr-2 py-1 text-[10px]' : 'pl-20 pr-4 py-2 text-xs'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </FilterBlock>

        {/* B. Địa điểm làm việc */}
        <FilterBlock icon={MapPin} label={language === 'vi' ? 'Địa điểm làm việc' : language === 'en' ? 'Work Location' : '勤務地'} compact={compact}>
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <input
              type="text"
              readOnly
              value={filters.locations.length > 0 ? filters.locations.join(', ') : ''}
              placeholder={language === 'vi' ? 'Chọn địa điểm làm việc' : language === 'en' ? 'Select work location' : '勤務地を選択'}
              className={`flex-1 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowLocationModal(true)}
            />
            <button
              onClick={() => setShowLocationModal(true)}
              className={`${compact ? 'px-1.5 py-1' : 'px-3 py-2'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              <Plus className={compact ? "w-3 h-3 text-gray-600" : "w-4 h-4 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* D. Loại hình kinh doanh */}
        <FilterBlock icon={Building2} label={language === 'vi' ? 'Loại hình kinh doanh' : language === 'en' ? 'Business Type' : '業種'} compact={compact}>
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <input
              type="text"
              readOnly
              value={getSelectedBusinessTypeNames() || ''}
              placeholder={language === 'vi' ? 'Chọn loại hình kinh doanh' : language === 'en' ? 'Select business type' : '業種を選択'}
              className={`flex-1 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowBusinessTypeModal(true)}
            />
            <button
              onClick={() => setShowBusinessTypeModal(true)}
              className={`${compact ? 'px-1.5 py-1' : 'px-3 py-2'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              <Plus className={compact ? "w-3 h-3 text-gray-600" : "w-4 h-4 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* E. Lĩnh vực */}
        <FilterBlock 
          icon={Briefcase} 
          label={language === 'vi' ? 'Lĩnh vực' : language === 'en' ? 'Field' : '分野'}
          helperText={filters.businessTypeIds.length === 0 ? (language === 'vi' ? 'Hãy chọn loại hình kinh doanh trước' : language === 'en' ? 'Please select business type first' : '業種を先に選択してください') : undefined}
          compact={compact}
        >
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <input
              type="text"
              readOnly
              value={getSelectedFieldNames() || ''}
              placeholder={language === 'vi' ? 'Chọn lĩnh vực' : language === 'en' ? 'Select field' : '分野を選択'}
              disabled={filters.businessTypeIds.length === 0}
              className={`flex-1 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg cursor-pointer ${
                filters.businessTypeIds.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50'
              }`}
              onClick={() => filters.businessTypeIds.length > 0 && setShowFieldModal(true)}
            />
            <button
              onClick={() => filters.businessTypeIds.length > 0 && setShowFieldModal(true)}
              disabled={filters.businessTypeIds.length === 0}
              className={`${compact ? 'px-1.5 py-1' : 'px-3 py-2'} border border-gray-300 rounded-lg transition-colors ${
                filters.businessTypeIds.length === 0 ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
              }`}
            >
              <Plus className={compact ? "w-3 h-3 text-gray-600" : "w-4 h-4 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* C. Loại công việc */}
        <FilterBlock 
          icon={Briefcase} 
          label={language === 'vi' ? 'Loại công việc' : language === 'en' ? 'Job Type' : '職種'}
          helperText={filters.fieldIds.length === 0 ? (language === 'vi' ? 'Hãy chọn lĩnh vực trước' : language === 'en' ? 'Please select field first' : '分野を先に選択してください') : undefined}
          compact={compact}
        >
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <input
              type="text"
              readOnly
              value={getSelectedJobTypeNames() || ''}
              placeholder={language === 'vi' ? 'Chọn loại công việc' : language === 'en' ? 'Select job type' : '職種を選択'}
              disabled={filters.fieldIds.length === 0}
              className={`flex-1 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg cursor-pointer ${
                filters.fieldIds.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50'
              }`}
              onClick={() => filters.fieldIds.length > 0 && setShowJobTypeModal(true)}
            />
            <button
              onClick={() => filters.fieldIds.length > 0 && setShowJobTypeModal(true)}
              disabled={filters.fieldIds.length === 0}
              className={`${compact ? 'px-1.5 py-1' : 'px-3 py-2'} border border-gray-300 rounded-lg transition-colors ${
                filters.fieldIds.length === 0 ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
              }`}
            >
              <Plus className={compact ? "w-3 h-3 text-gray-600" : "w-4 h-4 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* E. Tuổi */}
        <FilterBlock icon={Calendar} label={language === 'vi' ? 'Tuổi' : language === 'en' ? 'Age' : '年齢'} compact={compact}>
          <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
            <select
              value={filters.age || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value || null }))}
              className={`flex-1 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">{language === 'vi' ? 'Chọn tuổi' : language === 'en' ? 'Select age' : '選択'}</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
              <option value="35">35</option>
              <option value="40">40</option>
            </select>
            <span className={compact ? "text-[10px] text-gray-500 whitespace-nowrap" : "text-xs text-gray-500 whitespace-nowrap"}>
              {language === 'vi' ? 'tuổi có thể ứng tuyển' : language === 'en' ? 'years old' : '歳で応募可能'}
            </span>
          </div>
        </FilterBlock>

        {/* F. Range lương */}
        <FilterBlock icon={DollarSign} label={language === 'vi' ? 'Range lương' : language === 'en' ? 'Salary Range' : '給与範囲'} compact={compact}>
          <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'} min-w-0 overflow-x-auto`}>
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value ? Number(e.target.value) : '' }))}
              placeholder={language === 'vi' ? 'Từ' : language === 'en' ? 'From' : 'から'}
              className={`flex-1 min-w-0 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <span className="text-gray-500 flex-shrink-0">{compact ? '~' : '~'}</span>
            <input
              type="number"
              value={filters.salaryMax}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value ? Number(e.target.value) : '' }))}
              placeholder={language === 'vi' ? 'Đến' : language === 'en' ? 'To' : 'まで'}
              className={`flex-1 min-w-0 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <span className={compact ? "text-[10px] text-gray-500 whitespace-nowrap flex-shrink-0" : "text-xs text-gray-500 whitespace-nowrap flex-shrink-0"}>
              {language === 'vi' ? 'triệu' : language === 'en' ? 'million' : '万円'}
            </span>
          </div>
        </FilterBlock>

        {/* G. Hình thức tuyển dụng */}
        <FilterBlock icon={FileText} label={language === 'vi' ? 'Hình thức tuyển dụng' : language === 'en' ? 'Employment Type' : '雇用形態'} compact={compact}>
          <select
            value={filters.employmentType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value || null }))}
            className={`w-full ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">{language === 'vi' ? 'Chọn hình thức' : language === 'en' ? 'Select type' : '選択'}</option>
            {mockEmploymentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </FilterBlock>

        {/* H. Visa */}
        <FilterBlock icon={Globe} label={language === 'vi' ? 'Visa' : language === 'en' ? 'Visa' : 'ビザ'} compact={compact}>
          <select
            value={filters.visaType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, visaType: e.target.value || null }))}
            className={`w-full ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">{language === 'vi' ? 'Chọn loại visa' : language === 'en' ? 'Select visa type' : '選択'}</option>
            {mockVisaTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </FilterBlock>

        {/* I. Điểm nổi bật */}
        <FilterBlock icon={Star} label={language === 'vi' ? 'Điểm nổi bật của job' : language === 'en' ? 'Job Highlights' : '求人の特徴'} compact={compact}>
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <input
              type="text"
              readOnly
              value={getSelectedHighlightsNames() || ''}
              placeholder={language === 'vi' ? 'Chọn điểm nổi bật' : language === 'en' ? 'Select highlights' : '特徴を選択'}
              className={`flex-1 ${compact ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowHighlightModal(true)}
            />
            <button
              onClick={() => setShowHighlightModal(true)}
              className={`${compact ? 'px-1.5 py-1' : 'px-3 py-2'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`}
            >
              <Plus className={compact ? "w-3 h-3 text-gray-600" : "w-4 h-4 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* J. Nhóm checkbox Yes/No */}
        <FilterBlock icon={CheckSquare} label={language === 'vi' ? 'Điều kiện' : language === 'en' ? 'Conditions' : '条件'} compact={compact}>
          <div className={`grid grid-cols-2 ${compact ? 'gap-1' : 'gap-2'}`}>
            <label className={`flex items-center ${compact ? 'gap-1 p-1' : 'gap-1.5 p-1.5'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.positionNoExpOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, positionNoExpOk: e.target.checked }
                }))}
                className={compact ? "w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" : "w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"}
              />
              <span className={compact ? "text-[10px] text-gray-700" : "text-xs text-gray-700"}>
                {language === 'vi' ? 'Chưa kinh nghiệm vị trí OK' : language === 'en' ? 'No position exp OK' : '未経験職種OK'}
              </span>
            </label>
            <label className={`flex items-center ${compact ? 'gap-1 p-1' : 'gap-1.5 p-1.5'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.industryNoExpOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, industryNoExpOk: e.target.checked }
                }))}
                className={compact ? "w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" : "w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"}
              />
              <span className={compact ? "text-[10px] text-gray-700" : "text-xs text-gray-700"}>
                {language === 'vi' ? 'Chưa kinh nghiệm ngành OK' : language === 'en' ? 'No industry exp OK' : '未経験業種OK'}
              </span>
            </label>
            <label className={`flex items-center ${compact ? 'gap-1 p-1' : 'gap-1.5 p-1.5'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.weekendOff}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, weekendOff: e.target.checked }
                }))}
                className={compact ? "w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" : "w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"}
              />
              <span className={compact ? "text-[10px] text-gray-700" : "text-xs text-gray-700"}>
                {language === 'vi' ? 'Nghỉ T7-CN' : language === 'en' ? 'Weekend off' : '土日祝休み'}
              </span>
            </label>
            <label className={`flex items-center ${compact ? 'gap-1 p-1' : 'gap-1.5 p-1.5'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.noExpOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, noExpOk: e.target.checked }
                }))}
                className={compact ? "w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500" : "w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"}
              />
              <span className={compact ? "text-[10px] text-gray-700" : "text-xs text-gray-700"}>
                {language === 'vi' ? 'Hoàn toàn chưa kinh nghiệm OK' : language === 'en' ? 'No experience OK' : '完全未経験OK'}
              </span>
            </label>
          </div>
        </FilterBlock>

        {/* Buttons Row */}
        <div className={compact ? "space-y-0.5" : "space-y-1"}>
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <button
              onClick={handleClearAll}
              className={`flex-1 ${compact ? 'py-1 px-2 text-[10px]' : 'py-1.5 px-4 text-xs'} font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors`}
            >
              {language === 'vi' ? 'Xóa tất cả' : language === 'en' ? 'Clear All' : 'すべてクリア'}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`flex-1 ${compact ? 'h-8' : 'h-11'} bg-yellow-400 hover:bg-yellow-500 rounded-lg flex items-center justify-center ${compact ? 'gap-1' : 'gap-2'} transition-colors shadow-md ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <RotateCw className={compact ? "w-3 h-3 text-gray-900 animate-spin" : "w-4 h-4 text-gray-900 animate-spin"} />
              ) : (
                <Search className={compact ? "w-3 h-3 text-gray-900" : "w-4 h-4 text-gray-900"} />
              )}
              <span className={compact ? "text-[10px] font-semibold text-gray-900" : "text-sm font-semibold text-gray-900"}>
                {language === 'vi' ? 'Tìm kiếm' : language === 'en' ? 'Search' : '検索'}
              </span>
            </button>
          </div>
          <p className={`text-center ${compact ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
            {language === 'vi' 
              ? `Tìm kiếm ${resultCount.toLocaleString('vi-VN')} kết quả`
              : language === 'en'
              ? `Search ${resultCount.toLocaleString()} results`
              : `${resultCount.toLocaleString('ja-JP')} 件を検索`
            }
          </p>
        </div>
      </div>

      {/* Modals */}
      <MultiSelectModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title={language === 'vi' ? 'Chọn địa điểm làm việc' : language === 'en' ? 'Select Work Location' : '勤務地を選択'}
        options={locations}
        selected={filters.locations}
        onToggle={toggleLocation}
      />

      <MultiSelectModal
        isOpen={showBusinessTypeModal}
        onClose={() => setShowBusinessTypeModal(false)}
        title={language === 'vi' ? 'Chọn loại hình kinh doanh' : language === 'en' ? 'Select Business Type' : '業種を選択'}
        options={businessTypes}
        selected={filters.businessTypeIds}
        onToggle={toggleBusinessType}
        loading={loading}
      />

      <MultiSelectModal
        isOpen={showFieldModal}
        onClose={() => setShowFieldModal(false)}
        title={language === 'vi' ? 'Chọn lĩnh vực' : language === 'en' ? 'Select Field' : '分野を選択'}
        options={availableFields}
        selected={filters.fieldIds}
        onToggle={toggleField}
        loading={loadingFields}
      />

      <MultiSelectModal
        isOpen={showJobTypeModal}
        onClose={() => setShowJobTypeModal(false)}
        title={language === 'vi' ? 'Chọn loại công việc' : language === 'en' ? 'Select Job Type' : '職種を選択'}
        options={availableJobTypes}
        selected={filters.jobTypeIds}
        onToggle={toggleJobType}
        loading={loadingJobTypes}
      />

      <MultiSelectModal
        isOpen={showHighlightModal}
        onClose={() => setShowHighlightModal(false)}
        title={language === 'vi' ? 'Chọn điểm nổi bật' : language === 'en' ? 'Select Highlights' : '特徴を選択'}
        options={mockHighlights}
        selected={filters.highlights}
        onToggle={toggleHighlight}
      />

      {/* Search History Modal */}
      <SlideInModal
        isOpen={showSearchHistoryModal}
        onClose={() => setShowSearchHistoryModal(false)}
        title="Lịch sử tìm kiếm"
      >
        <SearchHistoryContent />
      </SlideInModal>

      {/* Saved Criteria Modal */}
      <SlideInModal
        isOpen={showSavedCriteriaModal}
        onClose={() => setShowSavedCriteriaModal(false)}
        title="Tiêu chí tìm kiếm đã lưu"
      >
        <SavedCriteriaContent />
      </SlideInModal>

      {/* Saved List Modal */}
      <SlideInModal
        isOpen={showSavedListModal}
        onClose={() => setShowSavedListModal(false)}
        title="Danh sách lưu giữ"
      >
        <SavedListContent />
      </SlideInModal>
    </div>
  );
};

// Slide In Modal Component
const SlideInModal = ({ isOpen, onClose, title, children }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after mount
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          backgroundColor: isAnimating ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0)',
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={`fixed inset-y-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '40vw' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// Search History Content
const SearchHistoryContent = () => {
  const mockHistory = [
    {
      id: 1,
      keyword: 'Thợ cơ khí',
      operator: 'AND',
      date: '2026/01/17 22:46',
      filters: [
        { type: 'Địa điểm', value: '17', hasInfo: true },
        { type: 'Ngành công nghiệp', value: '4', hasInfo: true },
        { type: 'Thu nhập hàng năm tối thiểu', value: '0 ~ 9 triệu' },
        { type: 'Quốc tịch', value: 'Không có quốc tịch' },
      ],
    },
    {
      id: 2,
      keyword: 'Thợ cơ khí',
      operator: 'AND',
      date: '2026/01/17 22:45',
      filters: [
        { type: 'Địa điểm', value: '17', hasInfo: true },
        { type: 'Thu nhập hàng năm tối thiểu', value: '0 ~ 9 triệu' },
        { type: 'Quốc tịch', value: 'Không có quốc tịch' },
      ],
    },
    {
      id: 3,
      keyword: 'Thợ cơ khí',
      operator: 'OR',
      date: '2026/01/17 22:44',
      filters: [
        { type: 'Quốc tịch', value: 'Không có quốc tịch' },
      ],
    },
    {
      id: 4,
      keyword: 'Thợ cơ khí',
      operator: 'OR',
      date: '2026/01/17 22:44',
      filters: [],
    },
    {
      id: 5,
      keyword: '00020436',
      operator: 'OR',
      date: '2026/01/17 22:40',
      filters: [],
    },
    {
      id: 6,
      keyword: '00207324-33098 | 00263088-e31f0 | 00216307-05490',
      operator: 'OR',
      date: '2026/01/17 15:53',
      filters: [],
    },
    {
      id: 7,
      keyword: '00245670-a7bb3',
      operator: 'OR',
      date: '2026/01/16 18:56',
      filters: [],
    },
    {
      id: 8,
      keyword: 'REVIT',
      operator: 'OR',
      date: '2026/01/16 18:27',
      filters: [
        { type: 'Địa điểm', value: '3', hasInfo: true },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <div className="bg-blue-500 rounded-full p-1 flex-shrink-0 mt-0.5">
          <Info className="w-3 h-3 text-white" />
        </div>
        <p className="text-xs text-blue-900">
          50 tiêu chí tìm kiếm gần đây nhất được hiển thị.
        </p>
      </div>

      {/* Search History List */}
      <div className="space-y-3">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-gray-200 rounded-lg bg-white"
          >
            <div className="flex items-start gap-3">
              {/* Main Content */}
              <div className="flex-1 space-y-2">
                {/* Keyword and Operator */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{item.keyword}</span>
                  <span className="text-sm text-gray-600">
                    {item.operator === 'AND' ? 'VÀ Tìm kiếm' : 'HOẶC Tìm kiếm'}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày tìm kiếm {item.date}</span>
                </div>

                {/* Filters */}
                {item.filters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.filters.map((filter, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs text-gray-700"
                      >
                        <span>
                          {filter.type} {filter.value}
                        </span>
                        {filter.hasInfo && (
                          <Info className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0">
                <Search className="w-4 h-4" />
                <span>Tìm kiếm theo tiêu chí này</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Saved Criteria Content
const SavedCriteriaContent = () => {
  const mockSavedCriteria = [
    { 
      id: 1, 
      name: 'Tìm kiếm IT Tokyo', 
      filters: [
        { type: 'Từ khóa', value: 'Kỹ sư IT' },
        { type: 'Địa điểm', value: 'Tokyo' },
        { type: 'Lương', value: '> 500 triệu' },
      ],
      savedDate: '2026/01/17 10:30',
    },
    { 
      id: 2, 
      name: 'Việc làm không cần kinh nghiệm', 
      filters: [
        { type: 'Kinh nghiệm', value: 'Chưa có kinh nghiệm' },
        { type: 'Địa điểm', value: 'Toàn quốc' },
      ],
      savedDate: '2026/01/16 14:20',
    },
    { 
      id: 3, 
      name: 'Công việc remote', 
      filters: [
        { type: 'Hình thức', value: 'Làm việc từ xa' },
        { type: 'Ngành', value: 'IT' },
      ],
      savedDate: '2026/01/15 09:15',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <div className="bg-blue-500 rounded-full p-1 flex-shrink-0 mt-0.5">
          <Info className="w-3 h-3 text-white" />
        </div>
        <p className="text-xs text-blue-900">
          Các tiêu chí tìm kiếm đã lưu của bạn.
        </p>
      </div>

      {/* Saved Criteria List */}
      <div className="space-y-3">
        {mockSavedCriteria.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-gray-200 rounded-lg bg-white"
          >
            <div className="flex items-start gap-3">
              {/* Main Content */}
              <div className="flex-1 space-y-2">
                {/* Name and Delete */}
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <button className="text-red-500 hover:text-red-700 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Đã lưu: {item.savedDate}</span>
                </div>

                {/* Filters */}
                {item.filters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.filters.map((filter, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs text-gray-700"
                      >
                        <span>
                          {filter.type}: {filter.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0">
                <Search className="w-4 h-4" />
                <span>Áp dụng tiêu chí này</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Current Criteria Button */}
      <button className="w-full py-3 text-xs text-blue-600 hover:text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        + Lưu tiêu chí hiện tại
      </button>
    </div>
  );
};

// Saved List Content
const SavedListContent = () => {
  const mockSavedJobs = [
    { 
      id: 1, 
      title: 'Kỹ sư phần mềm', 
      company: 'Công ty ABC', 
      jobId: '00304192-9fcd0',
      savedDate: '2026/01/17 10:30',
    },
    { 
      id: 2, 
      title: 'Quản lý dự án', 
      company: 'Công ty XYZ', 
      jobId: '00180228-54b9a',
      savedDate: '2026/01/16 14:20',
    },
    { 
      id: 3, 
      title: 'Nhân viên bán hàng', 
      company: 'Công ty DEF', 
      jobId: '00245670-a7bb3',
      savedDate: '2026/01/15 09:15',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <div className="bg-blue-500 rounded-full p-1 flex-shrink-0 mt-0.5">
          <Info className="w-3 h-3 text-white" />
        </div>
        <p className="text-xs text-blue-900">
          <span className="font-semibold">61</span> công việc đã lưu trong danh sách của bạn.
        </p>
      </div>

      {/* Saved Jobs List */}
      <div className="space-y-3">
        {mockSavedJobs.map((job) => (
          <div
            key={job.id}
            className="p-4 border border-gray-200 rounded-lg bg-white"
          >
            <div className="flex items-start gap-3">
              {/* Main Content */}
              <div className="flex-1 space-y-2">
                {/* Title and Heart */}
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <button className="text-red-500 hover:text-red-700 p-1">
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>

                {/* Company */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>

                {/* Job ID */}
                <div className="text-[10px] text-gray-500">
                  Mã việc làm: {job.jobId}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Đã lưu: {job.savedDate}</span>
                </div>
              </div>

              {/* View Detail Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium whitespace-nowrap flex-shrink-0">
                <Search className="w-4 h-4" />
                <span>Xem chi tiết</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full py-3 text-xs text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
        Xem tất cả 61 công việc
      </button>
    </div>
  );
};

export default AgentJobsPageSession1;

