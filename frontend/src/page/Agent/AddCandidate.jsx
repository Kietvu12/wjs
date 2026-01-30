import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Trash2,
} from 'lucide-react';

const AddCandidate = ({ jobId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    // Education
    educations: [],
    // Work Experience
    workExperiences: [],
    // Skills & Certificates
    technicalSkills: '',
    certificates: [],
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

  // API Base URL for CV parsing
  const API_BASE_URL = 'https://unboiled-nonprescriptive-hiedi.ngrok-free.dev';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to merge parsed data with form structure
  const mergeResumeData = (parsedData) => {
    setFormData(prev => ({
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

    // Filter PDF files only
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      setParseError('Vui lòng chọn file PDF');
      return;
    }

    // Add files to state
    setCvFiles(prev => [...prev, ...pdfFiles]);
    setParseError(null);
    setParseSuccess(null);

    // Create previews for new files
    pdfFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvPreviews(prev => [...prev, { name: file.name, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });

    // Parse all PDF files sequentially
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
        console.log(`Parsed ResumeData from ${file.name}:`, resumeData);

        // Merge parsed data into form
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check for duplicates first
      const duplicateCheck = await apiService.checkDuplicateCV({
        name: formData.nameKanji,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate
      });

      if (duplicateCheck?.success && duplicateCheck.data?.isDuplicate) {
        alert('Hồ sơ này đã tồn tại trong hệ thống. Không thể tiến cử.');
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      
      // Add jobId if provided (for nomination)
      if (jobId) {
        formDataToSend.append('jobId', jobId);
      }
      
      // Map frontend field names to backend field names
      // Personal info
      formDataToSend.append('nameKanji', formData.nameKanji || '');
      formDataToSend.append('nameKana', formData.nameKana || '');
      formDataToSend.append('birthDate', formData.birthDate || '');
      formDataToSend.append('age', formData.age || '');
      // Gender: convert from "男"/"女" to 1/2, or keep as is if already number
      let genderValue = formData.gender || '';
      if (genderValue === '男') genderValue = '1';
      else if (genderValue === '女') genderValue = '2';
      formDataToSend.append('gender', genderValue);
      
      // Contact info
      formDataToSend.append('postalCode', formData.postalCode || '');
      formDataToSend.append('address', formData.address || ''); // Backend will map to addressCurrent
      formDataToSend.append('phone', formData.phone || '');
      formDataToSend.append('email', formData.email || '');
      
      // JSON fields - send as JSON strings (backend will parse)
      formDataToSend.append('educations', JSON.stringify(formData.educations || []));
      formDataToSend.append('workExperiences', JSON.stringify(formData.workExperiences || []));
      formDataToSend.append('certificates', JSON.stringify(formData.certificates || []));
      
      // Skills and summary
      formDataToSend.append('technicalSkills', formData.technicalSkills || '');
      formDataToSend.append('careerSummary', formData.careerSummary || '');
      formDataToSend.append('strengths', formData.strengths || '');
      formDataToSend.append('motivation', formData.motivation || '');
      
      // Preferences
      formDataToSend.append('currentSalary', formData.currentSalary || '');
      formDataToSend.append('desiredSalary', formData.desiredSalary || '');
      formDataToSend.append('desiredPosition', formData.desiredPosition || '');
      formDataToSend.append('desiredLocation', formData.desiredLocation || '');
      formDataToSend.append('desiredStartDate', formData.desiredStartDate || '');
      
      if (cvFiles.length > 0) {
        cvFiles.forEach((file) => {
          formDataToSend.append('cvFile', file);
        });
      } else {
        // If no files but we have parsed data, we still need to submit
        // The backend should handle this case
      }

      // Create CV first
      const response = await apiService.createCVStorage(formDataToSend);
      
      // If jobId is provided, create job application (nominate)
      if (jobId && response.success && response.data?.cv) {
        try {
          await apiService.createJobApplication({
            jobId: parseInt(jobId),
            cvCode: response.data.cv.code
          });
        } catch (nominateError) {
          console.error('Error creating nomination:', nominateError);
          // CV was created successfully, but nomination failed
          alert('CV đã được tạo thành công nhưng có lỗi khi tiến cử. Vui lòng thử lại.');
        }
      }

      if (response.success) {
        if (response.data?.isDuplicate) {
          alert('Hồ sơ này đã tồn tại trong hệ thống. Không thể tiến cử.');
        } else {
          if (jobId) {
            alert('Tiến cử thành công!');
            if (onSuccess) {
              onSuccess();
            } else {
              navigate(`/agent/jobs/${jobId}`);
            }
          } else {
            alert('Ứng viên đã được lưu thành công!');
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/agent/candidates');
            }
          }
        }
      } else {
        alert(response.message || 'Có lỗi xảy ra khi lưu thông tin');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      if (onCancel) {
        onCancel();
      } else {
        navigate('/agent/candidates');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header - Only show if not in nomination mode */}
      {!jobId && (
        <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/agent/candidates')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tạo ứng viên</h1>
              <p className="text-sm text-gray-600 mt-1">Thêm thông tin ứng viên mới vào hệ thống</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
            >
              Lưu ứng viên
            </button>
          </div>
        </div>
      )}

      {/* Submit Button for Nomination Mode */}
      {jobId && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-yellow-400 text-blue-700 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Tiến cử ứng viên
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Thông tin cá nhân (個人情報)
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Họ tên (Kanji) - 氏名 *
                  </label>
                  <input
                    type="text"
                    name="nameKanji"
                    value={formData.nameKanji}
                    onChange={handleInputChange}
                    placeholder="VD: 山田 太郎"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Họ tên (Kana) - ふりがな
                  </label>
                  <input
                    type="text"
                    name="nameKana"
                    value={formData.nameKana}
                    onChange={handleInputChange}
                    placeholder="VD: やまだ たろう"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Ngày sinh - 生年月日
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      placeholder="1990年1月1日"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Tuổi - 満歳
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Giới tính - 性別
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Chọn</option>
                    <option value="男">Nam (男)</option>
                    <option value="女">Nữ (女)</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Thông tin liên hệ (連絡先)
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Mã bưu điện - 〒
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Địa chỉ - 現住所
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="東京都渋谷区..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Điện thoại - 電話
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="090-1234-5678"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-red-600" />
              Học vấn (学歴)
            </h2>
            <div className="space-y-3">
              {formData.educations.map((edu, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="Năm (年)"
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={edu.month}
                      onChange={(e) => updateEducation(index, 'month', e.target.value)}
                      placeholder="Tháng (月)"
                      className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={edu.content}
                      onChange={(e) => updateEducation(index, 'content', e.target.value)}
                      placeholder="Tên trường, ngành học..."
                      className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddEducation}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm học vấn
              </button>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-red-600" />
              Kinh nghiệm làm việc (職歴)
            </h2>
            <div className="space-y-3">
              {formData.workExperiences.map((emp, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEmployment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={emp.period}
                        onChange={(e) => updateEmployment(index, 'period', e.target.value)}
                        placeholder="Thời gian (YYYY/MM - YYYY/MM)"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={emp.company_name}
                        onChange={(e) => updateEmployment(index, 'company_name', e.target.value)}
                        placeholder="Tên công ty"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={emp.business_purpose}
                        onChange={(e) => updateEmployment(index, 'business_purpose', e.target.value)}
                        placeholder="Lĩnh vực kinh doanh (事業目的)"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={emp.scale_role}
                        onChange={(e) => updateEmployment(index, 'scale_role', e.target.value)}
                        placeholder="Quy mô / Vai trò (規模／役割)"
                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <textarea
                      value={emp.description}
                      onChange={(e) => updateEmployment(index, 'description', e.target.value)}
                      placeholder="Mô tả công việc (業務内容)"
                      rows={2}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={emp.tools_tech}
                      onChange={(e) => updateEmployment(index, 'tools_tech', e.target.value)}
                      placeholder="Công cụ, công nghệ (ツール)"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddWorkExperience}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm kinh nghiệm
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Upload CV */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Upload CV
            </h2>
            {cvFiles.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-600 transition-colors">
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Kéo thả file CV vào đây</p>
                      <p className="text-xs text-gray-500">hoặc</p>
                      <p className="text-sm text-red-600 font-medium mt-1">Chọn file từ máy tính</p>
                    </div>
                    <p className="text-xs text-gray-500">Hỗ trợ nhiều file PDF - Tự động trích xuất dữ liệu</p>
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
              <div className="space-y-4">
                {/* File List */}
                <div className="space-y-2">
                  {cvFiles.map((file, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCV(index)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          disabled={isParsing}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add More Files Button */}
                <label htmlFor="cv-upload-more" className="block">
                  <div className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors text-center cursor-pointer flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Thêm file PDF
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <p className="text-sm font-medium text-blue-800">
                        Đang phân tích CV bằng AI... ({parseProgress.current}/{parseProgress.total})
                      </p>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(parseProgress.current / parseProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Parse Error */}
                {parseError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-red-600 mt-0.5">⚠️</span>
                    <pre className="flex-1 text-sm font-medium text-red-800 whitespace-pre-wrap">{parseError}</pre>
                    <button type="button" onClick={() => setParseError(null)} className="text-red-600 hover:text-red-800">✕</button>
                  </div>
                )}

                {/* Parse Success */}
                {parseSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-green-600">✓</span>
                    <p className="flex-1 text-sm font-medium text-green-800">{parseSuccess}</p>
                  </div>
                )}

                {/* Clear All Button */}
                {cvFiles.length > 1 && !isParsing && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCV()}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Xóa tất cả file
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Skills & Certificates */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-red-600" />
              Kỹ năng & Chứng chỉ (資格)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Kỹ năng kỹ thuật (活かせる経験・知識・技術)
                </label>
                <textarea
                  name="technicalSkills"
                  value={formData.technicalSkills}
                  onChange={handleInputChange}
                  placeholder="VD: Project Management, React, Python..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">
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
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={cert.month}
                        onChange={(e) => updateCertificate(index, 'month', e.target.value)}
                        placeholder="Tháng"
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                        placeholder="Tên chứng chỉ"
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm chứng chỉ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Self Introduction */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-red-600" />
              Giới thiệu bản thân (自己PR)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Tóm tắt nghề nghiệp (職務要約)
                </label>
                <textarea
                  name="careerSummary"
                  value={formData.careerSummary}
                  onChange={handleInputChange}
                  placeholder="Tóm tắt kinh nghiệm làm việc..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Điểm mạnh (自己PR)
                </label>
                <textarea
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                  placeholder="Điểm mạnh của bạn..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Động lực ứng tuyển (志望動機)
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  placeholder="Lý do muốn ứng tuyển..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Mong muốn (希望)</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Lương hiện tại (現在年収)
                  </label>
                  <input
                    type="text"
                    name="currentSalary"
                    value={formData.currentSalary}
                    onChange={handleInputChange}
                    placeholder="VD: 500万円"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Lương mong muốn (希望年収)
                  </label>
                  <input
                    type="text"
                    name="desiredSalary"
                    value={formData.desiredSalary}
                    onChange={handleInputChange}
                    placeholder="VD: 600万円"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Vị trí mong muốn (希望職種)
                </label>
                <input
                  type="text"
                  name="desiredPosition"
                  value={formData.desiredPosition}
                  onChange={handleInputChange}
                  placeholder="VD: Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Địa điểm (希望勤務地)
                  </label>
                  <input
                    type="text"
                    name="desiredLocation"
                    value={formData.desiredLocation}
                    onChange={handleInputChange}
                    placeholder="VD: Tokyo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">
                    Ngày bắt đầu (希望入社日)
                  </label>
                  <input
                    type="text"
                    name="desiredStartDate"
                    value={formData.desiredStartDate}
                    onChange={handleInputChange}
                    placeholder="VD: 2025年4月"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Submit Button for Nomination Mode */}
      {jobId && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 bg-white rounded-2xl p-4 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-yellow-400 text-blue-700 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Tiến cử ứng viên
          </button>
        </div>
      )}
    </div>
  );
};

export default AddCandidate;

