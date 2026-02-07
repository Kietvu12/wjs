import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  Edit,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Check,
} from 'lucide-react';


const AdminAddNominationPage = () => {
  const navigate = useNavigate();
  const { nominationId, jobId: jobIdFromParams } = useParams();
  const [searchParams] = useSearchParams();
  const jobIdFromQuery = searchParams.get('jobId');
  const jobId = jobIdFromParams || jobIdFromQuery;
  const [adminProfile, setAdminProfile] = useState(null);
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
    yearlySalary: '',
    // Notes
    notes: '',
    // Required fields for API
    name: '',
    birthDate: '',
    gender: '', // 1: Nam, 2: Nữ
  });

  const [step, setStep] = useState('form'); // 'form' or 'confirm'
  const [candidateTab, setCandidateTab] = useState('existing'); // 'existing' or 'new'
  const [candidateSearch, setCandidateSearch] = useState('');
  const [jobSearch, setJobSearch] = useState('');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false);
  const [showCollaboratorDropdown, setShowCollaboratorDropdown] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobsPagination, setJobsPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    total: 0,
    totalPages: 0
  });
  const [jobsLoading, setJobsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingCV, setEditingCV] = useState(false);
  const [cvEditData, setCvEditData] = useState({});
  const [savingCV, setSavingCV] = useState(false);

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
    // Load admin profile to check role
    const loadAdminProfile = async () => {
      try {
        const response = await apiService.getAdminProfile();
        if (response.success && response.data?.admin) {
          setAdminProfile(response.data.admin);
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
      }
    };
    loadAdminProfile();
  }, []);

  // Load collaborators when adminProfile is available
  useEffect(() => {
    if (adminProfile !== null) {
      loadCollaborators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminProfile]);

  // Load candidates when collaborator is selected
  useEffect(() => {
    if (formData.collaboratorId) {
      console.log('[useEffect] Collaborator selected, loading candidates for:', formData.collaboratorId);
      loadCandidates(formData.collaboratorId);
    } else {
      // Reset candidates when no collaborator selected
      console.log('[useEffect] No collaborator selected, resetting candidates');
      setCandidates([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.collaboratorId]);

  useEffect(() => {
    loadJobs(1, jobSearch);
    if (nominationId) {
      loadNominationData();
    } else if (jobId) {
      // If jobId is provided in params or query, pre-select the job
      const preSelectJob = async () => {
        try {
          const jobResponse = await apiService.getAdminJobById(jobId);
          if (jobResponse.success && jobResponse.data?.job) {
            const job = jobResponse.data.job;
            setFormData(prev => ({
              ...prev,
              jobId: job.id,
              jobTitle: job.title,
            }));
            setSelectedJob(job);
            setJobSearch(job.title);
          }
        } catch (error) {
          console.error('Error loading job:', error);
        }
      };
      preSelectJob();
    }
  }, [nominationId, jobId]);

  const loadNominationData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminJobApplicationById(nominationId);
      if (response.success && response.data?.jobApplication) {
        const app = response.data.jobApplication;
        
        // Set job data first
        if (app.jobId) {
          const jobIdStr = app.jobId.toString();
          setFormData(prev => ({
            ...prev,
            jobId: jobIdStr, // Ensure it's a string
            jobTitle: app.job?.title || '',
          }));
          
          // If job object exists, use it; otherwise load from API
          if (app.job && app.job.id) {
            setSelectedJob(app.job);
            setJobSearch(app.job.title || '');
          } else {
            // Load job details from API
            try {
              const jobResponse = await apiService.getAdminJobById(app.jobId);
              if (jobResponse.success && jobResponse.data?.job) {
                setSelectedJob(jobResponse.data.job);
                setJobSearch(jobResponse.data.job.title || '');
                setFormData(prev => ({
                  ...prev,
                  jobTitle: jobResponse.data.job.title || '',
                }));
              } else {
                setJobSearch(`Job ID: ${app.jobId}`);
              }
            } catch (jobError) {
              console.error('Error loading job:', jobError);
              setJobSearch(`Job ID: ${app.jobId}`);
            }
          }
        }
        
        // Set candidate data
        if (app.cvCode && app.cv) {
          // If CV exists, load it and set as selected
          setCandidateTab('existing');
          setFormData(prev => ({
            ...prev,
            candidateId: app.cv.id?.toString() || '',
            candidateName: app.cv.name || app.cv.fullName || app.name || '',
            name: app.cv.name || app.cv.fullName || app.name || '',
            email: app.cv.email || '',
            phone: app.cv.phone || '',
            birthDate: app.cv.birthDate || app.birthDate || '',
            gender: app.cv.gender?.toString() || app.gender?.toString() || '',
          }));
          setSelectedCandidate(app.cv);
          setCandidateSearch(app.cv.name || app.cv.fullName || app.name || '');
          setCvEditData({
            name: app.cv.name || app.cv.fullName || '',
            furigana: app.cv.furigana || '',
            email: app.cv.email || '',
            phone: app.cv.phone || '',
            birthDate: app.cv.birthDate || '',
            age: app.cv.ages || app.cv.age || '',
            gender: app.cv.gender?.toString() || '',
            addressCurrent: app.cv.addressCurrent || app.cv.address || '',
            currentIncome: app.cv.currentIncome || app.cv.currentSalary || '',
            desiredIncome: app.cv.desiredIncome || app.cv.desiredSalary || '',
            desiredWorkLocation: app.cv.desiredWorkLocation || app.cv.desiredLocation || '',
            nyushaTime: app.cv.nyushaTime || '',
            strengths: app.cv.strengths || '',
            motivation: app.cv.motivation || '',
          });
        } else if (app.cvCode) {
          // If only cvCode exists, try to load CV by code
          try {
            const cvResponse = await apiService.getAdminCVs({ search: app.cvCode, limit: 1 });
            if (cvResponse.success && cvResponse.data?.cvs && cvResponse.data.cvs.length > 0) {
              const cv = cvResponse.data.cvs[0];
              setCandidateTab('existing');
              setFormData(prev => ({
                ...prev,
                candidateId: cv.id?.toString() || '',
                candidateName: cv.name || cv.fullName || app.name || '',
                name: cv.name || cv.fullName || app.name || '',
                email: cv.email || '',
                phone: cv.phone || '',
                birthDate: cv.birthDate || app.birthDate || '',
                gender: cv.gender?.toString() || app.gender?.toString() || '',
              }));
              setSelectedCandidate(cv);
              setCandidateSearch(cv.name || cv.fullName || app.name || '');
              setCvEditData({
                name: cv.name || cv.fullName || '',
                furigana: cv.furigana || '',
                email: cv.email || '',
                phone: cv.phone || '',
                birthDate: cv.birthDate || '',
                age: cv.ages || cv.age || '',
                gender: cv.gender?.toString() || '',
                addressCurrent: cv.addressCurrent || cv.address || '',
                currentIncome: cv.currentIncome || cv.currentSalary || '',
                desiredIncome: cv.desiredIncome || cv.desiredSalary || '',
                desiredWorkLocation: cv.desiredWorkLocation || cv.desiredLocation || '',
                nyushaTime: cv.nyushaTime || '',
                strengths: cv.strengths || '',
                motivation: cv.motivation || '',
              });
            } else {
              // Fallback: use data from application
              setCandidateTab('existing');
              setFormData(prev => ({
                ...prev,
                candidateName: app.name || '',
                name: app.name || '',
                birthDate: app.birthDate || '',
                gender: app.gender?.toString() || '',
              }));
              setCandidateSearch(app.name || '');
            }
          } catch (cvError) {
            console.error('Error loading CV by code:', cvError);
            // Fallback: use data from application
            setCandidateTab('existing');
            setFormData(prev => ({
              ...prev,
              candidateName: app.name || '',
              name: app.name || '',
              birthDate: app.birthDate || '',
              gender: app.gender?.toString() || '',
            }));
            setCandidateSearch(app.name || '');
          }
        } else {
          // No CV, use application data
          setCandidateTab('existing');
          setFormData(prev => ({
            ...prev,
            candidateName: app.name || '',
            name: app.name || '',
            birthDate: app.birthDate || '',
            gender: app.gender?.toString() || '',
          }));
          setCandidateSearch(app.name || '');
        }
        
        // Set other form data
        setFormData(prev => ({
          ...prev,
          collaboratorId: app.collaboratorId?.toString() || '',
          collaboratorName: app.collaborator?.name || '',
          appliedDate: app.appliedAt ? app.appliedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          interviewDate: app.interviewDate ? app.interviewDate.split('T')[0] : '',
          status: app.status || 1,
          referralFee: app.referralFee || '',
          yearlySalary: app.yearlySalary || app.annualSalary || '',
          notes: app.notes || '',
        }));
        
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

  const loadCandidates = async (collaboratorId = null) => {
    try {
      const params = { limit: 100 };
      
      // Nếu đã chọn CTV, chỉ load CV của CTV đó
      if (collaboratorId) {
        params.collaboratorId = parseInt(collaboratorId);
      }
      
      console.log('[loadCandidates] Loading candidates with params:', params);
      const response = await apiService.getAdminCVs(params);
      if (response.success && response.data) {
        const cvs = response.data.cvs || [];
        console.log('[loadCandidates] Loaded candidates:', cvs.length);
        setCandidates(cvs);
      } else {
        console.log('[loadCandidates] No candidates found or error:', response);
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    }
  };

  const loadJobs = async (page = 1, search = '') => {
    try {
      setJobsLoading(true);
      const limit = jobsPagination.itemsPerPage || 10; // Default to 10 if not set
      const params = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status: 1, // Only published jobs
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      console.log('[loadJobs] Loading jobs with params:', params);
      const response = await apiService.getAdminJobs(params);
      if (response.success && response.data) {
        const jobs = response.data.jobs || [];
        const pagination = response.data.pagination || {};
        console.log('[loadJobs] Loaded jobs:', jobs.length, 'Pagination:', pagination);
        
        setJobs(jobs);
        setJobsPagination(prev => ({
          ...prev,
          currentPage: pagination.page || page,
          total: pagination.total || 0,
          totalPages: pagination.totalPages || 0,
          itemsPerPage: pagination.limit || limit
        }));
      } else {
        console.log('[loadJobs] No jobs found or error:', response);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleJobSearch = () => {
    const newPage = 1;
    setJobsPagination(prev => ({ ...prev, currentPage: newPage }));
    loadJobs(newPage, jobSearch);
  };

  const loadCollaborators = async () => {
    try {
      // Check if user is AdminBackOffice (role = 2)
      const isAdminBackOffice = adminProfile?.role === 2;
      
      if (isAdminBackOffice) {
        // AdminBackOffice: chỉ load CTV được phân công cho mình
        const response = await apiService.getMyAssignedCollaborators({ 
          limit: 100,
          status: 1 // Chỉ lấy assignment active
        });
        if (response.success && response.data) {
          // Extract collaborators from assignments
          const assignedCollaborators = (response.data.assignments || [])
            .map(assignment => assignment.collaborator)
            .filter(c => c && c.status === 1); // Filter active CTV
          setCollaborators(assignedCollaborators);
        }
      } else {
        // Super Admin: load tất cả CTV
        const response = await apiService.getCollaborators({ 
          limit: 100,
          status: 1 // Chỉ lấy CTV active
        });
        if (response.success && response.data) {
          const internalCollaborators = (response.data.collaborators || []).filter(c => {
            // Chỉ lấy CTV active (status = 1)
            return c.status === 1;
          });
          setCollaborators(internalCollaborators);
        }
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

  // Tools handlers
  const handleAddLearnedTool = () => {
    setNewCandidateData(prev => ({
      ...prev,
      learnedTools: [...prev.learnedTools, '']
    }));
  };

  const updateLearnedTool = (index, value) => {
    const updated = [...newCandidateData.learnedTools];
    updated[index] = value;
    setNewCandidateData(prev => ({ ...prev, learnedTools: updated }));
  };

  const removeLearnedTool = (index) => {
    setNewCandidateData(prev => ({
      ...prev,
      learnedTools: prev.learnedTools.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperienceTool = () => {
    setNewCandidateData(prev => ({
      ...prev,
      experienceTools: [...prev.experienceTools, '']
    }));
  };

  const updateExperienceTool = (index, value) => {
    const updated = [...newCandidateData.experienceTools];
    updated[index] = value;
    setNewCandidateData(prev => ({ ...prev, experienceTools: updated }));
  };

  const removeExperienceTool = (index) => {
    setNewCandidateData(prev => ({
      ...prev,
      experienceTools: prev.experienceTools.filter((_, i) => i !== index)
    }));
  };

  const handleCandidateSelect = async (candidate) => {
    try {
      // Load full candidate data
      const cvResponse = await apiService.getAdminCVById(candidate.id);
      const fullCandidate = cvResponse.success && cvResponse.data?.cv ? cvResponse.data.cv : candidate;
      
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
      setSelectedCandidate(fullCandidate);
      setCvEditData({
        name: fullCandidate.name || fullCandidate.fullName || '',
        furigana: fullCandidate.furigana || '',
        email: fullCandidate.email || '',
        phone: fullCandidate.phone || '',
        birthDate: fullCandidate.birthDate || '',
        age: fullCandidate.age || fullCandidate.ages || '',
        gender: fullCandidate.gender?.toString() || '',
        addressCurrent: fullCandidate.addressCurrent || fullCandidate.address || '',
        currentIncome: fullCandidate.currentIncome || fullCandidate.currentSalary || '',
        desiredIncome: fullCandidate.desiredIncome || fullCandidate.desiredSalary || '',
        desiredWorkLocation: fullCandidate.desiredWorkLocation || fullCandidate.desiredLocation || '',
        nyushaTime: fullCandidate.nyushaTime || '',
        strengths: fullCandidate.strengths || '',
        motivation: fullCandidate.motivation || '',
      });
      setCandidateSearch(candidate.fullName || candidate.name);
      setShowCandidateDropdown(false);
      // Clear errors
      if (errors.candidateId) {
        setErrors(prev => ({ ...prev, candidateId: '' }));
      }
    } catch (error) {
      console.error('Error loading candidate:', error);
      // Fallback to basic data
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
      setSelectedCandidate(candidate);
      setCandidateSearch(candidate.fullName || candidate.name);
      setShowCandidateDropdown(false);
    }
  };

  const handleJobSelect = async (job) => {
    try {
      // Load full job data
      const jobResponse = await apiService.getAdminJobById(job.id);
      const fullJob = jobResponse.success && jobResponse.data?.job ? jobResponse.data.job : job;
      
      setFormData(prev => ({
        ...prev,
        jobId: job.id,
        jobTitle: job.title,
      }));
      setSelectedJob(fullJob);
      setJobSearch(job.title);
      // Clear errors
      if (errors.jobId) {
        setErrors(prev => ({ ...prev, jobId: '' }));
      }
    } catch (error) {
      console.error('Error loading job:', error);
      // Fallback to basic data
      setFormData(prev => ({
        ...prev,
        jobId: job.id,
        jobTitle: job.title,
      }));
      setSelectedJob(job);
      setJobSearch(job.title);
    }
  };

  const handleCollaboratorSelect = (collaborator) => {
    setFormData(prev => ({
      ...prev,
      collaboratorId: collaborator.id,
      collaboratorName: collaborator.name,
      // Reset candidate selection khi chọn CTV mới
      candidateId: '',
      candidateName: '',
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      gender: '',
    }));
    setCollaboratorSearch(collaborator.name);
    setShowCollaboratorDropdown(false);
    setSelectedCandidate(null);
    setCandidateSearch('');
    
    // Load lại danh sách candidates của CTV này
    loadCandidates(collaborator.id);
  };

  const filteredCandidates = candidates.filter(c => {
    const searchLower = candidateSearch.toLowerCase();
    return (
      (c.fullName || c.name || '').toLowerCase().includes(searchLower) ||
      (c.code || c.id || '').toString().includes(candidateSearch) ||
      (c.email || '').toLowerCase().includes(searchLower)
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

  const handleGoToConfirm = () => {
    if (!validateForm()) {
      return;
    }

    // Validate jobId is present
    if (!formData.jobId) {
      alert('ID việc làm là bắt buộc');
      setErrors(prev => ({ ...prev, jobId: 'ID việc làm là bắt buộc' }));
      return;
    }

    // Ensure we have selected job and candidate data
    if (!selectedJob && formData.jobId) {
      const job = jobs.find(j => j.id === formData.jobId || j.id.toString() === formData.jobId.toString());
      if (job) {
        setSelectedJob(job);
      } else {
        // Try to load job from API
        apiService.getAdminJobById(formData.jobId).then(response => {
          if (response.success && response.data?.job) {
            setSelectedJob(response.data.job);
          }
        }).catch(err => {
          console.error('Error loading job:', err);
        });
      }
    }
    if (!selectedCandidate && formData.candidateId) {
      const candidate = candidates.find(c => c.id === formData.candidateId || c.id.toString() === formData.candidateId.toString());
      if (candidate) {
        setSelectedCandidate(candidate);
        setCvEditData({
          name: candidate.name || candidate.fullName || '',
          furigana: candidate.furigana || '',
          email: candidate.email || '',
          phone: candidate.phone || '',
          birthDate: candidate.birthDate || '',
          age: candidate.age || candidate.ages || '',
          gender: candidate.gender?.toString() || '',
          addressCurrent: candidate.addressCurrent || candidate.address || '',
          currentIncome: candidate.currentIncome || candidate.currentSalary || '',
          desiredIncome: candidate.desiredIncome || candidate.desiredSalary || '',
          desiredWorkLocation: candidate.desiredWorkLocation || candidate.desiredLocation || '',
          nyushaTime: candidate.nyushaTime || '',
          strengths: candidate.strengths || '',
          motivation: candidate.motivation || '',
        });
      }
    }
    setStep('confirm');
  };

  const handleSaveCVEdit = async () => {
    if (!formData.candidateId) return;

    try {
      setSavingCV(true);
      const updateFormData = new FormData();
      
      // Map edited data to form fields
      updateFormData.append('nameKanji', cvEditData.name || '');
      updateFormData.append('nameKana', cvEditData.furigana || '');
      updateFormData.append('email', cvEditData.email || '');
      updateFormData.append('phone', cvEditData.phone || '');
      updateFormData.append('birthDate', cvEditData.birthDate || '');
      updateFormData.append('age', cvEditData.age || '');
      updateFormData.append('gender', cvEditData.gender || '');
      updateFormData.append('address', cvEditData.addressCurrent || '');
      updateFormData.append('currentSalary', cvEditData.currentIncome || '');
      updateFormData.append('desiredSalary', cvEditData.desiredIncome || '');
      updateFormData.append('desiredLocation', cvEditData.desiredWorkLocation || '');
      updateFormData.append('nyushaTime', cvEditData.nyushaTime || '');
      updateFormData.append('strengths', cvEditData.strengths || '');
      updateFormData.append('motivation', cvEditData.motivation || '');

      const response = await apiService.updateAdminCV(formData.candidateId, updateFormData);
      
      if (response.success) {
        // Reload candidate data
        const cvResponse = await apiService.getAdminCVById(formData.candidateId);
        if (cvResponse.success && cvResponse.data?.cv) {
          setSelectedCandidate(cvResponse.data.cv);
          setCvEditData({
            name: cvResponse.data.cv.name || cvResponse.data.cv.fullName || '',
            furigana: cvResponse.data.cv.furigana || '',
            email: cvResponse.data.cv.email || '',
            phone: cvResponse.data.cv.phone || '',
            birthDate: cvResponse.data.cv.birthDate || '',
            age: cvResponse.data.cv.age || cvResponse.data.cv.ages || '',
            gender: cvResponse.data.cv.gender?.toString() || '',
            addressCurrent: cvResponse.data.cv.addressCurrent || cvResponse.data.cv.address || '',
            currentIncome: cvResponse.data.cv.currentIncome || cvResponse.data.cv.currentSalary || '',
            desiredIncome: cvResponse.data.cv.desiredIncome || cvResponse.data.cv.desiredSalary || '',
            desiredWorkLocation: cvResponse.data.cv.desiredWorkLocation || cvResponse.data.cv.desiredLocation || '',
            nyushaTime: cvResponse.data.cv.nyushaTime || '',
            strengths: cvResponse.data.cv.strengths || '',
            motivation: cvResponse.data.cv.motivation || '',
          });
        }
        setEditingCV(false);
        alert('Đã cập nhật thông tin ứng viên thành công!');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error saving CV edit:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSavingCV(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate jobId is present
    if (!formData.jobId) {
      alert('ID việc làm là bắt buộc');
      setErrors(prev => ({ ...prev, jobId: 'ID việc làm là bắt buộc' }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Required fields - ensure jobId is present
      const jobIdToSubmit = formData.jobId || (selectedJob?.id);
      if (!jobIdToSubmit) {
        alert('ID việc làm là bắt buộc. Vui lòng chọn lại công việc.');
        setLoading(false);
        setStep('form');
        return;
      }
      
      // For update, backend expects JSON (req.body), not FormData
      // For create, we can use FormData if needed
      if (nominationId) {
        // Update: Use JSON object
        const updateData = {
          jobId: parseInt(jobIdToSubmit),
        };
        
        // Add cvCode if candidate is selected
        if (selectedCandidate?.code) {
          updateData.cvCode = selectedCandidate.code;
        } else if (formData.candidateId && selectedCandidate) {
          updateData.cvCode = selectedCandidate.code || formData.candidateId;
        }
        
        if (formData.collaboratorId) {
          updateData.collaboratorId = parseInt(formData.collaboratorId);
        }
        
        if (formData.appliedDate) {
          updateData.appliedAt = formData.appliedDate;
        }
        if (formData.interviewDate) {
          updateData.interviewDate = formData.interviewDate;
        }
        
        // Status
        const statusMap = {
          'pending': 1,
          'interviewed': 4,
          'accepted': 8,
          'rejected': 15
        };
        const statusValue = typeof formData.status === 'string' 
          ? (statusMap[formData.status] || 1)
          : formData.status;
        updateData.status = statusValue;
        
        // Financial
        if (formData.referralFee) updateData.referralFee = parseFloat(formData.referralFee);
        if (formData.yearlySalary) updateData.yearlySalary = parseFloat(formData.yearlySalary);
        
        // Notes
        if (formData.notes) updateData.notes = formData.notes;
        
        const response = await apiService.updateAdminJobApplication(nominationId, updateData);
        if (response.success) {
          alert('Đơn tiến cử đã được cập nhật thành công!');
          navigate(`/admin/nominations/${nominationId}`);
        } else {
          alert(response.message || 'Có lỗi xảy ra khi cập nhật đơn tiến cử');
        }
        setLoading(false);
        return;
      }
      
      // Create: Use JSON object (backend expects JSON, not FormData)
      // First, handle new candidate creation if needed
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
        if (newCandidateData.learnedTools && newCandidateData.learnedTools.length > 0) {
          cvFormData.append('learnedTools', JSON.stringify(newCandidateData.learnedTools));
        }
        if (newCandidateData.experienceTools && newCandidateData.experienceTools.length > 0) {
          cvFormData.append('experienceTools', JSON.stringify(newCandidateData.experienceTools));
        }
        
        // Skills and summary
        cvFormData.append('technicalSkills', newCandidateData.technicalSkills || '');
        if (newCandidateData.jlptLevel) cvFormData.append('jlptLevel', newCandidateData.jlptLevel);
        if (newCandidateData.experienceYears) cvFormData.append('experienceYears', newCandidateData.experienceYears);
        if (newCandidateData.specialization) cvFormData.append('specialization', newCandidateData.specialization);
        if (newCandidateData.qualification) cvFormData.append('qualification', newCandidateData.qualification);
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
          setFormData(prev => ({ ...prev, candidateId: cvResponse.data.cv.id }));
          // Update selectedCandidate with new CV data
          setSelectedCandidate(cvResponse.data.cv);
        } else {
          alert('Có lỗi xảy ra khi tạo hồ sơ ứng viên');
          setLoading(false);
          return;
        }
      }
      
      // Build JSON payload for job application
      const jobApplicationData = {
        jobId: parseInt(jobIdToSubmit)
      };
      
      // Add cvCode if candidate is selected
      if (formData.candidateId && selectedCandidate) {
        const cvCode = selectedCandidate.code || formData.candidateId;
        if (cvCode) {
          jobApplicationData.cvCode = cvCode;
        }
      }
      
      // Add collaboratorId if provided
      if (formData.collaboratorId) {
        jobApplicationData.collaboratorId = parseInt(formData.collaboratorId);
      }
      
      // Candidate info (if no cvCode but have candidate data)
      if (!jobApplicationData.cvCode) {
        const candidateData = editingCV && Object.keys(cvEditData).length > 0 ? cvEditData : {
          name: formData.name || selectedCandidate?.name || selectedCandidate?.fullName || '',
          birthDate: formData.birthDate || selectedCandidate?.birthDate || '',
          gender: formData.gender || selectedCandidate?.gender?.toString() || '',
          email: formData.email || selectedCandidate?.email || '',
          phone: formData.phone || selectedCandidate?.phone || '',
        };
        
        if (candidateData.name) jobApplicationData.name = candidateData.name;
        if (candidateData.birthDate) jobApplicationData.birthDate = candidateData.birthDate;
        if (candidateData.gender) jobApplicationData.gender = candidateData.gender;
        if (candidateData.email) jobApplicationData.email = candidateData.email;
        if (candidateData.phone) jobApplicationData.phone = candidateData.phone;
      }
      
      // Dates
      if (formData.appliedDate) {
        jobApplicationData.appliedAt = formData.appliedDate;
      }
      if (formData.interviewDate) {
        jobApplicationData.interviewDate = formData.interviewDate;
      }
      
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
      jobApplicationData.status = statusValue;
      
      // Financial
      if (formData.referralFee) {
        jobApplicationData.referralFee = parseFloat(formData.referralFee);
      }
      if (formData.yearlySalary) {
        jobApplicationData.yearlySalary = parseFloat(formData.yearlySalary);
      }
      
      // Notes
      if (formData.notes) {
        jobApplicationData.notes = formData.notes;
      }

      // Create job application with JSON payload
      const response = await apiService.createAdminJobApplication(jobApplicationData);
      if (response.success) {
        alert('Đơn tiến cử đã được tạo thành công!');
        navigate('/admin/nominations');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tạo đơn tiến cử');
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const formatGender = (gender) => {
    if (gender === '1' || gender === 1) return 'Nam';
    if (gender === '2' || gender === 2) return 'Nữ';
    return '—';
  };

  // Confirmation Step
  if (step === 'confirm') {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('form')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Xác nhận tiến cử</h1>
              <p className="text-xs text-gray-500 mt-1">Kiểm tra và chỉnh sửa thông tin trước khi tiến cử</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep('form')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || editingCV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? (nominationId ? 'Đang cập nhật...' : 'Đang lưu...') : (nominationId ? 'Cập nhật đơn tiến cử' : 'Xác nhận và tạo đơn tiến cử')}
            </button>
          </div>
        </div>

        {/* Job Information */}
        {selectedJob && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Thông tin công việc</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tiêu đề</label>
                <p className="text-sm text-gray-900 font-medium">{selectedJob.title}</p>
              </div>
              {selectedJob.company && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Công ty</label>
                  <p className="text-sm text-gray-900">{selectedJob.company.name}</p>
                </div>
              )}
              {selectedJob.recruitingCompany?.companyName && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Công ty tuyển dụng</label>
                  <p className="text-sm text-gray-900">{selectedJob.recruitingCompany.companyName}</p>
                </div>
              )}
              {selectedJob.workLocation && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Địa điểm</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {selectedJob.workLocation}
                  </p>
                </div>
              )}
              {selectedJob.estimatedSalary && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Lương ước tính</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    {selectedJob.estimatedSalary}
                  </p>
                </div>
              )}
              {selectedJob.category && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Danh mục</label>
                  <p className="text-sm text-gray-900">{selectedJob.category.name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Information */}
        {selectedCandidate && candidateTab === 'existing' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Thông tin ứng viên</h2>
              </div>
              {!editingCV ? (
                <button
                  onClick={() => setEditingCV(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Sửa nhanh
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCV(false);
                      // Reset to original data
                      setCvEditData({
                        name: selectedCandidate.name || selectedCandidate.fullName || '',
                        furigana: selectedCandidate.furigana || '',
                        email: selectedCandidate.email || '',
                        phone: selectedCandidate.phone || '',
                        birthDate: selectedCandidate.birthDate || '',
                        age: selectedCandidate.age || selectedCandidate.ages || '',
                        gender: selectedCandidate.gender?.toString() || '',
                        addressCurrent: selectedCandidate.addressCurrent || selectedCandidate.address || '',
                        currentIncome: selectedCandidate.currentIncome || selectedCandidate.currentSalary || '',
                        desiredIncome: selectedCandidate.desiredIncome || selectedCandidate.desiredSalary || '',
                        desiredWorkLocation: selectedCandidate.desiredWorkLocation || selectedCandidate.desiredLocation || '',
                        nyushaTime: selectedCandidate.nyushaTime || '',
                        strengths: selectedCandidate.strengths || '',
                        motivation: selectedCandidate.motivation || '',
                      });
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveCVEdit}
                    disabled={savingCV}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingCV ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>

            {editingCV ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Họ tên (Kanji) *</label>
                  <input
                    type="text"
                    value={cvEditData.name}
                    onChange={(e) => setCvEditData({ ...cvEditData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Họ tên (Kana)</label>
                  <input
                    type="text"
                    value={cvEditData.furigana}
                    onChange={(e) => setCvEditData({ ...cvEditData, furigana: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Email</label>
                  <input
                    type="email"
                    value={cvEditData.email}
                    onChange={(e) => setCvEditData({ ...cvEditData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={cvEditData.phone}
                    onChange={(e) => setCvEditData({ ...cvEditData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={cvEditData.birthDate}
                    onChange={(e) => setCvEditData({ ...cvEditData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Tuổi</label>
                  <input
                    type="number"
                    value={cvEditData.age}
                    onChange={(e) => setCvEditData({ ...cvEditData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Giới tính *</label>
                  <select
                    value={cvEditData.gender}
                    onChange={(e) => setCvEditData({ ...cvEditData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Chọn</option>
                    <option value="1">Nam</option>
                    <option value="2">Nữ</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={cvEditData.addressCurrent}
                    onChange={(e) => setCvEditData({ ...cvEditData, addressCurrent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Lương hiện tại</label>
                  <input
                    type="text"
                    value={cvEditData.currentIncome}
                    onChange={(e) => setCvEditData({ ...cvEditData, currentIncome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Lương mong muốn</label>
                  <input
                    type="text"
                    value={cvEditData.desiredIncome}
                    onChange={(e) => setCvEditData({ ...cvEditData, desiredIncome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Địa điểm mong muốn</label>
                  <input
                    type="text"
                    value={cvEditData.desiredWorkLocation}
                    onChange={(e) => setCvEditData({ ...cvEditData, desiredWorkLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Thời gian nhập công ty</label>
                  <input
                    type="text"
                    value={cvEditData.nyushaTime}
                    onChange={(e) => setCvEditData({ ...cvEditData, nyushaTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Điểm mạnh</label>
                  <textarea
                    value={cvEditData.strengths}
                    onChange={(e) => setCvEditData({ ...cvEditData, strengths: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Động lực</label>
                  <textarea
                    value={cvEditData.motivation}
                    onChange={(e) => setCvEditData({ ...cvEditData, motivation: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Mã CV</label>
                  <p className="text-sm text-gray-900 font-medium">{selectedCandidate.code || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kanji)</label>
                  <p className="text-sm text-gray-900">{cvEditData.name || selectedCandidate.name || selectedCandidate.fullName || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kana)</label>
                  <p className="text-sm text-gray-900">{cvEditData.furigana || selectedCandidate.furigana || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {cvEditData.email || selectedCandidate.email || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {cvEditData.phone || selectedCandidate.phone || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Ngày sinh</label>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(cvEditData.birthDate || selectedCandidate.birthDate)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tuổi</label>
                  <p className="text-sm text-gray-900">{cvEditData.age || selectedCandidate.age || selectedCandidate.ages || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Giới tính</label>
                  <p className="text-sm text-gray-900">{formatGender(cvEditData.gender || selectedCandidate.gender)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Địa chỉ</label>
                  <p className="text-sm text-gray-900">{cvEditData.addressCurrent || selectedCandidate.addressCurrent || selectedCandidate.address || '—'}</p>
                </div>
                {cvEditData.currentIncome || selectedCandidate.currentIncome || selectedCandidate.currentSalary ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Lương hiện tại</label>
                    <p className="text-sm text-gray-900">{cvEditData.currentIncome || selectedCandidate.currentIncome || selectedCandidate.currentSalary}</p>
                  </div>
                ) : null}
                {cvEditData.desiredIncome || selectedCandidate.desiredIncome || selectedCandidate.desiredSalary ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Lương mong muốn</label>
                    <p className="text-sm text-gray-900">{cvEditData.desiredIncome || selectedCandidate.desiredIncome || selectedCandidate.desiredSalary}</p>
                  </div>
                ) : null}
                {cvEditData.desiredWorkLocation || selectedCandidate.desiredWorkLocation || selectedCandidate.desiredLocation ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Địa điểm mong muốn</label>
                    <p className="text-sm text-gray-900">{cvEditData.desiredWorkLocation || selectedCandidate.desiredWorkLocation || selectedCandidate.desiredLocation}</p>
                  </div>
                ) : null}
                {cvEditData.nyushaTime || selectedCandidate.nyushaTime ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Thời gian nhập công ty</label>
                    <p className="text-sm text-gray-900">{cvEditData.nyushaTime || selectedCandidate.nyushaTime}</p>
                  </div>
                ) : null}
                {cvEditData.strengths || selectedCandidate.strengths ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Điểm mạnh</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{cvEditData.strengths || selectedCandidate.strengths}</p>
                  </div>
                ) : null}
                {cvEditData.motivation || selectedCandidate.motivation ? (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Động lực</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{cvEditData.motivation || selectedCandidate.motivation}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* New Candidate Preview (if creating new candidate) */}
        {candidateTab === 'new' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Thông tin ứng viên mới</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên (Kanji)</label>
                <p className="text-sm text-gray-900">{newCandidateData.nameKanji || '—'}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-900">{newCandidateData.email || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Form Step
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
          {step === 'form' ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleGoToConfirm();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              Xác nhận tiến cử
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || editingCV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? (nominationId ? 'Đang cập nhật...' : 'Đang lưu...') : (nominationId ? 'Cập nhật đơn tiến cử' : 'Xác nhận và tạo đơn tiến cử')}
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Collaborator Selection */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Users className="w-4 h-4 text-blue-600" />
              Cộng tác viên
              {adminProfile?.role === 2 && (
                <span className="text-[10px] text-blue-600 font-normal ml-1">
                  (CTV được phân công)
                </span>
              )}
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
              {adminProfile?.role === 1 && (
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
              )}
              {adminProfile?.role === 2 && collaborators.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Bạn chưa được phân công CTV nào. Vui lòng liên hệ Super Admin để được phân công CTV.
                  </p>
                </div>
              )}
            </div>
          </div>

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
                {!formData.collaboratorId && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                    <p className="text-xs text-yellow-800">
                      Vui lòng chọn CTV trước để xem danh sách ứng viên của CTV đó.
                    </p>
                  </div>
                )}
                {formData.collaboratorId && candidates.length === 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                    <p className="text-xs text-blue-800">
                      CTV này chưa có ứng viên nào. Bạn có thể tạo ứng viên mới ở tab "Tạo ứng viên mới".
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Tìm kiếm ứng viên
                    {formData.collaboratorId && (
                      <span className="text-[10px] text-gray-500 font-normal ml-1">
                        (của CTV: {formData.collaboratorName}) - {candidates.length} ứng viên
                      </span>
                    )}
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
                    {showCandidateDropdown && filteredCandidates.length === 0 && candidateSearch && formData.collaboratorId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                        <p className="text-xs text-gray-500">Không tìm thấy ứng viên nào phù hợp với từ khóa "{candidateSearch}"</p>
                      </div>
                    )}
                    {showCandidateDropdown && candidates.length === 0 && !candidateSearch && formData.collaboratorId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                        <p className="text-xs text-gray-500">CTV này chưa có ứng viên nào. Vui lòng tạo ứng viên mới.</p>
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
                        JLPT Level - 日本語能力試験
                      </label>
                      <div className="flex items-center border border-gray-300 rounded focus-within:ring-2 focus-within:ring-blue-600">
                        <span className="px-2 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-l border-r border-gray-300">N</span>
                        <input
                          type="number"
                          name="jlptLevel"
                          value={newCandidateData.jlptLevel}
                          onChange={handleNewCandidateInputChange}
                          placeholder="VD: 3"
                          min="1"
                          max="5"
                          className="flex-1 px-2 py-1.5 text-xs focus:outline-none bg-transparent"
                        />
                      </div>
                      <p className="text-[9px] text-gray-500 mt-0.5">Nhập số từ 1 (N1) đến 5 (N5)</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Số năm kinh nghiệm - 経験年数
                      </label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={newCandidateData.experienceYears}
                        onChange={handleNewCandidateInputChange}
                        placeholder="VD: 3"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Chuyên ngành - 専門分野
                      </label>
                      <input
                        type="number"
                        name="specialization"
                        value={newCandidateData.specialization}
                        onChange={handleNewCandidateInputChange}
                        placeholder="ID chuyên ngành"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-900 mb-1">
                        Bằng cấp - 資格
                      </label>
                      <input
                        type="number"
                        name="qualification"
                        value={newCandidateData.qualification}
                        onChange={handleNewCandidateInputChange}
                        placeholder="ID bằng cấp"
                        min="0"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-2">
                      Công cụ đã học - 学習したツール
                    </label>
                    <div className="space-y-1.5">
                      {newCandidateData.learnedTools.map((tool, index) => (
                        <div key={index} className="flex gap-1.5">
                          <input
                            type="text"
                            value={tool}
                            onChange={(e) => updateLearnedTool(index, e.target.value)}
                            placeholder="VD: React, Python, Docker..."
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeLearnedTool(index)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddLearnedTool}
                        className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm công cụ đã học
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-900 mb-2">
                      Công cụ có kinh nghiệm - 経験のあるツール
                    </label>
                    <div className="space-y-1.5">
                      {newCandidateData.experienceTools.map((tool, index) => (
                        <div key={index} className="flex gap-1.5">
                          <input
                            type="text"
                            value={tool}
                            onChange={(e) => updateExperienceTool(index, e.target.value)}
                            placeholder="VD: AWS, Kubernetes, TypeScript..."
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeExperienceTool(index)}
                            className="p-1.5 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddExperienceTool}
                        className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Thêm công cụ có kinh nghiệm
                      </button>
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
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Công việc <span className="text-red-500">*</span>
              </h2>
              <button
                type="button"
                onClick={() => navigate('/admin/jobs/create')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Tạo job mới
              </button>
            </div>
            <div className="space-y-3">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tìm kiếm công việc
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nhập tên job, ID hoặc công ty..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleJobSearch()}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleJobSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Tìm
                  </button>
                </div>
              </div>

              {/* Selected Job */}
              {formData.jobId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-blue-900">Đã chọn: {formData.jobTitle}</div>
                      <div className="text-[10px] text-blue-700 mt-1">ID: {formData.jobId}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, jobId: '', jobTitle: '' }));
                        setSelectedJob(null);
                        setJobSearch('');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {errors.jobId && <p className="text-[10px] text-red-500">{errors.jobId}</p>}

              {/* Jobs List */}
              <div className="border border-gray-200 rounded-lg">
                {jobsLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-xs text-gray-500">Đang tải...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="p-8 text-center">
                    <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Không tìm thấy công việc nào</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-96 overflow-y-auto">
                      {jobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleJobSelect(job)}
                          className={`w-full px-4 py-3 text-left border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${
                            formData.jobId === job.id || formData.jobId === job.id.toString()
                              ? 'bg-blue-50 border-l-4 border-l-blue-600'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-900 mb-1">{job.title}</div>
                              <div className="text-[10px] text-gray-500 space-y-0.5">
                                <div>Mã: {job.jobCode || job.id}</div>
                                {job.company?.name || job.companyName ? (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {job.company?.name || job.companyName}
                                  </div>
                                ) : null}
                                {job.workLocation && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {job.workLocation}
                                  </div>
                                )}
                                {job.estimatedSalary && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {job.estimatedSalary}
                                  </div>
                                )}
                              </div>
                            </div>
                            {(formData.jobId === job.id || formData.jobId === job.id.toString()) && (
                              <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Pagination */}
                    {jobsPagination.totalPages > 1 && (
                      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                        <div className="text-xs text-gray-700">
                          Hiển thị {(jobsPagination.currentPage - 1) * jobsPagination.itemsPerPage + 1} - {Math.min(jobsPagination.currentPage * jobsPagination.itemsPerPage, jobsPagination.total)} của {jobsPagination.total}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => loadJobs(1, jobSearch)}
                            disabled={jobsPagination.currentPage === 1 || jobsLoading}
                            className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronsLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newPage = Math.max(1, jobsPagination.currentPage - 1);
                              loadJobs(newPage, jobSearch);
                            }}
                            disabled={jobsPagination.currentPage === 1 || jobsLoading}
                            className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-gray-700 px-2">
                            Trang {jobsPagination.currentPage} / {jobsPagination.totalPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newPage = Math.min(jobsPagination.totalPages, jobsPagination.currentPage + 1);
                              loadJobs(newPage, jobSearch);
                            }}
                            disabled={jobsPagination.currentPage === jobsPagination.totalPages || jobsLoading}
                            className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => loadJobs(jobsPagination.totalPages, jobSearch)}
                            disabled={jobsPagination.currentPage === jobsPagination.totalPages || jobsLoading}
                            className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronsRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
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
                  <div>
                    <input
                      type="number"
                      name="yearlySalary"
                      value={formData.yearlySalary}
                      onChange={handleInputChange}
                      placeholder="VD: 800 (万円/năm)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
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

