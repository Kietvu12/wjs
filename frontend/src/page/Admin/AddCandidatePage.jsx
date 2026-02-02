import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import apiService from '../../services/api';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Award,
  UserCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Upload,
  Plus,
  Save,
  X,
  Trash2,
} from 'lucide-react';


const AdminAddCandidatePage = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [formData, setFormData] = useState({
    collaboratorId: '',
    // Personal Information
    nameKanji: '',
    nameKana: '',
    birthDate: '',
    age: '',
    gender: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    // Residence & Visa Information
    addressOrigin: '',
    passport: '',
    currentResidence: '',
    jpResidenceStatus: '',
    visaExpirationDate: '',
    otherCountry: '',
    // Education
    educations: [],
    // Work Experience
    workExperiences: [],
    // Skills & Certificates
    technicalSkills: '',
    certificates: [],
    learnedTools: [],
    experienceTools: [],
    jlptLevel: '',
    experienceYears: '',
    specialization: '',
    qualification: '',
    // Self Introduction
    careerSummary: '',
    strengths: '',
    motivation: '',
    // Preferences
    currentSalary: '',
    desiredSalary: '',
    desiredPosition: '',
    desiredLocation: '',
    desiredStartDate: '',
  });
  const [cvFiles, setCvFiles] = useState([]);
  const [cvPreviews, setCvPreviews] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState({ current: 0, total: 0 });
  const [parseError, setParseError] = useState(null);
  const [parseSuccess, setParseSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (candidateId) {
      loadCandidateData();
    }
  }, [candidateId]);

  const loadCandidateData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminCVById(candidateId);
      if (response.success && response.data?.cv) {
        const cv = response.data.cv;
        let birthDate = cv.birthDate || '';
        // Ensure date format is correct
        if (birthDate && !birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parsedDate = new Date(birthDate);
          if (!isNaN(parsedDate.getTime())) {
            birthDate = parsedDate.toISOString().split('T')[0];
          } else {
            birthDate = '';
          }
        }
        const calculatedAge = birthDate ? calculateAge(new Date(birthDate)) : (cv.ages || cv.age || '');
        
        let visaExpirationDate = cv.visaExpirationDate || '';
        if (visaExpirationDate && !visaExpirationDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const parsedDate = new Date(visaExpirationDate);
          if (!isNaN(parsedDate.getTime())) {
            visaExpirationDate = parsedDate.toISOString().split('T')[0];
          } else {
            visaExpirationDate = '';
          }
        }
        
        setFormData({
          collaboratorId: cv.collaboratorId || '',
          nameKanji: cv.name || cv.nameKanji || '',
          nameKana: cv.furigana || cv.nameKana || '',
          birthDate: birthDate,
          age: calculatedAge,
          gender: cv.gender === 1 ? '男' : cv.gender === 2 ? '女' : '',
          postalCode: cv.postalCode || '',
          address: cv.addressCurrent || cv.address || '',
          phone: cv.phone || '',
          email: cv.email || '',
          // Residence & Visa Information
          addressOrigin: cv.addressOrigin || '',
          passport: cv.passport ? cv.passport.toString() : '',
          currentResidence: cv.currentResidence ? cv.currentResidence.toString() : '',
          jpResidenceStatus: cv.jpResidenceStatus ? cv.jpResidenceStatus.toString() : '',
          visaExpirationDate: visaExpirationDate,
          otherCountry: cv.otherCountry || '',
          educations: cv.educations ? (typeof cv.educations === 'string' ? JSON.parse(cv.educations) : cv.educations) : [],
          workExperiences: cv.workExperiences ? (typeof cv.workExperiences === 'string' ? JSON.parse(cv.workExperiences) : cv.workExperiences) : [],
          technicalSkills: cv.technicalSkills || '',
          certificates: cv.certificates ? (typeof cv.certificates === 'string' ? JSON.parse(cv.certificates) : cv.certificates) : [],
          learnedTools: cv.learnedTools ? (typeof cv.learnedTools === 'string' ? JSON.parse(cv.learnedTools) : cv.learnedTools) : [],
          experienceTools: cv.experienceTools ? (typeof cv.experienceTools === 'string' ? JSON.parse(cv.experienceTools) : cv.experienceTools) : [],
          jlptLevel: cv.jlptLevel ? cv.jlptLevel.toString() : '',
          experienceYears: cv.experienceYears ? cv.experienceYears.toString() : '',
          specialization: cv.specialization ? cv.specialization.toString() : '',
          qualification: cv.qualification ? cv.qualification.toString() : '',
          careerSummary: cv.careerSummary || '',
          strengths: cv.strengths || '',
          motivation: cv.motivation || '',
          currentSalary: cv.currentIncome ? `${cv.currentIncome}万円` : cv.currentSalary || '', // Map from currentIncome
          desiredSalary: cv.desiredIncome ? `${cv.desiredIncome}万円` : cv.desiredSalary || '', // Map from desiredIncome
          desiredPosition: cv.desiredPosition || '',
          desiredLocation: cv.desiredWorkLocation || cv.desiredLocation || '', // Map from desiredWorkLocation
          desiredStartDate: cv.nyushaTime || cv.desiredStartDate || '', // Map from nyushaTime
        });
      }
    } catch (error) {
      console.error('Error loading candidate data:', error);
      alert('Lỗi khi tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  // API Base URL for CV parsing
  const API_BASE_URL = 'https://unboiled-nonprescriptive-hiedi.ngrok-free.dev';

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
    if (isNaN(birth.getTime())) return '';
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Handle date change from DatePicker
  const handleBirthDateChange = (date) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      const age = calculateAge(date);
      setFormData(prev => ({
        ...prev,
        birthDate: dateString,
        age: age
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        birthDate: '',
        age: ''
      }));
    }
    // Clear error
    if (errors.birthDate) {
      setErrors(prev => ({
        ...prev,
        birthDate: ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate age when birthDate changes
      if (name === 'birthDate' && value) {
        const age = calculateAge(value);
        newData.age = age;
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

  // Helper function to merge parsed data with form structure
  const mergeResumeData = (parsedData) => {
    const dob = parsedData.personal_info?.dob || '';
    let birthDateValue = dob || '';
    // Convert date string to proper format if needed
    if (birthDateValue && !birthDateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Try to parse different date formats
      const parsedDate = new Date(birthDateValue);
      if (!isNaN(parsedDate.getTime())) {
        birthDateValue = parsedDate.toISOString().split('T')[0];
      } else {
        birthDateValue = '';
      }
    }
    const calculatedAge = birthDateValue ? calculateAge(new Date(birthDateValue)) : (parsedData.personal_info?.age || '');
    
    setFormData(prev => ({
      ...prev,
      nameKanji: parsedData.personal_info?.full_name_kanji || prev.nameKanji,
      nameKana: parsedData.personal_info?.full_name_kana || prev.nameKana,
      birthDate: birthDateValue || prev.birthDate,
      age: calculatedAge || prev.age,
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

    // Filter PDF files only
    const pdfFiles = files.filter(f => {
      // Check both MIME type and file extension
      const isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      // Check file size (max 10MB)
      const isValidSize = f.size <= 10 * 1024 * 1024;
      return isPDF && isValidSize;
    });

    if (pdfFiles.length === 0) {
      const invalidFiles = files.filter(f => {
        const isPDF = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
        const isValidSize = f.size <= 10 * 1024 * 1024;
        return !isPDF || !isValidSize;
      });
      
      let errorMsg = 'Vui lòng chọn file PDF';
      if (invalidFiles.length > 0) {
        const tooLarge = invalidFiles.filter(f => f.size > 10 * 1024 * 1024);
        if (tooLarge.length > 0) {
          errorMsg = `Một số file quá lớn (tối đa 10MB): ${tooLarge.map(f => f.name).join(', ')}`;
        } else {
          errorMsg = 'Vui lòng chọn file PDF hợp lệ';
        }
      }
      setParseError(errorMsg);
      return;
    }

    // Add files to state
    setCvFiles(prev => [...prev, ...pdfFiles]);
    setParseError(null);
    setParseSuccess(null);

    // Create previews for new files with error handling
    pdfFiles.forEach((file, fileIndex) => {
      try {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          if (reader.result) {
            setCvPreviews(prev => [...prev, { name: file.name, url: reader.result }]);
          } else {
            console.warn(`Failed to read file: ${file.name}`);
            // Still add file to previews but without URL
            setCvPreviews(prev => [...prev, { name: file.name, url: null }]);
          }
        };
        
        reader.onerror = (error) => {
          console.error(`Error reading file ${file.name}:`, error);
          setParseError(`Không thể đọc file: ${file.name}. Vui lòng thử lại.`);
          // Remove the file from state if read fails
          setCvFiles(prev => prev.filter((_, i) => i !== prev.length - pdfFiles.length + fileIndex));
        };
        
        reader.onabort = () => {
          console.warn(`File reading aborted: ${file.name}`);
          setCvFiles(prev => prev.filter((_, i) => i !== prev.length - pdfFiles.length + fileIndex));
        };
        
        // Read file as data URL
        reader.readAsDataURL(file);
      } catch (error) {
        console.error(`Error setting up FileReader for ${file.name}:`, error);
        setParseError(`Lỗi khi xử lý file: ${file.name}. ${error.message}`);
        // Remove the file from state
        setCvFiles(prev => prev.filter((_, i) => i !== prev.length - pdfFiles.length + fileIndex));
      }
    });

    // Parse all PDF files sequentially (optional - skip if API fails)
    setIsParsing(true);
    setParseProgress({ current: 0, total: pdfFiles.length });

    let successCount = 0;
    let skippedCount = 0;
    const skippedFiles = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      setParseProgress({ current: i + 1, total: pdfFiles.length });

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        // Add timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

        let response;
        try {
          response = await fetch(`${API_BASE_URL}/resume/parse`, {
            method: 'POST',
            body: formDataUpload,
            signal: controller.signal,
            headers: {
              // Don't set Content-Type, let browser set it with boundary for FormData
            }
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          // Skip parsing if API is unavailable - don't block file upload
          console.warn(`Skipping parse for ${file.name}:`, fetchError.message);
          skippedCount++;
          skippedFiles.push(file.name);
          continue; // Skip to next file
        }

        if (!response.ok) {
          // Skip parsing if server returns error - don't block file upload
          console.warn(`Skipping parse for ${file.name}: Server returned ${response.status}`);
          skippedCount++;
          skippedFiles.push(file.name);
          continue; // Skip to next file
        }

        let resumeData;
        try {
          resumeData = await response.json();
        } catch (jsonError) {
          // Skip parsing if can't parse response - don't block file upload
          console.warn(`Skipping parse for ${file.name}: Invalid response format`);
          skippedCount++;
          skippedFiles.push(file.name);
          continue; // Skip to next file
        }

        // Only merge if we have valid data
        if (resumeData && Object.keys(resumeData).length > 0) {
          console.log(`Parsed ResumeData from ${file.name}:`, resumeData);
          mergeResumeData(resumeData);
          successCount++;
        } else {
          console.warn(`Skipping parse for ${file.name}: Empty response data`);
          skippedCount++;
          skippedFiles.push(file.name);
        }
      } catch (err) {
        // Skip parsing on any error - don't block file upload
        console.warn(`Skipping parse for ${file.name}:`, err.message);
        skippedCount++;
        skippedFiles.push(file.name);
      }
    }

    setIsParsing(false);

    // Show success message if any files were parsed
    if (successCount > 0) {
      setParseSuccess(`Đã trích xuất dữ liệu từ ${successCount}/${pdfFiles.length} file CV thành công!`);
    }
    
    // Show warning (not error) if some files were skipped
    if (skippedCount > 0 && skippedCount < pdfFiles.length) {
      setParseError(`Lưu ý: Không thể phân tích tự động ${skippedCount} file (${skippedFiles.join(', ')}). Bạn vẫn có thể tiếp tục upload và điền thông tin thủ công.`);
    } else if (skippedCount === pdfFiles.length) {
      // All files skipped - show info message instead of error
      setParseError(null);
      setParseSuccess(`Đã thêm ${pdfFiles.length} file CV. Không thể phân tích tự động, vui lòng điền thông tin thủ công.`);
    }
  };

  const handleRemoveCV = (index) => {
    if (index !== undefined) {
      // Remove specific file
      setCvFiles(prev => prev.filter((_, i) => i !== index));
      setCvPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove all files
      setCvFiles([]);
      setCvPreviews([]);
    }
    setParseError(null);
    setParseSuccess(null);
    // Clear error
    if (errors.cvFiles) {
      setErrors(prev => ({
        ...prev,
        cvFiles: ''
      }));
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [...prev.educations, { year: '', month: '', content: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...formData.educations];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, educations: updated }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index)
    }));
  };

  // Employment handlers
  const handleAddWorkExperience = () => {
    setFormData(prev => ({
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
    const updated = [...formData.workExperiences];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, workExperiences: updated }));
  };

  const removeEmployment = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index)
    }));
  };

  // Certificate handlers
  const handleAddCertificate = () => {
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { year: '', month: '', name: '' }]
    }));
  };

  const updateCertificate = (index, field, value) => {
    const updated = [...formData.certificates];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, certificates: updated }));
  };

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
  };

  // Tools handlers
  const handleAddLearnedTool = () => {
    setFormData(prev => ({
      ...prev,
      learnedTools: [...prev.learnedTools, '']
    }));
  };

  const updateLearnedTool = (index, value) => {
    const updated = [...formData.learnedTools];
    updated[index] = value;
    setFormData(prev => ({ ...prev, learnedTools: updated }));
  };

  const removeLearnedTool = (index) => {
    setFormData(prev => ({
      ...prev,
      learnedTools: prev.learnedTools.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperienceTool = () => {
    setFormData(prev => ({
      ...prev,
      experienceTools: [...prev.experienceTools, '']
    }));
  };

  const updateExperienceTool = (index, value) => {
    const updated = [...formData.experienceTools];
    updated[index] = value;
    setFormData(prev => ({ ...prev, experienceTools: updated }));
  };

  const removeExperienceTool = (index) => {
    setFormData(prev => ({
      ...prev,
      experienceTools: prev.experienceTools.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate collaboratorId if provided (not required, but must be valid if provided)
    if (formData.collaboratorId && formData.collaboratorId.trim()) {
      const collaboratorIdInt = parseInt(formData.collaboratorId);
      if (isNaN(collaboratorIdInt) || collaboratorIdInt <= 0) {
        newErrors.collaboratorId = 'ID CTV phải là số nguyên dương';
      }
    }

    if (!formData.nameKanji || !formData.nameKanji.trim()) {
      newErrors.nameKanji = 'Họ tên (Kanji) là bắt buộc';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (cvFiles.length === 0) {
      newErrors.cvFiles = 'File CV là bắt buộc';
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
      
      // Map frontend field names to backend field names
      // Personal info
      submitFormData.append('nameKanji', formData.nameKanji || '');
      submitFormData.append('nameKana', formData.nameKana || '');
      submitFormData.append('birthDate', formData.birthDate || '');
      submitFormData.append('age', formData.age || '');
      // Gender: convert from "男"/"女" to 1/2, or keep as is if already number
      let genderValue = formData.gender || '';
      if (genderValue === '男') genderValue = '1';
      else if (genderValue === '女') genderValue = '2';
      submitFormData.append('gender', genderValue);
      
      // Contact info
      submitFormData.append('postalCode', formData.postalCode || '');
      submitFormData.append('address', formData.address || ''); // Backend will map to addressCurrent
      submitFormData.append('phone', formData.phone || '');
      submitFormData.append('email', formData.email || '');
      
      // Residence & Visa Information
      submitFormData.append('addressOrigin', formData.addressOrigin || '');
      if (formData.passport) submitFormData.append('passport', formData.passport);
      if (formData.currentResidence) submitFormData.append('currentResidence', formData.currentResidence);
      if (formData.jpResidenceStatus) submitFormData.append('jpResidenceStatus', formData.jpResidenceStatus);
      submitFormData.append('visaExpirationDate', formData.visaExpirationDate || '');
      submitFormData.append('otherCountry', formData.otherCountry || '');
      
      // JSON fields - send as JSON strings (backend will parse)
      submitFormData.append('educations', JSON.stringify(formData.educations || []));
      submitFormData.append('workExperiences', JSON.stringify(formData.workExperiences || []));
      submitFormData.append('certificates', JSON.stringify(formData.certificates || []));
      if (formData.learnedTools && formData.learnedTools.length > 0) {
        submitFormData.append('learnedTools', JSON.stringify(formData.learnedTools));
      }
      if (formData.experienceTools && formData.experienceTools.length > 0) {
        submitFormData.append('experienceTools', JSON.stringify(formData.experienceTools));
      }
      
      // Skills and summary
      submitFormData.append('technicalSkills', formData.technicalSkills || '');
      if (formData.jlptLevel) submitFormData.append('jlptLevel', formData.jlptLevel);
      if (formData.experienceYears) submitFormData.append('experienceYears', formData.experienceYears);
      if (formData.specialization) submitFormData.append('specialization', formData.specialization);
      if (formData.qualification) submitFormData.append('qualification', formData.qualification);
      submitFormData.append('careerSummary', formData.careerSummary || '');
      submitFormData.append('strengths', formData.strengths || '');
      submitFormData.append('motivation', formData.motivation || '');
      
      // Preferences
      submitFormData.append('currentSalary', formData.currentSalary || '');
      submitFormData.append('desiredSalary', formData.desiredSalary || '');
      submitFormData.append('desiredPosition', formData.desiredPosition || '');
      submitFormData.append('desiredLocation', formData.desiredLocation || '');
      submitFormData.append('desiredStartDate', formData.desiredStartDate || '');
      
      // Collaborator ID (for admin creating CV) - only append if not empty
      if (formData.collaboratorId && formData.collaboratorId.trim()) {
        submitFormData.append('collaboratorId', formData.collaboratorId.trim());
      }
      
      // File upload
      if (cvFiles.length > 0) {
        cvFiles.forEach((file) => {
          submitFormData.append('cvFile', file);
        });
      }

      const response = candidateId 
        ? await apiService.updateAdminCV(candidateId, submitFormData)
        : await apiService.createAdminCV(submitFormData);
      if (response.success) {
        alert(candidateId ? 'Ứng viên đã được cập nhật thành công!' : 'Ứng viên đã được lưu thành công!');
        navigate(candidateId ? `/admin/candidates/${candidateId}` : '/admin/candidates');
      } else {
        const errorMsg = response.message || (candidateId ? 'Có lỗi xảy ra khi cập nhật ứng viên' : 'Có lỗi xảy ra khi tạo ứng viên');
        alert(errorMsg);
        // If error is about collaboratorId, set error in form
        if (errorMsg.includes('CTV') || errorMsg.includes('collaborator') || errorMsg.includes('collaborator_id')) {
          setErrors(prev => ({ ...prev, collaboratorId: errorMsg }));
        }
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra khi tạo ứng viên';
      alert(errorMessage);
      // If error is about collaboratorId, set error in form
      if (errorMessage.includes('CTV') || errorMessage.includes('collaborator') || errorMessage.includes('collaborator_id') || errorMessage.includes('foreign key')) {
        setErrors(prev => ({ 
          ...prev, 
          collaboratorId: errorMessage.includes('CTV') ? errorMessage : 'ID CTV không tồn tại. Vui lòng kiểm tra lại hoặc để trống.'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate(candidateId ? `/admin/candidates/${candidateId}` : '/admin/candidates');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(candidateId ? `/admin/candidates/${candidateId}` : '/admin/candidates')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{candidateId ? 'Chỉnh sửa ứng viên' : 'Tạo ứng viên'}</h1>
            <p className="text-xs text-gray-500 mt-1">{candidateId ? 'Cập nhật thông tin ứng viên' : 'Thêm thông tin ứng viên mới vào hệ thống'}</p>
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
            {candidateId ? 'Cập nhật ứng viên' : 'Lưu ứng viên'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-3">
          {/* Personal Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <User className="w-4 h-4 text-blue-600" />
              Thông tin cá nhân (個人情報)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  CTV (Tùy chọn)
                </label>
                <input
                  type="number"
                  name="collaboratorId"
                  value={formData.collaboratorId}
                  onChange={handleInputChange}
                  placeholder="Nhập ID CTV (để trống nếu không có)"
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.collaboratorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.collaboratorId && <p className="text-[10px] text-red-500 mt-1">{errors.collaboratorId}</p>}
                <p className="text-[10px] text-gray-500 mt-1">Để trống nếu ứng viên không thuộc CTV nào</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Họ tên (Kanji) - 氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nameKanji"
                    value={formData.nameKanji}
                    onChange={handleInputChange}
                    placeholder="VD: 山田 太郎"
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      errors.nameKanji ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.nameKanji && <p className="text-[10px] text-red-500 mt-1">{errors.nameKanji}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Họ tên (Kana) - ふりがな
                  </label>
                  <input
                    type="text"
                    name="nameKana"
                    value={formData.nameKana}
                    onChange={handleInputChange}
                    placeholder="VD: やまだ たろう"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Ngày sinh - 生年月日
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10 pointer-events-none" />
                    <DatePicker
                      selected={formData.birthDate ? new Date(formData.birthDate) : null}
                      onChange={handleBirthDateChange}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      placeholderText="Chọn ngày sinh"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      locale="vi"
                      isClearable
                      peekNextMonth
                      showMonthYearPicker={false}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Tuổi - 満歳
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Giới tính - 性別
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Chọn</option>
                    <option value="男">Nam (男)</option>
                    <option value="女">Nữ (女)</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-3 mt-3">
                <h3 className="text-xs font-bold text-gray-700 mb-3">
                  Thông tin liên hệ (連絡先)
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Mã bưu điện - 〒
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Địa chỉ - 現住所
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="東京都渋谷区..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Điện thoại - 電話
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="090-1234-5678"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Residence & Visa Information */}
              <div className="border-t pt-3 mt-3">
                <h3 className="text-xs font-bold text-gray-700 mb-3">
                  Thông tin cư trú & Visa (在留情報)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-2">
                      Địa chỉ gốc - 出身地
                    </label>
                    <input
                      type="text"
                      name="addressOrigin"
                      value={formData.addressOrigin}
                      onChange={handleInputChange}
                      placeholder="VD: ベトナム ホーチミン市"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Passport - パスポート
                      </label>
                      <select
                        name="passport"
                        value={formData.passport}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">Có</option>
                        <option value="0">Không</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Nơi cư trú hiện tại - 現在の居住地
                      </label>
                      <select
                        name="currentResidence"
                        value={formData.currentResidence}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">Nhật Bản</option>
                        <option value="2">Việt Nam</option>
                        <option value="3">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Tình trạng cư trú tại Nhật - 在留資格
                      </label>
                      <select
                        name="jpResidenceStatus"
                        value={formData.jpResidenceStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Chọn</option>
                        <option value="1">技術・人文知識・国際業務</option>
                        <option value="2">特定技能</option>
                        <option value="3">留学</option>
                        <option value="4">永住者</option>
                        <option value="5">日本人の配偶者等</option>
                        <option value="6">定住者</option>
                        <option value="7">その他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-900 mb-2">
                        Ngày hết hạn Visa - 在留期限
                      </label>
                      <DatePicker
                        selected={formData.visaExpirationDate ? new Date(formData.visaExpirationDate) : null}
                        onChange={(date) => {
                          if (date) {
                            setFormData(prev => ({
                              ...prev,
                              visaExpirationDate: date.toISOString().split('T')[0]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              visaExpirationDate: ''
                            }));
                          }
                        }}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Chọn ngày hết hạn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        isClearable
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-2">
                      Quốc gia khác - その他の国
                    </label>
                    <input
                      type="text"
                      name="otherCountry"
                      value={formData.otherCountry}
                      onChange={handleInputChange}
                      placeholder="VD: アメリカ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Học vấn (学歴)
            </h2>
            <div className="space-y-3">
              {formData.educations.map((edu, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-500">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="Năm (年)"
                      className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      value={edu.month}
                      onChange={(e) => updateEducation(index, 'month', e.target.value)}
                      placeholder="Tháng (月)"
                      className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      value={edu.content}
                      onChange={(e) => updateEducation(index, 'content', e.target.value)}
                      placeholder="Tên trường, ngành học..."
                      className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddEducation}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm học vấn
              </button>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Kinh nghiệm làm việc (職歴)
            </h2>
            <div className="space-y-3">
              {formData.workExperiences.map((emp, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-gray-500">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEmployment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={emp.period}
                        onChange={(e) => updateEmployment(index, 'period', e.target.value)}
                        placeholder="Thời gian (YYYY/MM - YYYY/MM)"
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={emp.company_name}
                        onChange={(e) => updateEmployment(index, 'company_name', e.target.value)}
                        placeholder="Tên công ty"
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={emp.business_purpose}
                        onChange={(e) => updateEmployment(index, 'business_purpose', e.target.value)}
                        placeholder="Lĩnh vực kinh doanh (事業目的)"
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={emp.scale_role}
                        onChange={(e) => updateEmployment(index, 'scale_role', e.target.value)}
                        placeholder="Quy mô / Vai trò (規模／役割)"
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <textarea
                      value={emp.description}
                      onChange={(e) => updateEmployment(index, 'description', e.target.value)}
                      placeholder="Mô tả công việc (業務内容)"
                      rows={2}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      value={emp.tools_tech}
                      onChange={(e) => updateEmployment(index, 'tools_tech', e.target.value)}
                      placeholder="Công cụ, công nghệ (ツール)"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddWorkExperience}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm kinh nghiệm
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Upload CV */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Upload CV
            </h2>
            {cvFiles.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors">
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">Kéo thả file CV vào đây</p>
                      <p className="text-[10px] text-gray-500">hoặc</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">Chọn file từ máy tính</p>
                    </div>
                    <p className="text-[10px] text-gray-500">Hỗ trợ nhiều file PDF - Tự động trích xuất dữ liệu</p>
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
              <div className="space-y-3">
                {/* File List */}
                <div className="space-y-2">
                  {cvFiles.map((file, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{file.name}</p>
                            <p className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCV(index)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          disabled={isParsing}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Files Button */}
                <label htmlFor="cv-upload-more" className="block">
                  <div className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors text-center cursor-pointer flex items-center justify-center gap-2">
                    <Plus className="w-3.5 h-3.5" /> Thêm file PDF
                  </div>
                  <input
                    id="cv-upload-more"
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isParsing}
                  />
                </label>

                {/* Parsing Progress */}
                {isParsing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <p className="text-xs font-medium text-blue-800">
                        Đang phân tích CV bằng AI... ({parseProgress.current}/{parseProgress.total})
                      </p>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(parseProgress.current / parseProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Parse Error */}
                {parseError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <span className="text-red-600 mt-0.5 text-xs">⚠️</span>
                    <pre className="flex-1 text-xs font-medium text-red-800 whitespace-pre-wrap">{parseError}</pre>
                    <button type="button" onClick={() => setParseError(null)} className="text-red-600 hover:text-red-800 text-xs">✕</button>
                  </div>
                )}

                {/* Parse Success */}
                {parseSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-green-600 text-xs">✓</span>
                    <p className="flex-1 text-xs font-medium text-green-800">{parseSuccess}</p>
                  </div>
                )}

                {/* Clear All Button */}
                {cvFiles.length > 1 && !isParsing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCV()}
                    className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Xóa tất cả file
                  </button>
                )}
              </div>
            )}
            {errors.cvFiles && <p className="text-[10px] text-red-500 mt-1">{errors.cvFiles}</p>}
          </div>

          {/* Skills & Certificates */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Award className="w-4 h-4 text-blue-600" />
              Kỹ năng & Chứng chỉ (資格)
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    JLPT Level - 日本語能力試験
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-600 pointer-events-none">N</span>
                    <input
                      type="number"
                      name="jlptLevel"
                      value={formData.jlptLevel}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      placeholder="1-5"
                      className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Nhập số từ 1 (N1) đến 5 (N5)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Số năm kinh nghiệm - 経験年数
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    placeholder="VD: 3"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Chuyên ngành - 専門分野
                  </label>
                  <input
                    type="number"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="ID chuyên ngành"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Bằng cấp - 資格
                  </label>
                  <input
                    type="number"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="ID bằng cấp"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Kỹ năng kỹ thuật (活かせる経験・知識・技術)
                </label>
                <textarea
                  name="technicalSkills"
                  value={formData.technicalSkills}
                  onChange={handleInputChange}
                  placeholder="VD: Project Management, React, Python..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Chứng chỉ (免許・資格)
                </label>
                <div className="space-y-2">
                  {formData.certificates.map((cert, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={cert.year}
                        onChange={(e) => updateCertificate(index, 'year', e.target.value)}
                        placeholder="Năm"
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={cert.month}
                        onChange={(e) => updateCertificate(index, 'month', e.target.value)}
                        placeholder="Tháng"
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                        placeholder="Tên chứng chỉ"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm chứng chỉ
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Công cụ đã học - 学習したツール
                </label>
                <div className="space-y-2">
                  {formData.learnedTools.map((tool, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tool}
                        onChange={(e) => updateLearnedTool(index, e.target.value)}
                        placeholder="VD: React, Python, Docker..."
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearnedTool(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddLearnedTool}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm công cụ đã học
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Công cụ có kinh nghiệm - 経験のあるツール
                </label>
                <div className="space-y-2">
                  {formData.experienceTools.map((tool, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tool}
                        onChange={(e) => updateExperienceTool(index, e.target.value)}
                        placeholder="VD: AWS, Kubernetes, TypeScript..."
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeExperienceTool(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddExperienceTool}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm công cụ có kinh nghiệm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Self Introduction */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <UserCircle className="w-4 h-4 text-blue-600" />
              Giới thiệu bản thân (自己PR)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tóm tắt nghề nghiệp (職務要約)
                </label>
                <textarea
                  name="careerSummary"
                  value={formData.careerSummary}
                  onChange={handleInputChange}
                  placeholder="Tóm tắt kinh nghiệm làm việc..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Điểm mạnh (自己PR)
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                  placeholder="Điểm mạnh của bạn..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Động lực ứng tuyển (志望動機)
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder="Lý do muốn ứng tuyển..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">Mong muốn (希望)</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Lương hiện tại (現在年収)
                  </label>
                  <input
                    type="text"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    placeholder="VD: 500万円"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Lương mong muốn (希望年収)
                  </label>
                  <input
                    type="text"
                    name="desiredSalary"
                    value={formData.desiredSalary}
                    onChange={handleInputChange}
                    placeholder="VD: 600万円"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Vị trí mong muốn (希望職種)
                </label>
                <input
                  type="text"
                  name="desiredPosition"
                  value={formData.desiredPosition}
                  onChange={handleInputChange}
                  placeholder="VD: Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Địa điểm (希望勤務地)
                  </label>
                  <input
                    type="text"
                    name="desiredLocation"
                    value={formData.desiredLocation}
                    onChange={handleInputChange}
                    placeholder="VD: Tokyo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Ngày bắt đầu (希望入社日)
                  </label>
                  <input
                    type="text"
                    name="desiredStartDate"
                    value={formData.desiredStartDate}
                    onChange={handleInputChange}
                    placeholder="VD: 2025年4月"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
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
          {loading ? (candidateId ? 'Đang cập nhật...' : 'Đang lưu...') : (candidateId ? 'Cập nhật ứng viên' : 'Lưu ứng viên')}
        </button>
      </div>
    </div>
  );
};

export default AdminAddCandidatePage;

