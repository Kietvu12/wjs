import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Upload,
  Plus,
  Save,
  X,
  Image as ImageIcon,
  Users,
} from 'lucide-react';

const AdminAddCompanyPage = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    companyCode: '',
    type: '',
    // Contact Information
    email: '',
    phone: '',
    address: '',
    website: '',
    // Additional Information
    description: '',
    // Status
    status: true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [emailAddresses, setEmailAddresses] = useState([]);
  const [businessFields, setBusinessFields] = useState([]);
  const [offices, setOffices] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyId) {
      loadCompanyData();
    }
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCompanyById(companyId);
      if (response.success && response.data?.company) {
        const company = response.data.company;
        setFormData({
          name: company.name || '',
          companyCode: company.companyCode || '',
          type: company.type || '',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          website: company.website || '',
          description: company.description || '',
          status: company.status !== undefined ? company.status : true,
        });
        if (company.logo) {
          setLogoPreview(company.logo);
        }
        if (company.emailAddresses) {
          setEmailAddresses(company.emailAddresses.map(ea => ({ email: ea.email || '' })));
        }
        if (company.businessFields) {
          setBusinessFields(company.businessFields.map(bf => ({ content: bf.content || '' })));
        }
        if (company.offices) {
          setOffices(company.offices.map(office => ({
            address: office.address || '',
            isHeadOffice: office.isHeadOffice || false
          })));
        }
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      alert('Lỗi khi tải thông tin doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'select-one' && name === 'status' ? value === 'true' : value)
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Tên công ty là bắt buộc';
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
      
      // Prepare data
      const submitData = {
        name: formData.name.trim(),
        companyCode: formData.companyCode || null,
        type: formData.type || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        website: formData.website || null,
        description: formData.description || null,
        status: formData.status,
        emailAddresses: emailAddresses.filter(ea => ea.email && ea.email.trim()).map(ea => ({ email: ea.email.trim() })),
        businessFields: businessFields.filter(bf => bf.content && bf.content.trim()).map(bf => ({ content: bf.content.trim() })),
        offices: offices.filter(office => office.address && office.address.trim()).map(office => ({
          address: office.address.trim(),
          isHeadOffice: office.isHeadOffice || false
        }))
      };

      // If logo file exists, use FormData
      if (logoFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('logo', logoFile);
        Object.keys(submitData).forEach(key => {
          if (submitData[key] !== null && submitData[key] !== undefined) {
            if (Array.isArray(submitData[key])) {
              formDataToSend.append(key, JSON.stringify(submitData[key]));
            } else if (typeof submitData[key] === 'object') {
              formDataToSend.append(key, JSON.stringify(submitData[key]));
            } else {
              formDataToSend.append(key, submitData[key]);
            }
          }
        });
        
        const response = companyId
          ? await apiService.updateCompany(companyId, formDataToSend)
          : await apiService.createCompany(formDataToSend);
        
        if (response.success) {
          alert(companyId ? 'Cập nhật doanh nghiệp thành công!' : 'Tạo doanh nghiệp thành công!');
          navigate('/admin/companies');
        } else {
          alert(response.message || (companyId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo'));
        }
      } else {
        // No logo file, send JSON
        const response = companyId
          ? await apiService.updateCompany(companyId, submitData)
          : await apiService.createCompany(submitData);
        
        if (response.success) {
          alert(companyId ? 'Cập nhật doanh nghiệp thành công!' : 'Tạo doanh nghiệp thành công!');
          navigate('/admin/companies');
        } else {
          alert(response.message || (companyId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo'));
        }
      }
    } catch (error) {
      console.error(`Error ${companyId ? 'updating' : 'creating'} company:`, error);
      alert(error.message || (companyId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate('/admin/companies');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/companies')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {companyId ? 'Chỉnh sửa doanh nghiệp' : 'Tạo doanh nghiệp'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {companyId ? 'Cập nhật thông tin doanh nghiệp' : 'Thêm thông tin doanh nghiệp mới vào hệ thống'}
            </p>
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
            {loading ? (companyId ? 'Đang cập nhật...' : 'Đang lưu...') : (companyId ? 'Cập nhật' : 'Lưu doanh nghiệp')}
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
              <Building2 className="w-4 h-4 text-blue-600" />
              Thông tin cơ bản
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="VD: Công ty TNHH ABC"
                  required
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Mã công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleInputChange}
                    placeholder="VD: ABC, NTS, SECOM"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Loại công ty
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Chọn loại</option>
                    <option value="Tuyển dụng">Tuyển dụng</option>
                    <option value="Bảo vệ">Bảo vệ</option>
                    <option value="IT">IT</option>
                    <option value="Xây dựng">Xây dựng</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="Thiết kế">Thiết kế</option>
                    <option value="QA">QA</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status ? 'true' : 'false'}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Mail className="w-4 h-4 text-blue-600" />
              Thông tin liên hệ
            </h2>
            <div className="space-y-3">
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
                    placeholder="VD: contact@company.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="VD: 03-1234-5678"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="VD: 7-23-3 Nishi-Kamata, Ota-ku, Tokyo"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="VD: https://company.com"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Addresses */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <Users className="w-4 h-4 text-blue-600" />
              Địa chỉ Email
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Danh sách email
                </label>
                <button
                  type="button"
                  onClick={() => setEmailAddresses([...emailAddresses, { email: '' }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Thêm email
                </button>
              </div>
              {emailAddresses.map((ea, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="VD: contact@company.com"
                    value={ea.email}
                    onChange={(e) => {
                      const newEmails = [...emailAddresses];
                      newEmails[index].email = e.target.value;
                      setEmailAddresses(newEmails);
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setEmailAddresses(emailAddresses.filter((_, i) => i !== index))}
                    className="p-1.5 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {emailAddresses.length === 0 && (
                <p className="text-[10px] text-gray-500">Chưa có email nào. Nhấn "Thêm email" để thêm.</p>
              )}
            </div>
          </div>

          {/* Business Fields */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Lĩnh vực kinh doanh
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Danh sách lĩnh vực
                </label>
                <button
                  type="button"
                  onClick={() => setBusinessFields([...businessFields, { content: '' }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Thêm lĩnh vực
                </button>
              </div>
              {businessFields.map((bf, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: Công nghệ thông tin, Tuyển dụng"
                    value={bf.content}
                    onChange={(e) => {
                      const newFields = [...businessFields];
                      newFields[index].content = e.target.value;
                      setBusinessFields(newFields);
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setBusinessFields(businessFields.filter((_, i) => i !== index))}
                    className="p-1.5 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {businessFields.length === 0 && (
                <p className="text-[10px] text-gray-500">Chưa có lĩnh vực nào. Nhấn "Thêm lĩnh vực" để thêm.</p>
              )}
            </div>
          </div>

          {/* Offices */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              Văn phòng
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Danh sách văn phòng
                </label>
                <button
                  type="button"
                  onClick={() => setOffices([...offices, { address: '', isHeadOffice: false }])}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Thêm văn phòng
                </button>
              </div>
              {offices.map((office, index) => (
                <div key={index} className="p-2 border border-gray-200 rounded-lg space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Địa chỉ văn phòng"
                      value={office.address}
                      onChange={(e) => {
                        const newOffices = [...offices];
                        newOffices[index].address = e.target.value;
                        setOffices(newOffices);
                      }}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setOffices(offices.filter((_, i) => i !== index))}
                      className="p-1.5 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={office.isHeadOffice}
                      onChange={(e) => {
                        const newOffices = [...offices];
                        newOffices[index].isHeadOffice = e.target.checked;
                        setOffices(newOffices);
                      }}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                    />
                    <label className="text-xs font-semibold text-gray-900">
                      Văn phòng chính
                    </label>
                  </div>
                </div>
              ))}
              {offices.length === 0 && (
                <p className="text-[10px] text-gray-500">Chưa có văn phòng nào. Nhấn "Thêm văn phòng" để thêm.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Logo Upload */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              Logo công ty
            </h2>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors">
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setLogoPreview(null);
                            setLogoFile(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">
                        {logoPreview ? 'Thay đổi logo' : 'Kéo thả logo vào đây'}
                      </p>
                      <p className="text-[10px] text-gray-500">hoặc</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">Chọn file từ máy tính</p>
                    </div>
                    <p className="text-[10px] text-gray-500">Hỗ trợ PNG, JPG, SVG - Kích thước tối đa 5MB</p>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b border-gray-200">
              <FileText className="w-4 h-4 text-blue-600" />
              Mô tả công ty
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                Giới thiệu về công ty
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả về công ty, lĩnh vực hoạt động, quy mô, văn hóa công ty..."
                rows="8"
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
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-3.5 h-3.5" />
          Lưu doanh nghiệp
        </button>
      </div>
    </div>
  );
};

export default AdminAddCompanyPage;

