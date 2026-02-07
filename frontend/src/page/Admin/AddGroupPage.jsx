import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
} from 'lucide-react';

const AddGroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    referralCode: '',
    description: '',
    status: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    try {
      setLoadingData(true);
      const response = await apiService.getGroupById(id);
      if (response.success && response.data?.group) {
        const group = response.data.group;
        setFormData({
          name: group.name || '',
          code: group.code || '',
          referralCode: group.referralCode || '',
          description: group.description || '',
          status: group.status !== undefined ? group.status : 1
        });
      }
    } catch (error) {
      console.error('Error loading group data:', error);
      alert(error.message || 'Không thể tải thông tin nhóm');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'status' ? parseInt(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateCode = (name) => {
    if (!name) return '';
    return name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 50);
  };

  const generateReferralCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF_${random}`;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      code: prev.code || generateCode(name)
    }));
    handleInputChange(e);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhóm là bắt buộc';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã nhóm là bắt buộc';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Mã nhóm chỉ được chứa chữ in hoa, số và dấu gạch dưới';
    }

    if (!formData.referralCode.trim()) {
      newErrors.referralCode = 'Mã giới thiệu là bắt buộc';
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
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        referralCode: formData.referralCode.trim(),
        description: formData.description.trim(),
        status: formData.status
      };

      let response;
      if (isEdit) {
        response = await apiService.updateGroup(id, submitData);
      } else {
        response = await apiService.createGroup(submitData);
      }

      if (response.success) {
        alert(isEdit ? 'Cập nhật nhóm thành công!' : 'Tạo nhóm thành công!');
        navigate('/admin/groups');
      } else {
        alert(response.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} nhóm`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} group:`, error);
      alert(error.message || `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} nhóm`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate('/admin/groups');
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa nhóm' : 'Tạo nhóm mới'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>Hủy</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nhập tên nhóm"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Mã nhóm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nhập mã nhóm (VD: GROUP_01)"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            <p className="mt-1 text-xs text-gray-500">Mã nhóm sẽ tự động tạo từ tên nhóm</p>
          </div>

          {/* Mã giới thiệu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã giới thiệu <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.referralCode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nhập mã giới thiệu"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, referralCode: generateReferralCode() }))}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Tạo tự động
              </button>
            </div>
            {errors.referralCode && <p className="mt-1 text-sm text-red-600">{errors.referralCode}</p>}
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>Đang hoạt động</option>
              <option value={0}>Không hoạt động</option>
            </select>
          </div>

          {/* Mô tả */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập mô tả về nhóm"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddGroupPage;

