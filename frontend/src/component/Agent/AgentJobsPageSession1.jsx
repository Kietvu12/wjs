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

// Dữ liệu quốc gia và tỉnh/thành phố
const countryProvincesData = {
  'Vietnam': [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu',
    'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương',
    'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
    'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
    'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
    'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh',
    'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
    'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ],
  'Japan': [
    'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki',
    'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu',
    'Shizuoka', 'Sagamihara', 'Okayama', 'Kumamoto', 'Kagoshima', 'Utsunomiya', 'Hachioji',
    'Matsuyama', 'Kanazawa', 'Nagano', 'Toyama', 'Gifu', 'Fukushima', 'Mito', 'Akita', 'Aomori',
    'Morioka', 'Yamagata', 'Fukui', 'Tottori', 'Matsue', 'Kofu', 'Maebashi', 'Takamatsu',
    'Tokushima', 'Kochi', 'Miyazaki', 'Naha', 'Okinawa'
  ]
};

const mockEmploymentTypes = [
  'Nhân viên chính thức',
  'Nhân viên hợp đồng',
  'Bán thời gian / Thời vụ',
  'Nhân viên tạm thời',
  'Ủy thác công việc',
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
        <div className="flex items-center gap-0">
          <button
            onClick={onSearchHistoryClick}
            className="flex items-center gap-1.5 px-2 py-1.5 transition-colors justify-center text-xs hover:bg-gray-50"
          >
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-blue-900 truncate">Lịch sử</span>
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            onClick={onSavedCriteriaClick}
            className="flex items-center gap-1.5 px-2 py-1.5 transition-colors justify-center text-xs hover:bg-gray-50"
          >
            <Bookmark className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-blue-900 truncate">Tiêu chí đã lưu</span>
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            onClick={onSavedListClick}
            className="flex items-center gap-1.5 px-2 py-1.5 transition-colors justify-center text-xs hover:bg-gray-50"
          >
            <Heart className="w-4 h-4 text-red-500" />
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
          className="flex items-center gap-2 px-4 py-2 transition-colors justify-center hover:bg-gray-50"
        >
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-medium text-blue-900 whitespace-nowrap">Lịch sử tìm kiếm</span>
        </button>
        <span className="text-gray-300 text-sm">|</span>
        <button
          onClick={onSavedCriteriaClick}
          className="flex items-center gap-2 px-4 py-2 transition-colors justify-center hover:bg-gray-50"
        >
          <Bookmark className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-medium text-blue-900 whitespace-nowrap">Tiêu chí tìm kiếm đã lưu</span>
        </button>
        <span className="text-gray-300 text-sm">|</span>
        <button
          onClick={onSavedListClick}
          className="flex items-center gap-2 px-4 py-2 transition-colors justify-center hover:bg-gray-50"
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
    locations: [], // Array of { country: string, location: string }
    fieldIds: [], // Lĩnh vực
    jobTypeIds: [], // Loại công việc
    age: null,
    salaryMin: '',
    salaryMax: '',
    employmentType: null,
    highlights: [],
    booleans: {
      positionNoExpOk: false,
      industryNoExpOk: false,
      weekendOff: false,
      noExpOk: false,
    },
  });

  const [showKeywordMode, setShowKeywordMode] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false); // Show both modals together
  const [selectedCountries, setSelectedCountries] = useState([]); // Array of selected countries

  // Sync selectedCountries with filters.locations when modal opens
  useEffect(() => {
    if (showLocationModal) {
      const countries = new Set();
      filters.locations.forEach(loc => {
        if (loc.country) countries.add(loc.country);
      });
      setSelectedCountries(Array.from(countries));
    }
  }, [showLocationModal]);
  const [showFieldJobTypeModal, setShowFieldJobTypeModal] = useState(false); // Dual modal for field and job type
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingJobTypes, setLoadingJobTypes] = useState(false);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableJobTypes, setAvailableJobTypes] = useState([]); // All job types with parentId
  const [categoryTree, setCategoryTree] = useState([]); // Full category tree for nested display
  const [selectedFields, setSelectedFields] = useState([]); // Selected fields for dual modal
  const [resultCount, setResultCount] = useState(0);
  const [locations, setLocations] = useState([]); // Địa điểm làm việc
  const [loading, setLoading] = useState(false);
  
  // New modal states
  const [showSearchHistoryModal, setShowSearchHistoryModal] = useState(false);
  const [showSavedCriteriaModal, setShowSavedCriteriaModal] = useState(false);
  const [showSavedListModal, setShowSavedListModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadCategoryTree();
    loadLocations();
  }, []);

  // Load category tree (full hierarchy)
  const loadCategoryTree = async () => {
    try {
      setLoadingFields(true);
      setLoadingJobTypes(true);
      
      // Try to get tree structure first (if available)
      try {
        const treeResponse = await apiService.getCTVJobCategoryTree();
        if (treeResponse.success && treeResponse.data?.tree) {
          const tree = treeResponse.data.tree;
          setCategoryTree(tree);
          
          // Extract fields (categories with parentId = null)
          const flattenTree = (categories, level = 0) => {
            let result = [];
            categories.forEach(cat => {
              result.push({
                ...cat,
          id: String(cat.id),
                level: level,
                parentId: cat.parentId ? String(cat.parentId) : null
              });
              if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenTree(cat.children, level + 1));
              }
            });
            return result;
          };
          
          const allCategories = flattenTree(tree);
          const fields = allCategories.filter(cat => !cat.parentId);
          const jobTypes = allCategories.filter(cat => cat.parentId);
          
          setAvailableFields(fields.map(cat => ({
            id: cat.id,
            name: cat.name,
            level: cat.level
        })));
          
          setAvailableJobTypes(jobTypes.map(cat => ({
            id: cat.id,
            name: cat.name,
            parentId: cat.parentId,
            level: cat.level
          })));
          
          return;
        }
      } catch (treeError) {
        console.log('Tree API not available, falling back to flat list');
      }
      
      // Fallback: Load flat list
      try {
        const response = await apiService.getJobCategories({ status: 1 });
        if (response.success && response.data?.categories) {
          const allCategories = response.data.categories.map(cat => ({
            id: String(cat.id),
            name: cat.name,
            parentId: cat.parentId ? String(cat.parentId) : null
          }));
          
          const fields = allCategories.filter(cat => !cat.parentId);
          const jobTypes = allCategories.filter(cat => cat.parentId);
          
          setAvailableFields(fields);
          setAvailableJobTypes(jobTypes);
          setCategoryTree(fields); // Simple tree structure
        }
      } catch (categoryError) {
        // If 403 Forbidden or other error, just continue without categories
        // This allows the component to work for users without category access
        console.log('Cannot load job categories (may not have permission):', categoryError);
        setAvailableFields([]);
        setAvailableJobTypes([]);
        setCategoryTree([]);
      }
    } catch (error) {
      console.error('Error loading category tree:', error);
      // Set empty arrays to allow component to continue working
      setAvailableFields([]);
      setAvailableJobTypes([]);
      setCategoryTree([]);
    } finally {
      setLoadingFields(false);
      setLoadingJobTypes(false);
    }
  };

  // Helper: Find all descendants of a category (including nested children)
  const findAllDescendants = (categoryId, tree = categoryTree) => {
    const result = [];
    
    const findInTree = (categories, targetId) => {
      for (const cat of categories) {
        if (cat.id === String(targetId) || cat.id === targetId) {
          // Found the category, add all its descendants
          const addDescendants = (children) => {
            children.forEach(child => {
              result.push(String(child.id));
              if (child.children && child.children.length > 0) {
                addDescendants(child.children);
              }
            });
          };
          if (cat.children && cat.children.length > 0) {
            addDescendants(cat.children);
          }
          return true;
        }
        if (cat.children && cat.children.length > 0) {
          if (findInTree(cat.children, targetId)) {
            return true;
          }
        }
      }
      return false;
    };
    
    findInTree(tree, categoryId);
    return result;
  };

  // Sync selectedFields with filters.fieldIds when modal opens
  useEffect(() => {
    if (showFieldJobTypeModal) {
      setSelectedFields(filters.fieldIds);
    }
  }, [showFieldJobTypeModal]);

  // Get job types for selected fields (including nested descendants)
  const getJobTypesForSelectedFields = () => {
    const allDescendantIds = new Set();
    
    selectedFields.forEach(fieldId => {
      // Get direct children
      const directChildren = availableJobTypes.filter(jt => jt.parentId === fieldId);
      directChildren.forEach(jt => allDescendantIds.add(jt.id));
      
      // Get nested descendants from tree
      const nestedDescendants = findAllDescendants(fieldId);
      nestedDescendants.forEach(id => allDescendantIds.add(id));
    });
    
    return availableJobTypes.filter(jt => allDescendantIds.has(jt.id));
  };

  // Load locations from jobs (working locations)
  const loadLocations = async () => {
    try {
      // Load jobs to extract unique locations
      const response = useAdminAPI 
        ? await apiService.getAdminJobs({ limit: 1000, status: 1 })
        : await apiService.getCTVJobs({ limit: 1000, status: 1 });
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

      // Category filter - ưu tiên jobTypeIds (Loại công việc), sau đó fieldIds (Lĩnh vực)
      // Filter theo job_category_id trong bảng jobs
      if (filters.jobTypeIds.length > 0) {
        // Nếu có nhiều job types, lấy đầu tiên (API chỉ hỗ trợ 1 jobCategoryId)
        params.jobCategoryId = parseInt(filters.jobTypeIds[0]);
      } else if (filters.fieldIds.length > 0) {
        // Nếu không có job type, dùng field (Lĩnh vực)
        params.jobCategoryId = parseInt(filters.fieldIds[0]);
      }

      // Location filter - có thể gửi nhiều location hoặc chỉ lấy đầu tiên
      // API hiện tại chỉ hỗ trợ 1 location, nên lấy đầu tiên
      if (filters.locations.length > 0) {
        // locations is now array of { country, location }
        const firstLocation = filters.locations[0];
        params.location = typeof firstLocation === 'string' 
          ? firstLocation 
          : firstLocation.location;
      }

      // Salary filters - range lương
      if (filters.salaryMin) {
        params.minSalary = parseFloat(filters.salaryMin);
      }

      if (filters.salaryMax) {
        params.maxSalary = parseFloat(filters.salaryMax);
      }

      // Hot jobs filter (nếu có highlight "Hot" hoặc checkbox nào đó)
      // Có thể thêm logic để set isHot dựa trên filters.booleans hoặc highlights

      // Sort options (có thể thêm UI để chọn sort)
      params.sortBy = 'created_at';
      params.sortOrder = 'DESC';

      const response = useAdminAPI 
        ? await apiService.getAdminJobs(params)
        : await apiService.getCTVJobs(params);
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
      fieldIds: [],
      jobTypeIds: [],
      age: null,
      salaryMin: '',
      salaryMax: '',
      employmentType: null,
      highlights: [],
      booleans: {
        positionNoExpOk: false,
        industryNoExpOk: false,
        weekendOff: false,
        noExpOk: false,
      },
    });
  };

  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      if (prev.includes(country)) {
        // Remove country and all its locations
        const newCountries = prev.filter(c => c !== country);
        setFilters(prevFilters => ({
          ...prevFilters,
          locations: prevFilters.locations.filter(loc => loc.country !== country)
        }));
        return newCountries;
      } else {
        // Add country
        return [...prev, country];
      }
    });
  };

  const toggleLocation = (location, country) => {
    setFilters(prev => {
      const existingIndex = prev.locations.findIndex(
        loc => loc.country === country && loc.location === location
      );
      
      if (existingIndex >= 0) {
        // Remove location
        return {
      ...prev,
          locations: prev.locations.filter((_, index) => index !== existingIndex)
        };
      } else {
        // Add location
        return {
          ...prev,
          locations: [...prev.locations, { country, location }]
        };
      }
    });
  };

  // Get all provinces from selected countries
  const getAvailableProvinces = () => {
    const allProvinces = [];
    selectedCountries.forEach(country => {
      if (countryProvincesData[country]) {
        countryProvincesData[country].forEach(province => {
          allProvinces.push({ country, location: province });
        });
      }
    });
    return allProvinces;
  };

  const getSelectedLocationsDisplay = () => {
    if (filters.locations.length === 0) return '';
    
    // Group by country
    const byCountry = {};
    filters.locations.forEach(loc => {
      if (!byCountry[loc.country]) {
        byCountry[loc.country] = [];
      }
      byCountry[loc.country].push(loc.location);
    });
    
    // Format: "Vietnam: Hà Nội, Hồ Chí Minh; Japan: Tokyo, Osaka"
    return Object.entries(byCountry)
      .map(([country, locations]) => `${country}: ${locations.join(', ')}`)
      .join('; ');
  };

  const toggleField = (fieldId) => {
    setSelectedFields(prev => {
      const newFields = prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId];
      
      // Update filters.fieldIds
      setFilters(prevFilters => {
        // Remove job types that belong to removed fields
        const newJobTypeIds = prevFilters.jobTypeIds.filter(jtId => {
          const jobType = availableJobTypes.find(jt => jt.id === jtId);
          return jobType && newFields.includes(jobType.parentId);
        });
        
        return {
          ...prevFilters,
          fieldIds: newFields,
          jobTypeIds: newJobTypeIds
        };
      });
      
      return newFields;
    });
  };

  const toggleJobType = (jobTypeId) => {
    setFilters(prev => {
      const existingIndex = prev.jobTypeIds.findIndex(id => id === jobTypeId);
      
      if (existingIndex >= 0) {
        // Remove job type
        return {
      ...prev,
          jobTypeIds: prev.jobTypeIds.filter((_, index) => index !== existingIndex)
        };
      } else {
        // Add job type
        return {
          ...prev,
          jobTypeIds: [...prev.jobTypeIds, jobTypeId]
        };
      }
    });
  };


  const toggleHighlight = (highlight) => {
    setFilters(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight],
    }));
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
    loading = false,
    isSingleSelect = false
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
            ) : options.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'vi' ? 'Không có dữ liệu' : language === 'en' ? 'No data' : 'データなし'}
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option) => {
                  const id = typeof option === 'string' ? option : option.id;
                  const name = typeof option === 'string' ? option : option.name;
                  const isSelected = selected.includes(id);
                  
                  if (isSingleSelect) {
                    // Single select: click to select and close
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          onToggle(id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer text-left transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-900">{name}</span>
                      </button>
                    );
                  }
                  
                  // Multi select: checkbox
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
          {!isSingleSelect && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
            </button>
          </div>
          )}
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
    <div className={`flex ${compact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'} min-w-0`}>
      <div className="flex-shrink-0 pt-0.5">
        <Icon className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-gray-600" : "w-5 h-5 text-gray-600"} />
      </div>
      <div className={`flex-1 ${compact ? 'space-y-0.5' : 'space-y-1'} min-w-0`}>
        <label className={compact ? "text-xs sm:text-sm font-medium text-gray-700" : "text-sm font-medium text-gray-700"}>{label}</label>
        {children}
        {helperText && (
          <p className={compact ? "text-xs text-gray-500" : "text-sm text-gray-500"}>{helperText}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
      <div className={`${compact ? "w-full h-full lg:h-full flex flex-col" : "w-full sm:w-[400px] md:w-[500px] h-full flex flex-col"}`}>
        {/* Header Navigation */}
        <div className="flex-shrink-0 mb-1 sm:mb-2">
          <HeaderNavigationButtons
            onSearchHistoryClick={() => setShowSearchHistoryModal(true)}
            onSavedCriteriaClick={() => setShowSavedCriteriaModal(true)}
            onSavedListClick={() => setShowSavedListModal(true)}
            compact={compact}
          />
        </div>

      <div className={`flex-1 flex flex-col bg-white ${compact ? 'rounded-lg' : 'rounded-2xl'} border border-gray-200 overflow-hidden min-h-0`}>
        {/* Scrollable Form Content */}
        <div className={`flex-1 overflow-y-auto ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4 md:p-5'} ${compact ? 'space-y-2 sm:space-y-2.5' : 'space-y-3 sm:space-y-4'} custom-scrollbar min-h-0`}>
          {/* A. Freeword / Keyword */}
        <FilterBlock icon={Search} label={language === 'vi' ? 'Từ khóa' : language === 'en' ? 'Keyword' : 'フリーワード'} compact={compact}>
          <div className="relative">
            <div className={`absolute ${compact ? 'left-2' : 'left-3'} top-1/2 -translate-y-1/2 z-10`}>
              <div className="relative">
                <button
                  onClick={() => setShowKeywordMode(!showKeywordMode)}
                  className={`flex items-center gap-0.5 ${compact ? 'px-2 py-1 sm:px-2.5 sm:py-1.5' : 'px-3 py-1.5'} ${compact ? 'text-xs sm:text-sm' : 'text-sm'} font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors`}
                >
                  {filters.keywordMode}
                  <ChevronDown className={compact ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-4 h-4"} />
                </button>
                {showKeywordMode && (
                  <div className={`absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 ${compact ? 'min-w-[70px] sm:min-w-[80px]' : 'min-w-[90px]'}`}>
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, keywordMode: 'OR' }));
                        setShowKeywordMode(false);
                      }}
                      className={`w-full ${compact ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-4 py-2 text-sm'} text-left hover:bg-gray-50`}
                    >
                      OR
                    </button>
                    <button
                      onClick={() => {
                        setFilters(prev => ({ ...prev, keywordMode: 'AND' }));
                        setShowKeywordMode(false);
                      }}
                      className={`w-full ${compact ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-4 py-2 text-sm'} text-left hover:bg-gray-50`}
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
              className={`w-full ${compact ? 'pl-20 sm:pl-22 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm' : 'pl-24 pr-5 py-3 text-sm'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </FilterBlock>

        {/* B. Địa điểm làm việc */}
        <FilterBlock icon={MapPin} label={language === 'vi' ? 'Địa điểm làm việc' : language === 'en' ? 'Work Location' : '勤務地'} compact={compact}>
          <div className={`flex ${compact ? 'gap-1 sm:gap-1.5' : 'gap-2'} items-center`}>
            <input
              type="text"
              readOnly
              value={getSelectedLocationsDisplay()}
              placeholder={language === 'vi' ? 'Chọn địa điểm làm việc' : language === 'en' ? 'Select work location' : '勤務地を選択'}
              className={`flex-1 ${compact ? 'px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowCountryModal(true)}
            />
            <button
              onClick={() => setShowLocationModal(true)}
              className={`${compact ? 'px-2 sm:px-2.5 py-2 sm:py-2.5' : 'px-4 py-3'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0`}
            >
              <Plus className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-gray-600" : "w-5 h-5 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* D. Lĩnh vực */}
        <FilterBlock 
          icon={Briefcase} 
          label={language === 'vi' ? 'Lĩnh vực' : language === 'en' ? 'Field' : '分野'}
          compact={compact}
        >
          <div className={`flex ${compact ? 'gap-1 sm:gap-1.5' : 'gap-2'} items-center`}>
            <input
              type="text"
              readOnly
              value={getSelectedFieldNames() || ''}
              placeholder={language === 'vi' ? 'Chọn lĩnh vực' : language === 'en' ? 'Select field' : '分野を選択'}
              className={`flex-1 ${compact ? 'px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowFieldJobTypeModal(true)}
            />
            <button
              onClick={() => setShowFieldJobTypeModal(true)}
              className={`${compact ? 'px-2 sm:px-2.5 py-2 sm:py-2.5' : 'px-4 py-3'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0`}
            >
              <Plus className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-gray-600" : "w-5 h-5 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* C. Loại công việc */}
        <FilterBlock 
          icon={Briefcase} 
          label={language === 'vi' ? 'Loại công việc' : language === 'en' ? 'Job Type' : '職種'}
          compact={compact}
        >
          <div className={`flex ${compact ? 'gap-1 sm:gap-1.5' : 'gap-2'} items-center`}>
            <input
              type="text"
              readOnly
              value={getSelectedJobTypeNames() || ''}
              placeholder={language === 'vi' ? 'Chọn loại công việc' : language === 'en' ? 'Select job type' : '職種を選択'}
              className={`flex-1 ${compact ? 'px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowFieldJobTypeModal(true)}
            />
            <button
              onClick={() => setShowFieldJobTypeModal(true)}
              className={`${compact ? 'px-2 sm:px-2.5 py-2 sm:py-2.5' : 'px-4 py-3'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0`}
            >
              <Plus className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-gray-600" : "w-5 h-5 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* E. Tuổi */}
        <FilterBlock icon={Calendar} label={language === 'vi' ? 'Tuổi' : language === 'en' ? 'Age' : '年齢'} compact={compact}>
          <div className={`flex items-center ${compact ? 'gap-1 sm:gap-1.5' : 'gap-2'} flex-wrap`}>
            <select
              value={filters.age || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value || null }))}
              className={`flex-1 min-w-0 ${compact ? 'px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">{language === 'vi' ? 'Chọn tuổi' : language === 'en' ? 'Select age' : '選択'}</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
              <option value="35">35</option>
              <option value="40">40</option>
            </select>
            <span className={compact ? "text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0" : "text-sm text-gray-500 whitespace-nowrap flex-shrink-0"}>
              {language === 'vi' ? 'tuổi có thể ứng tuyển' : language === 'en' ? 'years old' : '歳で応募可能'}
            </span>
          </div>
        </FilterBlock>

        {/* F. Range lương */}
        <FilterBlock icon={DollarSign} label={language === 'vi' ? 'Range lương' : language === 'en' ? 'Salary Range' : '給与範囲'} compact={compact}>
          <div className={`flex items-center ${compact ? 'gap-1 sm:gap-1.5' : 'gap-2'} min-w-0 flex-wrap`}>
            <input
              type="number"
              value={filters.salaryMin}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value ? Number(e.target.value) : '' }))}
              placeholder={language === 'vi' ? 'Từ' : language === 'en' ? 'From' : 'から'}
              className={`flex-1 min-w-[60px] ${compact ? 'px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <span className="text-gray-500 flex-shrink-0 text-sm">{compact ? '~' : '~'}</span>
            <input
              type="number"
              value={filters.salaryMax}
              onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value ? Number(e.target.value) : '' }))}
              placeholder={language === 'vi' ? 'Đến' : language === 'en' ? 'To' : 'まで'}
              className={`flex-1 min-w-[60px] ${compact ? 'px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <span className={compact ? "text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0" : "text-sm text-gray-500 whitespace-nowrap flex-shrink-0"}>
              {language === 'vi' ? 'triệu' : language === 'en' ? 'million' : '万円'}
            </span>
          </div>
        </FilterBlock>

        {/* G. Hình thức tuyển dụng */}
        <FilterBlock icon={FileText} label={language === 'vi' ? 'Hình thức tuyển dụng' : language === 'en' ? 'Employment Type' : '雇用形態'} compact={compact}>
          <select
            value={filters.employmentType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, employmentType: e.target.value || null }))}
            className={`w-full ${compact ? 'px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="">{language === 'vi' ? 'Chọn hình thức' : language === 'en' ? 'Select type' : '選択'}</option>
            {mockEmploymentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </FilterBlock>

        {/* I. Điểm nổi bật */}
        <FilterBlock icon={Star} label={language === 'vi' ? 'Điểm nổi bật của job' : language === 'en' ? 'Job Highlights' : '求人の特徴'} compact={compact}>
          <div className={`flex ${compact ? 'gap-1 sm:gap-1.5' : 'gap-2'} items-center`}>
            <input
              type="text"
              readOnly
              value={getSelectedHighlightsNames() || ''}
              placeholder={language === 'vi' ? 'Chọn điểm nổi bật' : language === 'en' ? 'Select highlights' : '特徴を選択'}
              className={`flex-1 ${compact ? 'px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'} border border-gray-300 rounded-lg bg-gray-50 cursor-pointer`}
              onClick={() => setShowHighlightModal(true)}
            />
            <button
              onClick={() => setShowHighlightModal(true)}
              className={`${compact ? 'px-2 sm:px-2.5 py-2 sm:py-2.5' : 'px-4 py-3'} border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0`}
            >
              <Plus className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-gray-600" : "w-5 h-5 text-gray-600"} />
            </button>
          </div>
        </FilterBlock>

        {/* J. Nhóm checkbox Yes/No */}
        <FilterBlock icon={CheckSquare} label={language === 'vi' ? 'Điều kiện' : language === 'en' ? 'Conditions' : '条件'} compact={compact}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'}`}>
            <label className={`flex items-start ${compact ? 'gap-1.5 sm:gap-2 p-1.5 sm:p-2' : 'gap-2 p-2'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.positionNoExpOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, positionNoExpOk: e.target.checked }
                }))}
                className={`mt-0.5 ${compact ? "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0" : "w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"}`}
              />
              <span className={compact ? "text-xs sm:text-sm text-gray-700 leading-tight" : "text-sm text-gray-700 leading-tight"}>
                {language === 'vi' ? 'Chưa kinh nghiệm vị trí OK' : language === 'en' ? 'No position exp OK' : '未経験職種OK'}
              </span>
            </label>
            <label className={`flex items-start ${compact ? 'gap-1.5 sm:gap-2 p-1.5 sm:p-2' : 'gap-2 p-2'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.industryNoExpOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, industryNoExpOk: e.target.checked }
                }))}
                className={`mt-0.5 ${compact ? "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0" : "w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"}`}
              />
              <span className={compact ? "text-xs sm:text-sm text-gray-700 leading-tight" : "text-sm text-gray-700 leading-tight"}>
                {language === 'vi' ? 'Chưa kinh nghiệm ngành OK' : language === 'en' ? 'No industry exp OK' : '未経験業種OK'}
              </span>
            </label>
            <label className={`flex items-start ${compact ? 'gap-1.5 sm:gap-2 p-1.5 sm:p-2' : 'gap-2 p-2'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.weekendOff}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, weekendOff: e.target.checked }
                }))}
                className={`mt-0.5 ${compact ? "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0" : "w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"}`}
              />
              <span className={compact ? "text-xs sm:text-sm text-gray-700 leading-tight" : "text-sm text-gray-700 leading-tight"}>
                {language === 'vi' ? 'Nghỉ T7-CN' : language === 'en' ? 'Weekend off' : '土日祝休み'}
              </span>
            </label>
            <label className={`flex items-start ${compact ? 'gap-1.5 sm:gap-2 p-1.5 sm:p-2' : 'gap-2 p-2'} rounded-lg hover:bg-gray-50 cursor-pointer`}>
              <input
                type="checkbox"
                checked={filters.booleans.noExpOk}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  booleans: { ...prev.booleans, noExpOk: e.target.checked }
                }))}
                className={`mt-0.5 ${compact ? "w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0" : "w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"}`}
              />
              <span className={compact ? "text-xs sm:text-sm text-gray-700 leading-tight" : "text-sm text-gray-700 leading-tight"}>
                {language === 'vi' ? 'Hoàn toàn chưa kinh nghiệm OK' : language === 'en' ? 'No experience OK' : '完全未経験OK'}
              </span>
            </label>
          </div>
        </FilterBlock>
        </div>

        {/* Fixed Buttons Row */}
        <div className={`flex-shrink-0 border-t border-gray-200 bg-white ${compact ? 'p-2 sm:p-3' : 'p-4 sm:p-5'} ${compact ? 'rounded-b-lg' : 'rounded-b-2xl'}`}>
          <div className={`${compact ? "space-y-1.5 sm:space-y-2" : "space-y-2"}`}>
            <div className={`flex ${compact ? 'gap-1.5 sm:gap-2' : 'gap-2'} flex-col sm:flex-row`}>
              <button
                onClick={handleClearAll}
                className={`flex-1 ${compact ? 'py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm' : 'py-3 px-5 text-sm'} font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors`}
              >
                {language === 'vi' ? 'Xóa tất cả' : language === 'en' ? 'Clear All' : 'すべてクリア'}
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className={`flex-1 ${compact ? 'h-10 sm:h-11' : 'h-12'} bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center ${compact ? 'gap-1.5 sm:gap-2' : 'gap-2'} transition-colors shadow-md ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <RotateCw className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" : "w-5 h-5 text-white animate-spin"} />
                ) : (
                  <Search className={compact ? "w-4 h-4 sm:w-5 sm:h-5 text-white" : "w-5 h-5 text-white"} />
                )}
                <span className={compact ? "text-xs sm:text-sm font-semibold text-white" : "text-base font-semibold text-white"}>
                  {language === 'vi' ? 'Tìm kiếm' : language === 'en' ? 'Search' : '検索'}
                </span>
              </button>
            </div>
            <p className={`text-center ${compact ? 'text-xs sm:text-sm' : 'text-sm'} text-gray-600`}>
              {language === 'vi' 
                ? `Tìm kiếm ${resultCount.toLocaleString('vi-VN')} kết quả`
                : language === 'en'
                ? `Search ${resultCount.toLocaleString()} results`
                : `${resultCount.toLocaleString('ja-JP')} 件を検索`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Dual Modal: Country and Location Selection */}
      {showLocationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          onClick={() => {
            setShowLocationModal(false);
            setSelectedCountries([]);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel: Country Selection */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {language === 'vi' ? 'Chọn quốc gia' : language === 'en' ? 'Select Country' : '国を選択'}
                </h3>
                <button 
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedCountries([]);
                  }} 
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {Object.keys(countryProvincesData).map((country) => {
                    const isSelected = selectedCountries.includes(country);
                    return (
                      <label
                        key={country}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCountry(country)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-900">{country}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Location Selection */}
            <div className="w-1/2 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {language === 'vi' 
                    ? 'Chọn địa điểm làm việc' 
                    : language === 'en' 
                    ? 'Select Work Location' 
                    : '勤務地を選択'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {selectedCountries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {language === 'vi' 
                      ? 'Vui lòng chọn quốc gia trước' 
                      : language === 'en' 
                      ? 'Please select a country first' 
                      : 'まず国を選択してください'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCountries.map((country) => {
                      const provinces = countryProvincesData[country] || [];
                      const selectedProvinces = filters.locations
                        .filter(loc => loc.country === country)
                        .map(loc => loc.location);
                      
                      return (
                        <div key={country} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">{country}</h4>
                          <div className="space-y-1">
                            {provinces.map((province) => {
                              const isSelected = selectedProvinces.includes(province);
                              return (
                                <label
                                  key={province}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleLocation(province, country)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-900">{province}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedCountries([]);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Dual Modal: Field and Job Type Selection */}
      {showFieldJobTypeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          onClick={() => {
            setShowFieldJobTypeModal(false);
            setSelectedFields([]);
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Panel: Field Selection */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {language === 'vi' ? 'Chọn lĩnh vực' : language === 'en' ? 'Select Field' : '分野を選択'}
                </h3>
                <button 
                  onClick={() => {
                    setShowFieldJobTypeModal(false);
                    setSelectedFields([]);
                  }} 
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loadingFields ? (
                  <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
                ) : (
                  <div className="space-y-1">
                    {/* Chỉ hiển thị các lĩnh vực cha (parentId = null) */}
                    {categoryTree.length > 0 ? (
                      // Chỉ render các category top-level (không có parentId)
                      categoryTree
                        .filter(cat => !cat.parentId) // Chỉ lấy các category cha
                        .map((cat) => {
                          const catId = String(cat.id);
                          const isSelected = selectedFields.includes(catId);
                          
                          return (
                            <label
                              key={catId}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleField(catId)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                              />
                              <span className="text-xs text-gray-900 flex-1">
                                {cat.name}
                              </span>
                            </label>
                          );
                        })
                    ) : (
                      // Fallback: flat list - chỉ lấy các field không có parentId
                      availableFields
                        .filter(field => !field.parentId)
                        .map((field) => {
                          const isSelected = selectedFields.includes(field.id);
                          return (
                            <label
                              key={field.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleField(field.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-900">{field.name}</span>
                            </label>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Job Type Selection */}
            <div className="w-1/2 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {language === 'vi' 
                    ? 'Chọn loại công việc' 
                    : language === 'en' 
                    ? 'Select Job Type' 
                    : '職種を選択'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {loadingJobTypes ? (
                  <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
                ) : selectedFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {language === 'vi' 
                      ? 'Vui lòng chọn lĩnh vực trước' 
                      : language === 'en' 
                      ? 'Please select a field first' 
                      : 'まず分野を選択してください'}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedFields.map((fieldId) => {
                      // Tìm field trong tree
                      const findCategoryInTree = (categories, targetId) => {
                        for (const cat of categories) {
                          if (String(cat.id) === String(targetId)) {
                            return cat;
                          }
                          if (cat.children && cat.children.length > 0) {
                            const found = findCategoryInTree(cat.children, targetId);
                            if (found) return found;
                          }
                        }
                        return null;
                      };
                      
                      const fieldInTree = findCategoryInTree(categoryTree, fieldId);
                      const field = availableFields.find(f => f.id === fieldId) || 
                                   (fieldInTree ? { id: String(fieldInTree.id), name: fieldInTree.name } : null);
                      
                      if (!field && !fieldInTree) return null;
                      
                      // Render nested job types với cấu trúc phân cấp đầy đủ
                      const renderNestedJobTypes = (category, level = 0) => {
                        if (!category.children || category.children.length === 0) return null;
                        
                        return (
                          <div className="space-y-1">
                            {category.children.map((child) => {
                              const childId = String(child.id);
                              const isSelected = filters.jobTypeIds.includes(childId);
                              
                              return (
                                <div key={childId}>
                                  <label
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    style={{ paddingLeft: `${level * 20}px` }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleJobType(childId)}
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
                                    />
                                    <span className="text-xs text-gray-900 flex-1">
                                      {level > 0 && <span className="text-gray-400 mr-1">└─</span>}
                                      {child.name}
                                    </span>
                                  </label>
                                  {/* Render children của child (con của con) */}
                                  {child.children && child.children.length > 0 && (
                                    <div>
                                      {renderNestedJobTypes(child, level + 1)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      };
                      
                      // Nếu có field trong tree và có children, render tree structure
                      if (fieldInTree && fieldInTree.children && fieldInTree.children.length > 0) {
                        return (
                          <div key={fieldId} className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">
                              {fieldInTree.name}
                            </h4>
                            {renderNestedJobTypes(fieldInTree, 0)}
                          </div>
                        );
                      }
                      
                      // Fallback: Nếu không có tree structure, dùng flat list với descendants
                      const allDescendantIds = findAllDescendants(fieldId);
                      const directChildren = availableJobTypes.filter(jt => jt.parentId === fieldId);
                      const allJobTypesForField = [
                        ...directChildren,
                        ...availableJobTypes.filter(jt => allDescendantIds.includes(jt.id) && jt.parentId !== fieldId)
                      ];
                      
                      // Remove duplicates
                      const uniqueJobTypes = Array.from(
                        new Map(allJobTypesForField.map(jt => [jt.id, jt])).values()
                      );
                      
                      return (
                        <div key={fieldId} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 border-b border-gray-200 pb-2">
                            {field?.name || fieldInTree?.name || 'Unknown'}
                          </h4>
                          <div className="space-y-1">
                            {uniqueJobTypes.map((jobType) => {
                              const isSelected = filters.jobTypeIds.includes(jobType.id);
                              return (
                                <label
                                  key={jobType.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleJobType(jobType.id)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="text-xs text-gray-900">{jobType.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowFieldJobTypeModal(false);
                    setSelectedFields([]);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {language === 'vi' ? 'Xác nhận' : language === 'en' ? 'Confirm' : '確認'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </>
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


