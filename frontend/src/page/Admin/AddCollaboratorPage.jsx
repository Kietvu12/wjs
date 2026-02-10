import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Building2,
  CreditCard,
  Save,
  X,
} from 'lucide-react';


const AddCollaboratorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    bankName: '',
    bankAccount: '',
    bankAccountName: '',
    status: 'active',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Hover states
  const [hoveredBackButton, setHoveredBackButton] = useState(false);
  const [hoveredCancelButton, setHoveredCancelButton] = useState(false);
  const [hoveredSaveButton, setHoveredSaveButton] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên CTV là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.bankAccount && !formData.bankName) {
      newErrors.bankName = 'Tên ngân hàng là bắt buộc khi có số tài khoản';
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
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        bankAccountName: formData.bankAccountName,
        status: formData.status === 'active' ? 1 : 0,
        description: formData.description,
      };

      const response = await apiService.createCollaborator(submitData);
      if (response.success) {
        alert('CTV đã được thêm thành công!');
        navigate('/admin/collaborators');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi tạo CTV');
      }
    } catch (error) {
      console.error('Error creating collaborator:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo CTV');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate('/admin/collaborators');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="rounded-lg p-4 border flex items-center justify-between" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/collaborators')}
            onMouseEnter={() => setHoveredBackButton(true)}
            onMouseLeave={() => setHoveredBackButton(false)}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: hoveredBackButton ? '#f3f4f6' : 'transparent'
            }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#4b5563' }} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: '#111827' }}>Thêm mới CTV</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            onMouseEnter={() => setHoveredCancelButton(true)}
            onMouseLeave={() => setHoveredCancelButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <X className="w-3.5 h-3.5" />
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            onMouseEnter={() => setHoveredSaveButton(true)}
            onMouseLeave={() => setHoveredSaveButton(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: hoveredSaveButton ? '#1d4ed8' : '#2563eb',
              color: 'white'
            }}
          >
            <Save className="w-3.5 h-3.5" />
            Lưu
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Thông tin cơ bản */}
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
            <User className="w-4 h-4" style={{ color: '#2563eb' }} />
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Tên CTV <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                style={{
                  borderColor: errors.name ? '#ef4444' : '#d1d5db',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name ? '#ef4444' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Nhập tên CTV"
              />
              {errors.name && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.email ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Số điện thoại <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.phone ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.phone ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="0901234567"
                />
              </div>
              {errors.phone && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Địa chỉ
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin đăng nhập */}
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
            <Lock className="w-4 h-4" style={{ color: '#2563eb' }} />
            Thông tin đăng nhập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.password ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập mật khẩu"
                />
              </div>
              {errors.password && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Xác nhận mật khẩu <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
              {errors.confirmPassword && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* Thông tin ngân hàng */}
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>
            <CreditCard className="w-4 h-4" style={{ color: '#2563eb' }} />
            Thông tin ngân hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Tên ngân hàng
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: errors.bankName ? '#ef4444' : '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.bankName ? '#ef4444' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="VD: Vietcombank"
                />
              </div>
              {errors.bankName && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{errors.bankName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Số tài khoản
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} />
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-xs"
                  style={{
                    borderColor: '#d1d5db',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Nhập số tài khoản"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Chủ tài khoản
              </label>
              <input
                type="text"
                name="bankAccountName"
                value={formData.bankAccountName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Tên chủ tài khoản"
              />
            </div>
          </div>
        </div>

        {/* Trạng thái và ghi chú */}
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <h2 className="text-sm font-bold mb-4 pb-3 border-b" style={{ color: '#111827', borderColor: '#e5e7eb' }}>Trạng thái và ghi chú</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>
                Ghi chú
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border rounded-lg text-xs resize-none"
                style={{
                  borderColor: '#d1d5db',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                  e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rounded-lg border p-4 flex items-center justify-end gap-3" style={{ backgroundColor: 'white', borderColor: '#e5e7eb' }}>
          <button
            type="button"
            onClick={handleCancel}
            onMouseEnter={() => setHoveredCancelButton(true)}
            onMouseLeave={() => setHoveredCancelButton(false)}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: hoveredCancelButton ? '#e5e7eb' : '#f3f4f6',
              color: '#374151'
            }}
          >
            <X className="w-3.5 h-3.5" />
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => !loading && setHoveredSaveButton(true)}
            onMouseLeave={() => setHoveredSaveButton(false)}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
            style={{
              backgroundColor: loading 
                ? '#93c5fd' 
                : (hoveredSaveButton ? '#1d4ed8' : '#2563eb'),
              color: 'white',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Đang lưu...' : 'Lưu CTV'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCollaboratorPage;
