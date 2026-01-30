import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  User,
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Save,
  X,
  Search,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  Award,
  MapPin,
  Phone,
  Mail,
  Upload,
  Plus,
  Trash2,
} from 'lucide-react';


const AdminAddNominationPage = () => {
  const navigate = useNavigate();
  const { nominationId } = useParams();
  const [formData, setFormData] = useState({
    // Basic Information
    candidateId: '',
    candidateName: '',
    jobId: '',
    jobTitle: '',
    collaboratorId: '',
    collaboratorName: '',
    // Dates
    appliedDate: new Date().toISOString().split('T')[0],
    interviewDate: '',
    // Status
    status: 1, // 1: Admin đang xử lý hồ sơ (pending)
    // Financial
    referralFee: '',
    annualSalary: '',
    monthlySalary: '',
    salaryType: 2, // 1: annual, 2: monthly
    // Notes
    notes: '',
    // Required fields for API
    name: '',
    birthDate: '',
    gender: '', // 1: Nam, 2: Nữ
  });

  const [candidateTab, setCandidateTab] = useState('existing'); // 'existing' or 'new'
  const [candidateSearch, setCandidateSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [showCollaboratorDropdown, setShowCollaboratorDropdown] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // New candidate form data
  const [newCandidateData, setNewCandidateData] = useState({
    nameKanji: '',
    nameKana: '',
    birthDate: '',
    age: '',
    gender: '',
    postalCode: '',
    address: '',
    addressOrigin: '',
    phone: '',
    email: '',
    passport: '',
    currentResidence: '',
    jpResidenceStatus: '',
    visaExpirationDate: '',
    otherCountry: '',
    spouse: '',
    educations: [],
    workExperiences: [],
    technicalSkills: '',
    certificates: [],
    careerSummary: '',
    strengths: '',
    motivation: '',
    currentSalary: '',
    desiredSalary: '',
    desiredPosition: '',
    desiredLocation: '',
    desiredStartDate: '',
    nyushaTime: '',
    interviewTime: '',
    learnedTools: [],
    experienceTools: [],
    jlptLevel: '',
    experienceYears: '',
    specialization: '',
    qualification: '',
    otherDocuments: '',
    notes: '',
  });
  const [cvFiles, setCvFiles] = useState([]);
  const [cvPreviews, setCvPreviews] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState({ current: 0, total: 0 });
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(null);

  // API Base URL for CV parsing
  const API_BASE_URL = 'https://unboiled-nonprescriptive-hiedi.ngrok-free.dev';

  useEffect(() => {
    loadCandidates();
    loadJobs();
    loadCollaborators();
    if (nominationId) {
      loadNominationData();
    }
  }, [nominationId]);

  const loadNominationData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminJobApplicationById(nominationId);
      if (response.success && response.data?.application) {
        const app = response.data.application;
        setFormData({
          candidateId: app.cvId || '',
          candidateName: app.name || app.cv?.fullName || '',
          jobId: app.jobId || '',
          jobTitle: app.job?.title || '',
          collaboratorId: app.collaboratorId || '',
          collaboratorName: app.collaborator?.name || '',
          appliedDate: app.appliedAt ? app.appliedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          interviewDate: app.interviewDate ? app.interviewDate.split('T')[0] : '',
          status: app.status || 1,
          referralFee: app.referralFee || '',
          annualSalary: app.annualSalary || '',
          monthlySalary: app.monthlySalary || '',
          salaryType: app.salaryType || 2,
          notes: app.notes || '',
          name: app.name || app.cv?.fullName || '',
          birthDate: app.birthDate || app.cv?.birthDate || '',
          gender: app.gender || app.cv?.gender || '',
        });
        if (app.cvId) {
          setCandidateTab('existing');
          setCandidateSearch(app.name || app.cv?.fullName || '');
          setFormData(prev => ({ ...prev, candidateId: app.cvId }));
        } else {
          setCandidateTab('existing');
          setCandidateSearch(app.name || '');
        }
        if (app.jobId) {
          setJobSearch(app.job?.title || '');
        }
        if (app.collaboratorId) {
          setCollaboratorSearch(app.collaborator?.name || '');
        }
      }
    } catch (error) {
      console.error('Error loading nomination data:', error);
      alert('Lỗi khi tải thông tin đơn tiến cử');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await apiService.getAdminCVs({ limit: 100 });
      if (response.success && response.data) {
        setCandidates(response.data.cvs || []);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await apiService.getAdminJobs({ limit: 100, status: 1 }); // Only published jobs
      if (response.success && response.data) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadCollaborators = async () => {
    try {
      // Load CTV nội bộ - filter theo status active và có thể thêm filter khác nếu cần
      const response = await apiService.getCollaborators({ 
        limit: 100,
        status: 1 // Chỉ lấy CTV active
      });
      if (response.success && response.data) {
        // Filter CTV nội bộ - có thể filter theo organizationType hoặc các tiêu chí khác
        // Hiện tại filter theo status active, có thể thêm filter organizationType = 'internal' nếu có
        const internalCollaborators = (response.data.collaborators || []).filter(c => {
          // Chỉ lấy CTV active (status = 1)
          return c.status === 1;
        });
        setCollaborators(internalCollaborators);
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewCandidateInputChange = (e) => {
    const { name, value } = e.target;
    setNewCandidateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to merge parsed data with form structure
  const mergeResumeData = (parsedData) => {
    setNewCandidateData(prev => ({
      ...prev,
      nameKanji: parsedData.personal_info?.full_name_kanji || prev.nameKanji,
      nameKana: parsedData.personal_info?.full_name_kana || prev.nameKana,
      birthDate: parsedData.personal_info?.dob || prev.birthDate,
      age: parsedData.personal_info?.age || prev.age,
      gender: parsedData.personal_info?.gender || prev.gender,
      postalCode: parsedData.personal_info?.contact?.postal_code || prev.postalCode,
      address: parsedData.personal_info?.contact?.address || prev.address,
      phone: parsedData.personal_info?.contact?.phone || prev.phone,
      email: parsedData.personal_info?.contact?.email || prev.email,
      educations: parsedData.education_history?.length > 0 
        ? parsedData.education_history.map(edu => ({
            year: edu.year || '',
            month: edu.month || '',
            content: edu.content || ''
          }))
        : prev.educations,
      workExperiences: parsedData.employment_history_details?.length > 0
        ? parsedData.employment_history_details.map(emp => ({
            period: emp.period || '',
            company_name: emp.company_name || '',
            business_purpose: emp.business_purpose || '',
            scale_role: emp.scale_role || '',
            description: emp.description || '',
            tools_tech: emp.tools_tech || ''
          }))
        : prev.workExperiences,
      technicalSkills: parsedData.skills_and_certifications?.technical_skills || prev.technicalSkills,
      certificates: parsedData.skills_and_certifications?.licenses?.length > 0
        ? parsedData.skills_and_certifications.licenses.map(lic => ({
            year: lic.year || '',
            month: lic.month || '',
            name: lic.name || ''
          }))
        : prev.certificates,
      careerSummary: parsedData.self_promotion?.job_summary || prev.careerSummary,
      strengths: parsedData.self_promotion?.self_pr || prev.strengths,
      motivation: parsedData.self_promotion?.motivation || prev.motivation,
      currentSalary: parsedData.preferences?.current_salary || prev.currentSalary,
      desiredSalary: parsedData.preferences?.desired_salary || prev.desiredSalary,
      desiredPosition: parsedData.preferences?.desired_job || prev.desiredPosition,
      desiredLocation: parsedData.preferences?.desired_location || prev.desiredLocation,
      desiredStartDate: parsedData.preferences?.start_date || prev.desiredStartDate,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      setParseError('Vui lòng chọn file PDF');
      return;
    }

    setCvFiles(prev => [...prev, ...pdfFiles]);
    setParseError(null);
    setParseSuccess(null);

    pdfFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvPreviews(prev => [...prev, { name: file.name, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });

    setIsParsing(true);
    setParseProgress({ current: 0, total: pdfFiles.length });

    let successCount = 0;
    let errorMessages = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      setParseProgress({ current: i + 1, total: pdfFiles.length });

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch(`${API_BASE_URL}/resume/parse`, {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Lỗi khi phân tích ${file.name}`);
        }

        const resumeData = await response.json();
        mergeResumeData(resumeData);
        successCount++;
      } catch (err) {
        console.error(`Error parsing ${file.name}:`, err);
        errorMessages.push(`${file.name}: ${err.message}`);
      }
    }

    setIsParsing(false);

    if (successCount > 0) {
      setParseSuccess(`Đã trích xuất dữ liệu từ ${successCount}/${pdfFiles.length} file CV thành công!`);
    }
    if (errorMessages.length > 0) {
      setParseError(errorMessages.join('\n'));
    }
  };

  const handleRemoveCV = (index) => {
    if (index !== undefined) {
      setCvFiles(prev => prev.filter((_, i) => i !== index));
      setCvPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setCvFiles([]);
      setCvPreviews([]);
    }
    setParseError(null);
    setParseSuccess(null);
  };

  // Education handlers
  const handleAddEducation = () => {
    setNewCandidateData(prev => ({
      ...prev,
      educations: [...prev.educations, { year: '', month: '', content: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...newCandidateData.educations];
    updated[index][field] = value;
    setNewCandidateData(prev => ({ ...prev, educations: updated }));
  };

  const removeEducation = (index) => {
    setNewCandidateData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  // Employment handlers
  const handleAddWorkExperience = () => {
    setNewCandidateData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, {
        period: '',
        company_name: '',
        business_purpose: '',
        scale_role: '',
        description: '',
        tools_tech: ''
      }]
    }));
  };

  const updateEmployment = (index, field, value) => {
    const updated = [...newCandidateData.workExperiences];
    updated[index][field] = value;
    setNewCandidateData(prev => ({ ...prev, workExperiences: updated }));
  };

  const removeEmployment = (index) => {
    setNewCandidateData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index)
    }));
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    setNewCandidateData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { year: '', month: '', name: '' }]
    }));
  };

  const updateCertificate = (index, field, value) => {
    const updated = [...newCandidateData.certificates];
    updated[index][field] = value;
    setNewCandidateData(prev => ({ ...prev, certificates: updated }));
  };

  const removeCertificate = (index) => {
    setNewCandidateData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  const handleCandidateSelect = (candidate) => {
    setFormData(prev => ({
      ...prev,
      candidateId: candidate.id,
      candidateName: candidate.fullName || candidate.name,
      name: candidate.fullName || candidate.name,
      email: candidate.email || '',
      phone: candidate.phone || '',
      birthDate: candidate.birthDate || '',
      gender: candidate.gender || '',
    }));
    setCandidateSearch(candidate.fullName || candidate.name);
    setShowCandidateDropdown(false);
    // Clear errors
    if (errors.candidateId) {
      setErrors(prev => ({ ...prev, candidateId: '' }));
    }
  };

  const handleJobSelect = (job) => {
    setFormData(prev => ({
      ...prev,
      jobId: job.id,
      jobTitle: job.title,
    }));
    setJobSearch(job.title);
    setShowJobDropdown(false);
    // Clear errors
    if (errors.jobId) {
      setErrors(prev => ({ ...prev, jobId: '' }));
    }
  };

  const handleCollaboratorSelect = (collaborator) => {
    setFormData(prev => ({
      ...prev,
      collaboratorId: collaborator.id,
      collaboratorName: collaborator.name,
    }));
    setCollaboratorSearch(collaborator.name);
    setShowCollaboratorDropdown(false);
  };

  const filteredCandidates = candidates.filter(c => {
    const searchLower = candidateSearch.toLowerCase();
    return (
      (c.fullName || c.name || '').toLowerCase().includes(searchLower) ||
      (c.code || c.id || '').toString().includes(candidateSearch) ||
      (c.email || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredJobs = jobs.filter(j => {
    const searchLower = jobSearch.toLowerCase();
    return (
      (j.title || '').toLowerCase().includes(searchLower) ||
      (j.jobCode || j.id || '').toString().includes(jobSearch) ||
      (j.company?.name || j.companyName || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredCollaborators = collaborators.filter(c => {
    const searchLower = collaboratorSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(searchLower) ||
      (c.code || c.id || '').toString().includes(collaboratorSearch) ||
      (c.email || '').toLowerCase().includes(searchLower)
    );
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobId) {
      newErrors.jobId = 'Công việc là bắt buộc';
    }

    if (!formData.candidateId && !formData.name) {
      newErrors.candidateId = 'Ứng viên là bắt buộc';
    }

    // Nếu không chọn CV có sẵn, cần có name, birthDate, gender
    if (!formData.candidateId) {
      if (candidateTab === 'new') {
        if (!newCandidateData.nameKanji || !newCandidateData.nameKanji.trim()) {
          newErrors.nameKanji = 'Tên ứng viên (Kanji) là bắt buộc';
        }
        if (!newCandidateData.email || !newCandidateData.email.trim()) {
          newErrors.email = 'Email là bắt buộc';
        }
      } else {
        if (!formData.name || !formData.name.trim()) {
          newErrors.name = 'Tên ứng viên là bắt buộc';
        }
        if (!formData.birthDate) {
          newErrors.birthDate = 'Ngày sinh là bắt buộc';
        }
        if (!formData.gender) {
          newErrors.gender = 'Giới tính là bắt buộc';
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
      const submitFormData = new FormData();
      
      // Required fields
      submitFormData.append('jobId', formData.jobId);
      if (formData.candidateId) {
        submitFormData.append('cvId', formData.candidateId);
      } else if (nominationId) {
        // When editing, if no candidateId, we need to keep the existing cvId
        // This will be handled by backend, but we can add it if needed
      }
      if (formData.collaboratorId) {
        submitFormData.append('collaboratorId', formData.collaboratorId);
      }
      
      // Candidate info (required if no cvId)
      if (candidateTab === 'new' && !formData.candidateId) {
        // Create CV storage first if creating new candidate
        const cvFormData = new FormData();
        
        // Map frontend field names to backend field names
        // Personal info
        cvFormData.append('nameKanji', newCandidateData.nameKanji || '');
        cvFormData.append('nameKana', newCandidateData.nameKana || '');
        cvFormData.append('birthDate', newCandidateData.birthDate || '');
        cvFormData.append('age', newCandidateData.age || '');
        // Gender: convert from "男"/"女" to 1/2
        let genderValue = newCandidateData.gender || '';
        if (genderValue === '男') genderValue = '1';
        else if (genderValue === '女') genderValue = '2';
        cvFormData.append('gender', genderValue);
        
        // Contact info
        cvFormData.append('postalCode', newCandidateData.postalCode || '');
        cvFormData.append('address', newCandidateData.address || ''); // Backend will map to addressCurrent
        cvFormData.append('phone', newCandidateData.phone || '');
        cvFormData.append('email', newCandidateData.email || '');
        
        // Additional personal info
        cvFormData.append('addressOrigin', newCandidateData.addressOrigin || '');
        cvFormData.append('passport', newCandidateData.passport || '');
        cvFormData.append('currentResidence', newCandidateData.currentResidence || '');
        cvFormData.append('jpResidenceStatus', newCandidateData.jpResidenceStatus || '');
        cvFormData.append('visaExpirationDate', newCandidateData.visaExpirationDate || '');
        cvFormData.append('otherCountry', newCandidateData.otherCountry || '');
        cvFormData.append('spouse', newCandidateData.spouse || '');
        
        // JSON fields - send as JSON strings (backend will parse)
        cvFormData.append('educations', JSON.stringify(newCandidateData.educations || []));
        cvFormData.append('workExperiences', JSON.stringify(newCandidateData.workExperiences || []));
        cvFormData.append('certificates', JSON.stringify(newCandidateData.certificates || []));
        
        // Skills and summary
        cvFormData.append('technicalSkills', newCandidateData.technicalSkills || '');
        cvFormData.append('careerSummary', newCandidateData.careerSummary || '');
        cvFormData.append('strengths', newCandidateData.strengths || '');
        cvFormData.append('motivation', newCandidateData.motivation || '');
        
        // Preferences
        cvFormData.append('currentSalary', newCandidateData.currentSalary || '');
        cvFormData.append('desiredSalary', newCandidateData.desiredSalary || '');
        cvFormData.append('desiredPosition', newCandidateData.desiredPosition || '');
        cvFormData.append('desiredLocation', newCandidateData.desiredLocation || '');
        cvFormData.append('desiredStartDate', newCandidateData.desiredStartDate || '');
        cvFormData.append('nyushaTime', newCandidateData.nyushaTime || '');
        cvFormData.append('interviewTime', newCandidateData.interviewTime || '');
        
        // Additional fields
        cvFormData.append('jlptLevel', newCandidateData.jlptLevel || '');
        cvFormData.append('experienceYears', newCandidateData.experienceYears || '');
        cvFormData.append('specialization', newCandidateData.specialization || '');
        cvFormData.append('qualification', newCandidateData.qualification || '');
        cvFormData.append('otherDocuments', newCandidateData.otherDocuments || '');
        cvFormData.append('notes', newCandidateData.notes || '');
        
        // Collaborator ID (if provided)
        if (formData.collaboratorId) {
          cvFormData.append('collaboratorId', formData.collaboratorId);
        }
        
        // File upload
        if (cvFiles.length > 0) {
          cvFiles.forEach((file) => {
            cvFormData.append('cvFile', file);
          });
        }

        const cvResponse = await apiService.createAdminCV(cvFormData);
        if (cvResponse.success && cvResponse.data?.cv?.id) {
          submitFormData.append('cvId', cvResponse.data.cv.id);
          setFormData(prev => ({ ...prev, candidateId: cvResponse.data.cv.id }));
        } else {
          alert('Có lỗi xảy ra khi tạo hồ sơ ứng viên');
          return;
        }
      } else {
        if (formData.name) submitFormData.append('name', formData.name);
        if (formData.birthDate) submitFormData.append('birthDate', formData.birthDate);
        if (formData.gender) submitFormData.append('gender', formData.gender);
        if (formData.email) submitFormData.append('email', formData.email);
        if (formData.phone) submitFormData.append('phone', formData.phone);
      }
      
      // Dates
      if (formData.appliedDate) submitFormData.append('appliedAt', formData.appliedDate);
      if (formData.interviewDate) submitFormData.append('interviewDate', formData.interviewDate);
      
      // Status - map từ frontend labels sang backend numbers
      const statusMap = {
        'pending': 1,
        'interviewed': 4,
        'accepted': 8,
        'rejected': 15
      };
      const statusValue = typeof formData.status === 'string' 
        ? (statusMap[formData.status] || 1)
        : formData.status;
      submitFormData.append('status', statusValue);
      
      // Financial
      if (formData.referralFee) submitFormData.append('referralFee', formData.referralFee);
      if (formData.annualSalary) submitFormData.append('annualSalary', formData.annualSalary);
      if (formData.monthlySalary) submitFormData.append('monthlySalary', formData.monthlySalary);
      submitFormData.append('salaryType', formData.salaryType || 2);
      
      // Notes
      if (formData.notes) submitFormData.append('notes', formData.notes);

      const response = nominationId 
        ? await apiService.updateAdminJobApplication(nominationId, submitFormData)
        : await apiService.createAdminJobApplication(submitFormData);
      if (response.success) {
        alert(nominationId ? 'Đơn tiến cử đã được cập nhật thành công!' : 'Đơn tiến cử đã được tạo thành công!');
        navigate(nominationId ? `/admin/nominations/${nominationId}` : '/admin/nominations');
      } else {
        alert(response.message || (nominationId ? 'Có lỗi xảy ra khi cập nhật đơn tiến cử' : 'Có lỗi xảy ra khi tạo đơn tiến cử'));
      }
    } catch (error) {
      console.error('Error creating nomination:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo đơn tiến cử');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate(nominationId ? `/admin/nominations/${nominationId}` : '/admin/nominations');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5" />;
      case 'interviewed':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'accepted':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(nominationId ? `/admin/nominations/${nominationId}` : '/admin/nominations')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{nominationId ? 'Chỉnh sửa đơn tiến cử' : 'Tạo đơn tiến cử'}</h1>
            <p className="text-xs text-gray-500 mt-1">{nominationId ? 'Cập nhật thông tin đơn tiến cử' : 'Thêm đơn tiến cử ứng viên vào job mới'}</p>
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? (nominationId ? 'Đang cập nhật...' : 'Đang lưu...') : (nominationId ? 'Cập nhật đơn tiến cử' : 'Lưu đơn tiến cử')}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Candidate Selection */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <User className="w-4 h-4 text-blue-600" />
              Ứng viên <span className="text-red-500">*</span>
            </h2>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-3">
              <button
                type="button"
                onClick={() => {
                  setCandidateTab('existing');
                  setFormData(prev => ({ ...prev, candidateId: null, candidateName: '', name: '', email: '', phone: '', birthDate: '', gender: '' }));
                }}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  candidateTab === 'existing'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Chọn ứng viên có sẵn
              </button>
              <button
                type="button"
                onClick={() => {
                  setCandidateTab('new');
                  setFormData(prev => ({ ...prev, candidateId: null, candidateName: '', name: '', email: '', phone: '', birthDate: '', gender: '' }));
                }}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  candidateTab === 'new'
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Tạo ứng viên mới
              </button>
            </div>

            {candidateTab === 'existing' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Tìm kiếm ứng viên
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nhập tên hoặc ID ứng viên..."
                      value={candidateSearch}
                      onChange={(e) => {
                        setCandidateSearch(e.target.value);
                        setShowCandidateDropdown(true);
                      }}
                      onFocus={() => setShowCandidateDropdown(true)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {showCandidateDropdown && filteredCandidates.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCandidates.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() => handleCandidateSelect(candidate)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium text-gray-900">{candidate.fullName || candidate.name}</div>
                              <div className="text-gray-500">{candidate.code || candidate.id} • {candidate.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.candidateId && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-medium text-blue-900">Đã chọn: {formData.candidateName}</div>
                      <div className="text-[10px] text-blue-700">ID: {formData.candidateId}</div>
                    </div>
                  )}
                  {errors.candidateId && <p className="text-[10px] text-red-500 mt-1">{errors.candidateId}</p>}
                  {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
                  {errors.birthDate && <p className="text-[10px] text-red-500 mt-1">{errors.birthDate}</p>}
                  {errors.gender && <p className="text-[10px] text-red-500 mt-1">{errors.gender}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Họ tên (Kanji) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nameKanji"
                        value={newCandidateData.nameKanji}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 山田 太郎"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.nameKanji && <p className="text-[10px] text-red-500 mt-1">{errors.nameKanji}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Họ tên (Kana)
                      </label>
                      <input
                        type="text"
                        name="nameKana"
                        value={newCandidateData.nameKana}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: やまだ たろう"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="text"
                        name="birthDate"
                        value={newCandidateData.birthDate}
                        onChange={handleNewCandidateInputChange}
                        placeholder="1990年1月1日"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Tuổi
                      </label>
                      <input
                        type="text"
                        name="age"
                        value={newCandidateData.age}
                        onChange={handleNewCandidateInputChange}
                        placeholder="30"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={newCandidateData.gender}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="男">Nam (男)</option>
                        <option value="女">Nữ (女)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newCandidateData.email}
                        onChange={handleNewCandidateInputChange}
                        placeholder="email@example.com"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={newCandidateData.phone}
                        onChange={handleNewCandidateInputChange}
                        placeholder="090-1234-5678"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Mã bưu điện
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={newCandidateData.postalCode}
                      onChange={handleNewCandidateInputChange}
                      placeholder="123-4567"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Địa chỉ hiện tại
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={newCandidateData.address}
                      onChange={handleNewCandidateInputChange}
                      placeholder="東京都渋谷区..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Địa chỉ gốc
                    </label>
                    <input
                      type="text"
                      name="addressOrigin"
                      value={newCandidateData.addressOrigin}
                      onChange={handleNewCandidateInputChange}
                      placeholder="Hà Nội, Việt Nam"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Có hộ chiếu
                      </label>
                      <select
                        name="passport"
                        value={newCandidateData.passport}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">Có</option>
                        <option value="0">Không</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Nơi cư trú hiện tại
                      </label>
                      <select
                        name="currentResidence"
                        value={newCandidateData.currentResidence}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">Việt Nam</option>
                        <option value="2">Nhật Bản</option>
                        <option value="3">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Tình trạng cư trú tại Nhật
                      </label>
                      <select
                        name="jpResidenceStatus"
                        value={newCandidateData.jpResidenceStatus}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">永住者</option>
                        <option value="2">定住者</option>
                        <option value="3">技術・人文知識・国際業務</option>
                        <option value="4">その他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Ngày hết hạn visa
                      </label>
                      <input
                        type="date"
                        name="visaExpirationDate"
                        value={newCandidateData.visaExpirationDate}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Quốc gia khác
                      </label>
                      <input
                        type="text"
                        name="otherCountry"
                        value={newCandidateData.otherCountry}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: USA"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Có vợ/chồng
                      </label>
                      <select
                        name="spouse"
                        value={newCandidateData.spouse}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">Có</option>
                        <option value="0">Không</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education & Work Experience */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900">Học vấn & Kinh nghiệm</h3>
                  
                  {/* Education */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-semibold text-gray-900">
                        Học vấn
                      </label>
                      <button
                        type="button"
                        onClick={handleAddEducation}
                        className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm
                      </button>
                    </div>
                    {newCandidateData.educations.map((edu, index) => (
                      <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Năm"
                            value={edu.year || ''}
                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <input
                            type="text"
                            placeholder="Tháng"
                            value={edu.month || ''}
                            onChange={(e) => updateEducation(index, 'month', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <textarea
                          placeholder="Nội dung học vấn..."
                          value={edu.content || ''}
                          onChange={(e) => updateEducation(index, 'content', e.target.value)}
                          rows="2"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Work Experience */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-semibold text-gray-900">
                        Kinh nghiệm làm việc
                      </label>
                      <button
                        type="button"
                        onClick={handleAddWorkExperience}
                        className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm
                      </button>
                    </div>
                    {newCandidateData.workExperiences.map((exp, index) => (
                      <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Thời gian"
                            value={exp.period || ''}
                            onChange={(e) => updateEmployment(index, 'period', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <input
                            type="text"
                            placeholder="Tên công ty"
                            value={exp.company_name || ''}
                            onChange={(e) => updateEmployment(index, 'company_name', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Mục đích kinh doanh"
                          value={exp.business_purpose || ''}
                          onChange={(e) => updateEmployment(index, 'business_purpose', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <input
                          type="text"
                          placeholder="Quy mô/Vai trò"
                          value={exp.scale_role || ''}
                          onChange={(e) => updateEmployment(index, 'scale_role', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <textarea
                          placeholder="Mô tả công việc..."
                          value={exp.description || ''}
                          onChange={(e) => updateEmployment(index, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Công cụ/Công nghệ"
                            value={exp.tools_tech || ''}
                            onChange={(e) => updateEmployment(index, 'tools_tech', e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeEmployment(index)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills & Certificates */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900">Kỹ năng & Chứng chỉ</h3>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Kỹ năng kỹ thuật
                    </label>
                    <textarea
                      name="technicalSkills"
                      value={newCandidateData.technicalSkills}
                      onChange={handleNewCandidateInputChange}
                      placeholder="VD: Java, React, Node.js..."
                      rows="3"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-semibold text-gray-900">
                        Chứng chỉ
                      </label>
                      <button
                        type="button"
                        onClick={handleAddCertificate}
                        className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm
                      </button>
                    </div>
                    {newCandidateData.certificates.map((cert, index) => (
                      <div key={index} className="mb-2 p-2 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Năm"
                            value={cert.year || ''}
                            onChange={(e) => updateCertificate(index, 'year', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <input
                            type="text"
                            placeholder="Tháng"
                            value={cert.month || ''}
                            onChange={(e) => updateCertificate(index, 'month', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <input
                            type="text"
                            placeholder="Tên chứng chỉ"
                            value={cert.name || ''}
                            onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeCertificate(index)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Trình độ JLPT
                      </label>
                      <select
                        name="jlptLevel"
                        value={newCandidateData.jlptLevel}
                        onChange={handleNewCandidateInputChange}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">N1</option>
                        <option value="2">N2</option>
                        <option value="3">N3</option>
                        <option value="4">N4</option>
                        <option value="5">N5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Số năm kinh nghiệm
                      </label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={newCandidateData.experienceYears}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 5"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Self Introduction */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900">Giới thiệu bản thân</h3>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Tóm tắt sự nghiệp
                    </label>
                    <textarea
                      name="careerSummary"
                      value={newCandidateData.careerSummary}
                      onChange={handleNewCandidateInputChange}
                      placeholder="Tóm tắt về sự nghiệp của bạn..."
                      rows="3"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Điểm mạnh
                    </label>
                    <textarea
                      name="strengths"
                      value={newCandidateData.strengths}
                      onChange={handleNewCandidateInputChange}
                      placeholder="Điểm mạnh của bạn..."
                      rows="2"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Động lực
                    </label>
                    <textarea
                      name="motivation"
                      value={newCandidateData.motivation}
                      onChange={handleNewCandidateInputChange}
                      placeholder="Động lực làm việc của bạn..."
                      rows="2"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900">Nguyện vọng</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Lương hiện tại
                      </label>
                      <input
                        type="text"
                        name="currentSalary"
                        value={newCandidateData.currentSalary}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 500万円"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Lương mong muốn
                      </label>
                      <input
                        type="text"
                        name="desiredSalary"
                        value={newCandidateData.desiredSalary}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 700万円"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Vị trí mong muốn
                    </label>
                    <input
                      type="text"
                      name="desiredPosition"
                      value={newCandidateData.desiredPosition}
                      onChange={handleNewCandidateInputChange}
                      placeholder="VD: Software Engineer"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Địa điểm làm việc mong muốn
                    </label>
                    <input
                      type="text"
                      name="desiredLocation"
                      value={newCandidateData.desiredLocation}
                      onChange={handleNewCandidateInputChange}
                      placeholder="VD: Tokyo"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Thời gian nhập công ty
                      </label>
                      <input
                        type="text"
                        name="nyushaTime"
                        value={newCandidateData.nyushaTime}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 2025年4月"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Thời gian phỏng vấn
                      </label>
                      <input
                        type="text"
                        name="interviewTime"
                        value={newCandidateData.interviewTime}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 2025年3月"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Ngày bắt đầu mong muốn
                    </label>
                    <input
                      type="date"
                      name="desiredStartDate"
                      value={newCandidateData.desiredStartDate}
                      onChange={handleNewCandidateInputChange}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-900">Thông tin bổ sung</h3>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Tài liệu khác
                    </label>
                    <input
                      type="text"
                      name="otherDocuments"
                      value={newCandidateData.otherDocuments}
                      onChange={handleNewCandidateInputChange}
                      placeholder="VD: Portfolio, GitHub..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={newCandidateData.notes}
                      onChange={handleNewCandidateInputChange}
                      placeholder="Ghi chú về ứng viên..."
                      rows="3"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>
                </div>

                {/* CV Upload */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-900">Upload CV</h3>
                  {cvFiles.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-600 transition-colors">
                      <label htmlFor="cv-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <p className="text-xs font-semibold text-gray-900">Chọn file PDF</p>
                          <p className="text-[10px] text-gray-500">Tự động trích xuất dữ liệu</p>
                        </div>
                        <input
                          id="cv-upload"
                          type="file"
                          accept=".pdf"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cvFiles.map((file, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">{file.name}</p>
                              <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCV(index)}
                            className="text-gray-400 hover:text-red-600"
                            disabled={isParsing}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {isParsing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-xs text-blue-800">
                            Đang phân tích... ({parseProgress.current}/{parseProgress.total})
                          </p>
                        </div>
                      )}
                      {parseError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-800">
                          {parseError}
                        </div>
                      )}
                      {parseSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-800">
                          {parseSuccess}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Note: Simplified - full form can be expanded if needed */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-[10px] text-blue-800">
                    Hệ thống sẽ tự động điền thông tin từ CV đã upload. Bạn có thể chỉnh sửa sau.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Job Selection */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Công việc <span className="text-red-500">*</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tìm kiếm công việc
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên job, ID hoặc công ty..."
                    value={jobSearch}
                    onChange={(e) => {
                      setJobSearch(e.target.value);
                      setShowJobDropdown(true);
                    }}
                    onFocus={() => setShowJobDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {showJobDropdown && filteredJobs.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleJobSelect(job)}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100"
                        >
                          <div className="font-medium text-gray-900">{job.title}</div>
                          <div className="text-gray-500">{job.jobCode || job.id} • {job.company?.name || job.companyName || '-'}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.jobId && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-medium text-blue-900">Đã chọn: {formData.jobTitle}</div>
                    <div className="text-[10px] text-blue-700">ID: {formData.jobId}</div>
                  </div>
                )}
                {errors.jobId && <p className="text-[10px] text-red-500 mt-1">{errors.jobId}</p>}
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/jobs/create')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>+ Tạo job mới</span>
              </button>
            </div>
          </div>

          {/* Collaborator Selection */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Users className="w-4 h-4 text-blue-600" />
              Cộng tác viên
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tìm kiếm CTV
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên hoặc ID CTV..."
                    value={collaboratorSearch}
                    onChange={(e) => {
                      setCollaboratorSearch(e.target.value);
                      setShowCollaboratorDropdown(true);
                    }}
                    onFocus={() => setShowCollaboratorDropdown(true)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {showCollaboratorDropdown && filteredCollaborators.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCollaborators.map((collaborator) => (
                        <button
                          key={collaborator.id}
                          type="button"
                          onClick={() => handleCollaboratorSelect(collaborator)}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{collaborator.name}</div>
                            <div className="text-gray-500">{collaborator.id} • {collaborator.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.collaboratorId && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-medium text-blue-900">Đã chọn: {formData.collaboratorName}</div>
                    <div className="text-[10px] text-blue-700">ID: {formData.collaboratorId}</div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-assign-ctv"
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="auto-assign-ctv" className="text-xs text-gray-700">
                  Tự động gán CTV
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Dates */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Calendar className="w-4 h-4 text-blue-600" />
              Ngày tháng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Ngày tiến cử <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="date"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Ngày phỏng vấn (dự kiến)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="date"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Clock className="w-4 h-4 text-blue-600" />
              Trạng thái
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Trạng thái đơn tiến cử
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="1">Đang chờ (Admin đang xử lý)</option>
                  <option value="4">Đã phỏng vấn</option>
                  <option value="8">Đã nhận việc (Nyusha)</option>
                  <option value="15">Đã từ chối</option>
                </select>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-xs">
                  {getStatusIcon(formData.status === 1 ? 'pending' : formData.status === 4 ? 'interviewed' : formData.status === 8 ? 'accepted' : 'rejected')}
                  <span className="font-medium text-gray-700">
                    {formData.status === 1 && 'Đang chờ xử lý'}
                    {formData.status === 4 && 'Đã được phỏng vấn'}
                    {formData.status === 8 && 'Đã được nhận việc'}
                    {formData.status === 15 && 'Đã bị từ chối'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Thông tin tài chính
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Phí giới thiệu (VNĐ)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="number"
                    name="referralFee"
                    value={formData.referralFee}
                    onChange={handleInputChange}
                    placeholder="VD: 500000"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                {formData.referralFee && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    {Number(formData.referralFee).toLocaleString('vi-VN')} VNĐ
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Lương (ước tính)
                </label>
                  <div className="space-y-2">
                    <select
                      name="salaryType"
                      value={formData.salaryType}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryType: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="1">Lương năm (万円/năm)</option>
                      <option value="2">Lương tháng (万円/tháng)</option>
                    </select>
                    {formData.salaryType === 1 ? (
                      <input
                        type="number"
                        name="annualSalary"
                        value={formData.annualSalary}
                        onChange={handleInputChange}
                        placeholder="VD: 800"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    ) : (
                      <input
                        type="number"
                        name="monthlySalary"
                        value={formData.monthlySalary}
                        onChange={handleInputChange}
                        placeholder="VD: 50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    )}
                  </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Ghi chú
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                Ghi chú nội bộ
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Nhập ghi chú về đơn tiến cử này..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
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
          {loading ? 'Đang lưu...' : 'Lưu đơn tiến cử'}
        </button>
      </div>
    </div>
  );
};

export default AdminAddNominationPage;

