import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Tag,
  Calendar,
  Upload,
  Plus,
  Save,
  X,
  DollarSign as Money,
  Award,
  Users,
} from 'lucide-react';


const AdminAddJobPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [formData, setFormData] = useState({
    // Basic Information (required)
    jobCode: '',
    title: '',
    slug: '', // Auto-generate from title
    description: '',
    instruction: '',
    categoryId: '',
    companyId: '',
    // Location
    interviewLocation: '',
    // Salary & Benefits
    bonus: '',
    salaryReview: '',
    socialInsurance: '',
    transportation: '',
    breakTime: '',
    overtime: '',
    holidays: '',
    deadline: '',
    // Recruitment Type
    recruitmentType: '',
    contractPeriod: '',
    recruitmentProcess: '',
    // Commission
    jobCommissionType: 'fixed', // 'fixed' or 'percent'
    // Status
    status: 1, // 0: Draft, 1: Published, 2: Closed, 3: Expired
    isPinned: false,
    isHot: false,
  });
  
  // Related data arrays
  const [workingLocations, setWorkingLocations] = useState([]);
  const [workingLocationDetails, setWorkingLocationDetails] = useState([]);
  const [salaryRanges, setSalaryRanges] = useState([]);
  const [salaryRangeDetails, setSalaryRangeDetails] = useState([]);
  const [overtimeAllowances, setOvertimeAllowances] = useState([]);
  const [overtimeAllowanceDetails, setOvertimeAllowanceDetails] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [smokingPolicies, setSmokingPolicies] = useState([]);
  const [smokingPolicyDetails, setSmokingPolicyDetails] = useState([]);
  const [workingHours, setWorkingHours] = useState([]);
  const [workingHourDetails, setWorkingHourDetails] = useState([]);
  const [jdFile, setJdFile] = useState(null);
  const [jdFileJp, setJdFileJp] = useState(null);
  const [cvFormFile, setCvFormFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);
  const [types, setTypes] = useState([]);
  const [valuesByType, setValuesByType] = useState({});
  const [jobValues, setJobValues] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newValueNames, setNewValueNames] = useState(''); // Textarea: mỗi dòng là một Value
  const [selectedTypeForValue, setSelectedTypeForValue] = useState('');

  useEffect(() => {
    loadCategories();
    loadCompanies();
    loadCampaigns();
    loadTypes();
    if (jobId) {
      loadJobData();
    }
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminJobById(jobId);
      if (response.success && response.data?.job) {
        const job = response.data.job;
        setFormData({
          jobCode: job.jobCode || '',
          title: job.title || '',
          slug: job.slug || generateSlug(job.title || ''),
          description: job.description || '',
          instruction: job.instruction || '',
          categoryId: job.jobCategoryId || job.categoryId || '',
          companyId: job.companyId || '',
          interviewLocation: job.interviewLocation || '',
          bonus: job.bonus || '',
          salaryReview: job.salaryReview || '',
          socialInsurance: job.socialInsurance || '',
          transportation: job.transportation || '',
          breakTime: job.breakTime || '',
          overtime: job.overtime || '',
          holidays: job.holidays || '',
          deadline: job.deadline || '',
          recruitmentType: job.recruitmentType || '',
          contractPeriod: job.contractPeriod || '',
          recruitmentProcess: job.recruitmentProcess || '',
          jobCommissionType: job.jobCommissionType || 'fixed',
          status: job.status !== undefined ? job.status : 1,
          isPinned: job.isPinned || false,
          isHot: job.isHot || false,
        });
        
        // Load related data
        if (job.workingLocations) {
          setWorkingLocations(job.workingLocations.map(wl => ({
            location: wl.location || '',
            country: wl.country || ''
          })));
        }
        if (job.workingLocationDetails) {
          setWorkingLocationDetails(job.workingLocationDetails.map(wld => ({
            content: wld.content || ''
          })));
        }
        if (job.salaryRanges) {
          setSalaryRanges(job.salaryRanges.map(sr => ({
            salaryRange: sr.salaryRange || '',
            type: sr.type || ''
          })));
        }
        if (job.salaryRangeDetails) {
          setSalaryRangeDetails(job.salaryRangeDetails.map(srd => ({
            content: srd.content || ''
          })));
        }
        if (job.overtimeAllowances) {
          setOvertimeAllowances(job.overtimeAllowances.map(oa => ({
            overtimeAllowanceRange: oa.overtimeAllowanceRange || ''
          })));
        }
        if (job.overtimeAllowanceDetails) {
          setOvertimeAllowanceDetails(job.overtimeAllowanceDetails.map(oad => ({
            content: oad.content || ''
          })));
        }
        if (job.requirements) {
          setRequirements(job.requirements.map(req => ({
            content: req.content || '',
            type: req.type || '',
            status: req.status || ''
          })));
        }
        if (job.smokingPolicies) {
          setSmokingPolicies(job.smokingPolicies.map(sp => ({
            allow: sp.allow || false
          })));
        }
        if (job.smokingPolicyDetails) {
          setSmokingPolicyDetails(job.smokingPolicyDetails.map(spd => ({
            content: spd.content || ''
          })));
        }
        if (job.workingHours) {
          setWorkingHours(job.workingHours.map(wh => ({
            workingHours: wh.workingHours || ''
          })));
        }
        if (job.workingHourDetails) {
          setWorkingHourDetails(job.workingHourDetails.map(whd => ({
            content: whd.content || ''
          })));
        }
        
        // Load job values
        if (job.jobValues && job.jobValues.length > 0) {
          setJobValues(job.jobValues.map(jv => ({
            typeId: jv.typeId || jv.id_typename,
            valueId: jv.valueId || jv.id_value,
            value: jv.value || '',
            isRequired: jv.isRequired || jv.is_required || false
          })));
          // Load values for each type
          job.jobValues.forEach(jv => {
            const typeId = jv.typeId || jv.id_typename;
            if (typeId) {
              loadValuesForType(typeId);
            }
          });
        }
        
        // Load campaigns
        if (job.jobCampaigns && job.jobCampaigns.length > 0) {
          setSelectedCampaignIds(job.jobCampaigns.map(jc => jc.campaignId || jc.campaign?.id).filter(Boolean));
        }
      }
    } catch (error) {
      console.error('Error loading job data:', error);
      alert('Lỗi khi tải thông tin công việc');
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const response = await apiService.getAllTypes(true); // includeValues = true
      if (response.success && response.data) {
        setTypes(response.data.types || []);
        // Pre-load values for each type
        const valuesMap = {};
        const types = response.data.types || [];
        
        // Load values for all types to ensure we have all values
        for (const type of types) {
          if (type.values && type.values.length > 0) {
            valuesMap[type.id] = type.values;
          } else {
            // If no values in response, load them separately
            try {
              const valuesResponse = await apiService.getValuesByType(type.id);
              if (valuesResponse.success && valuesResponse.data) {
                valuesMap[type.id] = valuesResponse.data.values || [];
              }
            } catch (err) {
              console.error(`Error loading values for type ${type.id}:`, err);
            }
          }
        }
        setValuesByType(valuesMap);
      }
    } catch (error) {
      console.error('Error loading types:', error);
    }
  };

  const loadValuesForType = async (typeId, forceReload = false) => {
    // Nếu đã load và không force reload thì skip
    if (!forceReload && valuesByType[typeId]) {
      return; // Already loaded
    }
    try {
      const response = await apiService.getValuesByType(typeId);
      if (response.success && response.data) {
        setValuesByType(prev => ({
          ...prev,
          [typeId]: response.data.values || []
        }));
      }
    } catch (error) {
      console.error('Error loading values for type:', error);
    }
  };

  const handleCreateType = async () => {
    if (!newTypeName || !newTypeName.trim()) {
      alert('Vui lòng nhập tên Type');
      return;
    }
    try {
      const response = await apiService.createType({ typename: newTypeName.trim() });
      if (response.success) {
        alert('Tạo Type thành công!');
        setNewTypeName('');
        setShowAddTypeModal(false);
        // Reload types
        await loadTypes();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tạo Type');
      }
    } catch (error) {
      console.error('Error creating type:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo Type');
    }
  };

  const handleCreateValue = async () => {
    if (!newValueNames || !newValueNames.trim()) {
      alert('Vui lòng nhập tên Value');
      return;
    }
    if (!selectedTypeForValue) {
      alert('Vui lòng chọn Type');
      return;
    }
    try {
      const typeId = parseInt(selectedTypeForValue);
      // Split by newline and filter empty lines
      const valueNames = newValueNames
        .split('\n')
        .map(v => v.trim())
        .filter(v => v.length > 0);
      
      if (valueNames.length === 0) {
        alert('Vui lòng nhập ít nhất một Value');
        return;
      }

      // Create all values
      const createdValues = [];
      const errors = [];
      
      for (const valuename of valueNames) {
        try {
          const response = await apiService.createValue({ 
            typeId: typeId,
            valuename: valuename
          });
          if (response.success) {
            createdValues.push(response.data.value);
          } else {
            errors.push(`${valuename}: ${response.message || 'Lỗi không xác định'}`);
          }
        } catch (error) {
          errors.push(`${valuename}: ${error.message || 'Lỗi không xác định'}`);
        }
      }

      // Show results
      if (createdValues.length > 0) {
        alert(`Đã tạo thành công ${createdValues.length}/${valueNames.length} Value!`);
        // Reload values for the selected type
        await loadValuesForType(typeId);
        // Update valuesByType state immediately
        setValuesByType(prev => ({
          ...prev,
          [typeId]: [...(prev[typeId] || []), ...createdValues]
        }));
      }
      
      if (errors.length > 0) {
        alert(`Có lỗi khi tạo một số Value:\n${errors.join('\n')}`);
      }

      if (createdValues.length > 0) {
        setNewValueNames('');
        setSelectedTypeForValue('');
        setShowAddValueModal(false);
      }
    } catch (error) {
      console.error('Error creating values:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo Value');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getJobCategories({ status: 1 });
      if (response.success && response.data) {
        // Flatten tree structure if needed
        const flattenCategories = (cats) => {
          let result = [];
          cats.forEach(cat => {
            result.push(cat);
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenCategories(cat.children));
            }
          });
          return result;
        };
        const flatCats = flattenCategories(response.data.categories || []);
        setCategories(flatCats);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
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

  const loadCampaigns = async () => {
    try {
      const response = await apiService.getAdminCampaigns({ limit: 1000, status: 1 });
      if (response.success && response.data) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
      };
      
      // Auto-generate slug from title
      if (name === 'title' && value) {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleJdFileChange = (e) => {
    if (e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleJdFileJpChange = (e) => {
    if (e.target.files[0]) {
      setJdFileJp(e.target.files[0]);
    }
  };

  const handleCvFormFileChange = (e) => {
    if (e.target.files[0]) {
      setCvFormFile(e.target.files[0]);
    }
  };

  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setFormData(prev => ({
      ...prev,
      companyId: companyId || ''
    }));
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobCode || !formData.jobCode.trim()) {
      newErrors.jobCode = 'Mã việc làm là bắt buộc';
    }

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Tiêu đề công việc là bắt buộc';
    }

    if (!formData.slug || !formData.slug.trim()) {
      newErrors.slug = 'Slug là bắt buộc';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Danh mục là bắt buộc';
    }

    // Validate: If typeId = 2, valueId is required
    const invalidJobValues = jobValues.filter(jv => jv.typeId === 2 && !jv.valueId);
    if (invalidJobValues.length > 0) {
      newErrors.jobValues = 'Vui lòng chọn Value cho các Type có ID = 2';
    }

    // Validate: Job Values format based on jobCommissionType
    for (const jv of jobValues) {
      if (jv.value) {
        const valueNum = parseFloat(jv.value);
        if (isNaN(valueNum) || valueNum < 0) {
          newErrors.jobValues = 'Giá trị trong Job Values phải là số dương';
          break;
        }
        if (formData.jobCommissionType === 'percent' && valueNum > 100) {
          newErrors.jobValues = 'Phần trăm không được vượt quá 100%';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Prepare JSON body data
      const requestData = {
        // Required fields
        jobCode: formData.jobCode,
        jobCategoryId: parseInt(formData.categoryId),
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        // Optional basic fields
        description: formData.description || null,
        instruction: formData.instruction || null,
        interviewLocation: formData.interviewLocation ? parseInt(formData.interviewLocation) : null,
        bonus: formData.bonus || null,
        salaryReview: formData.salaryReview || null,
        holidays: formData.holidays || null,
        socialInsurance: formData.socialInsurance || null,
        transportation: formData.transportation || null,
        breakTime: formData.breakTime || null,
        overtime: formData.overtime || null,
        recruitmentType: formData.recruitmentType ? parseInt(formData.recruitmentType) : null,
        contractPeriod: formData.contractPeriod || null,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
        recruitmentProcess: formData.recruitmentProcess || null,
        deadline: formData.deadline || null,
        status: parseInt(formData.status),
        isPinned: formData.isPinned || false,
        isHot: formData.isHot || false,
        jobCommissionType: formData.jobCommissionType || 'fixed',
        // Related data arrays
        workingLocations: workingLocations.filter(wl => wl.location && wl.location.trim()),
        workingLocationDetails: workingLocationDetails.filter(wld => wld.content && wld.content.trim()),
        salaryRanges: salaryRanges.filter(sr => sr.salaryRange && sr.salaryRange.trim()),
        salaryRangeDetails: salaryRangeDetails.filter(srd => srd.content && srd.content.trim()),
        overtimeAllowances: overtimeAllowances.filter(oa => oa.overtimeAllowanceRange && oa.overtimeAllowanceRange.trim()),
        overtimeAllowanceDetails: overtimeAllowanceDetails.filter(oad => oad.content && oad.content.trim()),
        requirements: requirements.filter(req => req.content && req.content.trim()),
        smokingPolicies: smokingPolicies,
        smokingPolicyDetails: smokingPolicyDetails.filter(spd => spd.content && spd.content.trim()),
        workingHours: workingHours.filter(wh => wh.workingHours && wh.workingHours.trim()),
        workingHourDetails: workingHourDetails.filter(whd => whd.content && whd.content.trim()),
        jobValues: jobValues.map(jv => ({
          typeId: parseInt(jv.typeId),
          valueId: parseInt(jv.valueId),
          value: jv.value || null,
          isRequired: jv.isRequired || false
        })),
        jobPickupIds: [], // TODO: Add job pickup selection if needed
        campaignIds: selectedCampaignIds.map(id => parseInt(id))
      };

      const response = jobId 
        ? await apiService.updateAdminJob(jobId, requestData)
        : await apiService.createAdminJob(requestData);
      if (response.success) {
        alert(jobId ? 'Job đã được cập nhật thành công!' : 'Job đã được lưu thành công!');
        navigate(jobId ? `/admin/jobs/${jobId}` : '/admin/jobs');
      } else {
        alert(response.message || (jobId ? 'Có lỗi xảy ra khi cập nhật job' : 'Có lỗi xảy ra khi tạo job'));
      }
    } catch (error) {
      console.error(`Error ${jobId ? 'updating' : 'creating'} job:`, error);
      alert(error.message || (jobId ? 'Có lỗi xảy ra khi cập nhật job' : 'Có lỗi xảy ra khi tạo job'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate(jobId ? `/admin/jobs/${jobId}` : '/admin/jobs');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(jobId ? `/admin/jobs/${jobId}` : '/admin/jobs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{jobId ? 'Chỉnh sửa công việc' : 'Tạo công việc'}</h1>
            <p className="text-xs text-gray-500 mt-1">{jobId ? 'Cập nhật thông tin công việc' : 'Thêm thông tin công việc mới vào hệ thống'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {jobId ? 'Cập nhật công việc' : 'Lưu công việc'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Thông tin cơ bản
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Mã việc làm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobCode"
                    value={formData.jobCode}
                    onChange={handleInputChange}
                    placeholder="VD: JOB-001"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="0">Draft</option>
                    <option value="1">Published</option>
                    <option value="2">Closed</option>
                    <option value="3">Expired</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tiêu đề công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Software Engineer - React/Node.js Developer"
                  required
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Slug <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-[10px] ml-2">(Tự động tạo từ tiêu đề)</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="VD: software-engineer-react-nodejs-developer"
                  required
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.slug ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.slug && <p className="text-[10px] text-red-500 mt-1">{errors.slug}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.categoryId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-[10px] text-red-500 mt-1">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Công ty <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleCompanyChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Chọn công ty (tùy chọn)</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Mô tả công việc
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết về công việc..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Hướng dẫn ứng tuyển
                </label>
                <textarea
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleInputChange}
                  placeholder="Hướng dẫn cách ứng tuyển..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              Địa điểm làm việc
            </h2>
            <div className="space-y-3">
              {/* Working Locations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Địa điểm làm việc
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkingLocations([...workingLocations, { location: '', country: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm địa điểm
                  </button>
                </div>
                {workingLocations.map((wl, index) => (
                  <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Địa điểm (VD: Tokyo)"
                        value={wl.location}
                        onChange={(e) => {
                          const newLocs = [...workingLocations];
                          newLocs[index].location = e.target.value;
                          setWorkingLocations(newLocs);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Quốc gia (VD: Japan)"
                          value={wl.country}
                          onChange={(e) => {
                            const newLocs = [...workingLocations];
                            newLocs[index].country = e.target.value;
                            setWorkingLocations(newLocs);
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setWorkingLocations(workingLocations.filter((_, i) => i !== index))}
                          className="p-1.5 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {workingLocations.length === 0 && (
                  <p className="text-[10px] text-gray-500">Chưa có địa điểm nào. Nhấn "Thêm địa điểm" để thêm.</p>
                )}
              </div>
              
              {/* Working Location Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Chi tiết địa điểm làm việc
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkingLocationDetails([...workingLocationDetails, { content: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm chi tiết
                  </button>
                </div>
                {workingLocationDetails.map((wld, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <textarea
                      placeholder="Chi tiết địa điểm làm việc..."
                      value={wld.content}
                      onChange={(e) => {
                        const newDetails = [...workingLocationDetails];
                        newDetails[index].content = e.target.value;
                        setWorkingLocationDetails(newDetails);
                      }}
                      rows="2"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => setWorkingLocationDetails(workingLocationDetails.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700 self-start"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Địa điểm phỏng vấn
                </label>
                <select
                  name="interviewLocation"
                  value={formData.interviewLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Chọn</option>
                  <option value="1">Việt Nam</option>
                  <option value="2">Nhật Bản</option>
                  <option value="3">Việt Nam & Nhật Bản</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary & Commission */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Lương & Hoa hồng
            </h2>
            <div className="space-y-3">
              {/* Salary Ranges */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Mức lương
                  </label>
                  <button
                    type="button"
                    onClick={() => setSalaryRanges([...salaryRanges, { salaryRange: '', type: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm mức lương
                  </button>
                </div>
                {salaryRanges.map((sr, index) => (
                  <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Mức lương (VD: 500-700万円)"
                        value={sr.salaryRange}
                        onChange={(e) => {
                          const newRanges = [...salaryRanges];
                          newRanges[index].salaryRange = e.target.value;
                          setSalaryRanges(newRanges);
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Loại (VD: yearly, monthly)"
                          value={sr.type}
                          onChange={(e) => {
                            const newRanges = [...salaryRanges];
                            newRanges[index].type = e.target.value;
                            setSalaryRanges(newRanges);
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setSalaryRanges(salaryRanges.filter((_, i) => i !== index))}
                          className="p-1.5 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Salary Range Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Chi tiết mức lương
                  </label>
                  <button
                    type="button"
                    onClick={() => setSalaryRangeDetails([...salaryRangeDetails, { content: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm chi tiết
                  </button>
                </div>
                {salaryRangeDetails.map((srd, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <textarea
                      placeholder="Chi tiết mức lương..."
                      value={srd.content}
                      onChange={(e) => {
                        const newDetails = [...salaryRangeDetails];
                        newDetails[index].content = e.target.value;
                        setSalaryRangeDetails(newDetails);
                      }}
                      rows="2"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSalaryRangeDetails(salaryRangeDetails.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700 self-start"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Thưởng
                  </label>
                  <input
                    type="text"
                    name="bonus"
                    value={formData.bonus}
                    onChange={handleInputChange}
                    placeholder="VD: 2 lần/năm, tối đa 198万円"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Đánh giá lương
                  </label>
                  <input
                    type="text"
                    name="salaryReview"
                    value={formData.salaryReview}
                    onChange={handleInputChange}
                    placeholder="VD: Hàng năm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Commission Type */}
              <div className="border-t pt-3 mt-3">
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Loại hoa hồng <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobCommissionType"
                  value={formData.jobCommissionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="fixed">Số tiền cố định</option>
                  <option value="percent">Phần trăm</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  {formData.jobCommissionType === 'fixed' 
                    ? 'Giá trị trong Job Values sẽ được hiểu là số tiền cố định (VND). Ví dụ: 50000000 = 50 triệu VND'
                    : 'Giá trị trong Job Values sẽ được hiểu là phần trăm (%). Ví dụ: 30 = 30%'}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Award className="w-4 h-4 text-blue-600" />
              Phúc lợi
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Bảo hiểm xã hội
                  </label>
                  <input
                    type="text"
                    name="socialInsurance"
                    value={formData.socialInsurance}
                    onChange={handleInputChange}
                    placeholder="VD: Có"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Phụ cấp đi lại
                  </label>
                  <input
                    type="text"
                    name="transportation"
                    value={formData.transportation}
                    onChange={handleInputChange}
                    placeholder="VD: Có, tối đa 15,000円/tháng"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Working Time */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Clock className="w-4 h-4 text-blue-600" />
              Thời gian làm việc
            </h2>
            <div className="space-y-3">
              {/* Working Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Giờ làm việc
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkingHours([...workingHours, { workingHours: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm giờ làm việc
                  </button>
                </div>
                {workingHours.map((wh, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Giờ làm việc (VD: 9:00 - 18:00)"
                      value={wh.workingHours}
                      onChange={(e) => {
                        const newHours = [...workingHours];
                        newHours[index].workingHours = e.target.value;
                        setWorkingHours(newHours);
                      }}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setWorkingHours(workingHours.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Working Hour Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Chi tiết giờ làm việc
                  </label>
                  <button
                    type="button"
                    onClick={() => setWorkingHourDetails([...workingHourDetails, { content: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm chi tiết
                  </button>
                </div>
                {workingHourDetails.map((whd, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <textarea
                      placeholder="Chi tiết giờ làm việc..."
                      value={whd.content}
                      onChange={(e) => {
                        const newDetails = [...workingHourDetails];
                        newDetails[index].content = e.target.value;
                        setWorkingHourDetails(newDetails);
                      }}
                      rows="2"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => setWorkingHourDetails(workingHourDetails.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700 self-start"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Thời gian nghỉ
                  </label>
                  <input
                    type="text"
                    name="breakTime"
                    value={formData.breakTime}
                    onChange={handleInputChange}
                    placeholder="VD: 60 phút"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Làm thêm giờ
                  </label>
                  <input
                    type="text"
                    name="overtime"
                    value={formData.overtime}
                    onChange={handleInputChange}
                    placeholder="VD: Có, tùy dự án"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              
              {/* Overtime Allowances */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Phụ cấp làm thêm
                  </label>
                  <button
                    type="button"
                    onClick={() => setOvertimeAllowances([...overtimeAllowances, { overtimeAllowanceRange: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm phụ cấp
                  </button>
                </div>
                {overtimeAllowances.map((oa, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Phụ cấp làm thêm (VD: 1.25x)"
                      value={oa.overtimeAllowanceRange}
                      onChange={(e) => {
                        const newAllowances = [...overtimeAllowances];
                        newAllowances[index].overtimeAllowanceRange = e.target.value;
                        setOvertimeAllowances(newAllowances);
                      }}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setOvertimeAllowances(overtimeAllowances.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Overtime Allowance Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Chi tiết phụ cấp làm thêm
                  </label>
                  <button
                    type="button"
                    onClick={() => setOvertimeAllowanceDetails([...overtimeAllowanceDetails, { content: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm chi tiết
                  </button>
                </div>
                {overtimeAllowanceDetails.map((oad, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <textarea
                      placeholder="Chi tiết phụ cấp làm thêm..."
                      value={oad.content}
                      onChange={(e) => {
                        const newDetails = [...overtimeAllowanceDetails];
                        newDetails[index].content = e.target.value;
                        setOvertimeAllowanceDetails(newDetails);
                      }}
                      rows="2"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => setOvertimeAllowanceDetails(overtimeAllowanceDetails.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700 self-start"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Ngày nghỉ
                  </label>
                  <input
                    type="text"
                    name="holidays"
                    value={formData.holidays}
                    onChange={handleInputChange}
                    placeholder="VD: Thứ 7, Chủ nhật, ngày lễ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Hạn nộp hồ sơ
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Recruitment Type */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Users className="w-4 h-4 text-blue-600" />
              Loại tuyển dụng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Loại tuyển dụng
                </label>
                <select
                  name="recruitmentType"
                  value={formData.recruitmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Chọn</option>
                  <option value="1">Nhân viên chính thức</option>
                  <option value="2">Nhân viên chính thức (công ty haken)</option>
                  <option value="3">Nhân viên haken</option>
                  <option value="4">Nhân viên hợp đồng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Thời hạn hợp đồng
                </label>
                  <input
                    type="text"
                    name="contractPeriod"
                    value={formData.contractPeriod}
                    onChange={handleInputChange}
                    placeholder="VD: Không thời hạn, 1 năm, 2 năm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Quy trình tuyển dụng
                </label>
                <textarea
                  name="recruitmentProcess"
                  value={formData.recruitmentProcess}
                  onChange={handleInputChange}
                  placeholder="VD: Phỏng vấn 1 vòng, Test kỹ năng..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Yêu cầu công việc
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Yêu cầu
                </label>
                <button
                  type="button"
                  onClick={() => setRequirements([...requirements, { content: '', type: '', status: '' }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Thêm yêu cầu
                </button>
              </div>
              {requirements.map((req, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg space-y-2">
                  <textarea
                    placeholder="Nội dung yêu cầu..."
                    value={req.content}
                    onChange={(e) => {
                      const newReqs = [...requirements];
                      newReqs[index].content = e.target.value;
                      setRequirements(newReqs);
                    }}
                    rows="2"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Loại (VD: technique, education)"
                      value={req.type}
                      onChange={(e) => {
                        const newReqs = [...requirements];
                        newReqs[index].type = e.target.value;
                        setRequirements(newReqs);
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Trạng thái (VD: required, optional)"
                        value={req.status}
                        onChange={(e) => {
                          const newReqs = [...requirements];
                          newReqs[index].status = e.target.value;
                          setRequirements(newReqs);
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setRequirements(requirements.filter((_, i) => i !== index))}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smoking Policies */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Tag className="w-4 h-4 text-blue-600" />
              Chính sách hút thuốc
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Chính sách
                </label>
                <button
                  type="button"
                  onClick={() => setSmokingPolicies([...smokingPolicies, { allow: false }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Thêm chính sách
                </button>
              </div>
              {smokingPolicies.map((sp, index) => (
                <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sp.allow}
                        onChange={(e) => {
                          const newPolicies = [...smokingPolicies];
                          newPolicies[index].allow = e.target.checked;
                          setSmokingPolicies(newPolicies);
                        }}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                      />
                      <label className="text-xs font-semibold text-gray-900">
                        Cho phép hút thuốc
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmokingPolicies(smokingPolicies.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Smoking Policy Details */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-900">
                    Chi tiết chính sách
                  </label>
                  <button
                    type="button"
                    onClick={() => setSmokingPolicyDetails([...smokingPolicyDetails, { content: '' }])}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm chi tiết
                  </button>
                </div>
                {smokingPolicyDetails.map((spd, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <textarea
                      placeholder="Chi tiết chính sách hút thuốc..."
                      value={spd.content}
                      onChange={(e) => {
                        const newDetails = [...smokingPolicyDetails];
                        newDetails[index].content = e.target.value;
                        setSmokingPolicyDetails(newDetails);
                      }}
                      rows="2"
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSmokingPolicyDetails(smokingPolicyDetails.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700 self-start"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Tag className="w-4 h-4 text-blue-600" />
              Chiến dịch
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Chọn chiến dịch
                </label>
                <select
                  multiple
                  value={selectedCampaignIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedCampaignIds(selected);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
                  size="5"
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} {campaign.status === 1 ? '(Đang hoạt động)' : campaign.status === 0 ? '(Chưa bắt đầu)' : '(Đã kết thúc)'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều chiến dịch
                </p>
                {selectedCampaignIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCampaignIds.map(campaignId => {
                      const campaign = campaigns.find(c => c.id === parseInt(campaignId));
                      return campaign ? (
                        <span
                          key={campaignId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        >
                          {campaign.name}
                          <button
                            type="button"
                            onClick={() => setSelectedCampaignIds(selectedCampaignIds.filter(id => id !== campaignId))}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Files */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Upload Files
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  JD File (Tiếng Việt)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors">
                  <label htmlFor="jd-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900">Kéo thả file JD vào đây</p>
                      <p className="text-[10px] text-gray-500">hoặc</p>
                      <p className="text-xs text-blue-600 font-medium">Chọn file từ máy tính</p>
                      <p className="text-[10px] text-gray-500">Hỗ trợ PDF, DOC, DOCX</p>
                    </div>
                    <input
                      id="jd-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleJdFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {jdFile && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{jdFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setJdFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  JD File (Tiếng Nhật)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors">
                  <label htmlFor="jd-upload-jp" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900">Kéo thả file JD (JP) vào đây</p>
                      <p className="text-[10px] text-gray-500">hoặc</p>
                      <p className="text-xs text-blue-600 font-medium">Chọn file từ máy tính</p>
                      <p className="text-[10px] text-gray-500">Hỗ trợ PDF, DOC, DOCX</p>
                    </div>
                    <input
                      id="jd-upload-jp"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleJdFileJpChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {jdFileJp && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{jdFileJp.name}</span>
                    <button
                      type="button"
                      onClick={() => setJdFileJp(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Form CV bắt buộc
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors">
                  <label htmlFor="cv-form-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900">Kéo thả file CV Form vào đây</p>
                      <p className="text-[10px] text-gray-500">hoặc</p>
                      <p className="text-xs text-blue-600 font-medium">Chọn file từ máy tính</p>
                      <p className="text-[10px] text-gray-500">Hỗ trợ PDF, Excel</p>
                    </div>
                    <input
                      id="cv-form-upload"
                      type="file"
                      accept=".pdf,.xlsx,.xls"
                      onChange={handleCvFormFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {cvFormFile && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{cvFormFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setCvFormFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Values (Commission Details) */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Money className="w-4 h-4 text-blue-600" />
              Chi tiết hoa hồng (Job Values)
            </h2>
            <div className="space-y-3">
              {jobValues.map((jv, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">Job Value #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setJobValues(jobValues.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <label className="block text-xs font-semibold text-gray-900">Type</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTypeModal(true);
                            setNewTypeName('');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-[10px] flex items-center gap-0.5"
                          title="Thêm Type mới"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <select
                        value={jv.typeId || ''}
                        onChange={async (e) => {
                          const selectedTypeId = e.target.value ? parseInt(e.target.value) : null;
                          if (selectedTypeId) {
                            // Force reload to ensure all values are loaded
                            const response = await apiService.getValuesByType(selectedTypeId);
                            if (response.success && response.data) {
                              const valuesForType = response.data.values || [];
                              
                              // Update valuesByType state
                              setValuesByType(prev => ({
                                ...prev,
                                [selectedTypeId]: valuesForType
                              }));
                              
                              // Special case: Type ID 2 requires manual value selection
                              if (selectedTypeId === 2) {
                                // Just update the current card, don't create multiple cards
                                const newJobValues = [...jobValues];
                                newJobValues[index].typeId = selectedTypeId;
                                newJobValues[index].valueId = '';
                                setJobValues(newJobValues);
                              } else if (valuesForType.length > 0) {
                                // For other types with values, create cards for each value
                                // Remove current jobValue at this index
                                const newJobValues = jobValues.filter((_, i) => i !== index);
                                
                                // Create new jobValues for each value in the selected type
                                const newJobValueCards = valuesForType.map(value => ({
                                  typeId: selectedTypeId,
                                  valueId: value.id,
                                  value: '',
                                  isRequired: false
                                }));
                                
                                // Insert new cards at the same position
                                newJobValues.splice(index, 0, ...newJobValueCards);
                                
                                setJobValues(newJobValues);
                              } else {
                                // If type has no values, just update the current card
                                const newJobValues = [...jobValues];
                                newJobValues[index].typeId = selectedTypeId;
                                newJobValues[index].valueId = '';
                                setJobValues(newJobValues);
                              }
                            }
                          } else {
                            // If no type selected, just update the current card
                            const newJobValues = [...jobValues];
                            newJobValues[index].typeId = '';
                            newJobValues[index].valueId = '';
                            setJobValues(newJobValues);
                          }
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn Type</option>
                        {types.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.typename}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <label className="block text-xs font-semibold text-gray-900">Value</label>
                        <button
                          type="button"
                          onClick={() => {
                            if (!jv.typeId) {
                              alert('Vui lòng chọn Type trước');
                              return;
                            }
                            setSelectedTypeForValue(jv.typeId.toString());
                            setShowAddValueModal(true);
                            setNewValueName('');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-[10px] flex items-center gap-0.5"
                          title="Thêm Value mới"
                          disabled={!jv.typeId}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <select
                        value={jv.valueId || ''}
                        onChange={(e) => {
                          const newJobValues = [...jobValues];
                          newJobValues[index].valueId = parseInt(e.target.value);
                          setJobValues(newJobValues);
                        }}
                        disabled={!jv.typeId}
                        required={jv.typeId === 2}
                        className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          jv.typeId === 2 && !jv.valueId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn Value{jv.typeId === 2 ? ' *' : ''}</option>
                        {valuesByType[jv.typeId]?.map((value) => (
                          <option key={value.id} value={value.id}>
                            {value.valuename}
                          </option>
                        ))}
                      </select>
                      {jv.typeId === 2 && !jv.valueId && (
                        <p className="text-[10px] text-red-500 mt-1">Vui lòng chọn Value (bắt buộc cho Type này)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">
                      Giá trị cụ thể (value)
                      {formData.jobCommissionType === 'fixed' && (
                        <span className="text-gray-500 text-[10px] ml-1">(VND)</span>
                      )}
                      {formData.jobCommissionType === 'percent' && (
                        <span className="text-gray-500 text-[10px] ml-1">(%)</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={formData.jobCommissionType === 'percent' ? '0.01' : '1'}
                        min="0"
                        max={formData.jobCommissionType === 'percent' ? '100' : undefined}
                        value={jv.value || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Validate: nếu là percent, không được vượt quá 100
                          if (formData.jobCommissionType === 'percent' && inputValue && parseFloat(inputValue) > 100) {
                            alert('Phần trăm không được vượt quá 100%');
                            return;
                          }
                          const newJobValues = [...jobValues];
                          newJobValues[index].value = inputValue;
                          setJobValues(newJobValues);
                        }}
                        placeholder={
                          formData.jobCommissionType === 'fixed' 
                            ? 'VD: 50000000 (VND)' 
                            : 'VD: 30 (%)'
                        }
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {formData.jobCommissionType === 'percent' && jv.value && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">
                          %
                        </span>
                      )}
                      {formData.jobCommissionType === 'fixed' && jv.value && (
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">
                          VND
                        </span>
                      )}
                    </div>
                    {formData.jobCommissionType === 'percent' && jv.value && parseFloat(jv.value) > 100 && (
                      <p className="text-[10px] text-red-500 mt-1">Phần trăm không được vượt quá 100%</p>
                    )}
                    {jv.value && formData.jobCommissionType === 'fixed' && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {parseFloat(jv.value).toLocaleString('vi-VN')} VND
                      </p>
                    )}
                    {jv.value && formData.jobCommissionType === 'percent' && (
                      <p className="text-[10px] text-gray-500 mt-1">
                        {parseFloat(jv.value)}%
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={jv.isRequired || false}
                      onChange={(e) => {
                        const newJobValues = [...jobValues];
                        newJobValues[index].isRequired = e.target.checked;
                        setJobValues(newJobValues);
                      }}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                    />
                    <label className="text-xs font-semibold text-gray-900">Bắt buộc</label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setJobValues([...jobValues, { typeId: '', valueId: '', value: '', isRequired: false }])}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm Job Value
              </button>
            </div>
          </div>

          {/* Status & Options */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">Tùy chọn</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPinned"
                  checked={formData.isPinned}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">
                  Ghim lên đầu
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isHot"
                  checked={formData.isHot}
                  onChange={handleInputChange}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label className="text-xs font-semibold text-gray-900">
                  Việc làm hot
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <X className="w-3.5 h-3.5" />
          Hủy
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-3.5 h-3.5" />
          {loading ? (jobId ? 'Đang cập nhật...' : 'Đang lưu...') : (jobId ? 'Cập nhật công việc' : 'Lưu công việc')}
        </button>
      </div>

      {/* Modal: Add Type */}
      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddTypeModal(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Thêm Type mới</h3>
              <button
                onClick={() => setShowAddTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tên Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="VD: Commission, Experience, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTypeModal(false);
                    setNewTypeName('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Tạo Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Value */}
      {showAddValueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddValueModal(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Thêm Value mới</h3>
              <button
                onClick={() => setShowAddValueModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTypeForValue}
                  onChange={(e) => setSelectedTypeForValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Chọn Type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.typename}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tên Value <span className="text-red-500">*</span>
                  <span className="text-gray-500 text-[10px] ml-2">(Mỗi dòng là một Value)</span>
                </label>
                <textarea
                  value={newValueNames}
                  onChange={(e) => setNewValueNames(e.target.value)}
                  placeholder="VD:&#10;Junior&#10;Senior&#10;Expert"
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  autoFocus
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Nhập nhiều Value, mỗi Value trên một dòng. Hệ thống sẽ tạo tất cả các Value cùng lúc.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddValueModal(false);
                    setNewValueNames('');
                    setSelectedTypeForValue('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateValue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  Tạo Value(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddJobPage;

