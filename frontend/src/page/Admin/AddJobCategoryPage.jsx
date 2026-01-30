import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Save,
  X,
  Folder,
  Tag,
} from 'lucide-react';

const AddJobCategoryPage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    order: 0,
    status: 1,
  });
  const [parentCategories, setParentCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParentCategories();
    if (categoryId) {
      loadCategoryData();
    }
  }, [categoryId]);

  const loadParentCategories = async () => {
    try {
      const response = await apiService.getJobCategoryTree();
      if (response.success && response.data) {
        // Flatten tree to get all parent categories (categories without parent)
        const flattenParents = (cats) => {
          let result = [];
          cats.forEach(cat => {
            if (!cat.parentId) {
              result.push(cat);
            }
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenParents(cat.children));
            }
          });
          return result;
        };
        const parents = flattenParents(response.data.tree || []);
        // Exclude current category if editing
        const filtered = categoryId 
          ? parents.filter(cat => cat.id !== parseInt(categoryId))
          : parents;
        setParentCategories(filtered);
      }
    } catch (error) {
      console.error('Error loading parent categories:', error);
    }
  };

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobCategoryById(categoryId);
      if (response.success && response.data?.category) {
        const category = response.data.category;
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          description: category.description || '',
          parentId: category.parentId || null,
          order: category.order || 0,
          status: category.status !== undefined ? category.status : 1,
        });
      }
    } catch (error) {
      console.error('Error loading category data:', error);
      alert('Lỗi khi tải thông tin danh mục');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
      };
      
      // Auto-generate slug from name
      if (name === 'name' && value) {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Tên danh mục là bắt buộc';
    }

    if (!formData.slug || !formData.slug.trim()) {
      newErrors.slug = 'Slug là bắt buộc';
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
      const requestData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
        parentId: formData.parentId || null,
        order: formData.order || 0,
        status: formData.status,
      };

      const response = categoryId
        ? await apiService.updateJobCategory(categoryId, requestData)
        : await apiService.createJobCategory(requestData);

      if (response.success) {
        alert(categoryId ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
        navigate('/admin/job-categories');
      } else {
        alert(response.message || (categoryId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo'));
      }
    } catch (error) {
      console.error(`Error ${categoryId ? 'updating' : 'creating'} category:`, error);
      alert(error.message || (categoryId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      navigate('/admin/job-categories');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/job-categories')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {categoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục việc làm'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {categoryId ? 'Cập nhật thông tin danh mục' : 'Thêm danh mục mới vào hệ thống'}
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
            {loading ? (categoryId ? 'Đang cập nhật...' : 'Đang lưu...') : (categoryId ? 'Cập nhật' : 'Lưu')}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="VD: Công nghệ thông tin"
              required
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Slug <span className="text-red-500">*</span>
              <span className="text-gray-500 text-[10px] ml-2">(Tự động tạo từ tên)</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="VD: cong-nghe-thong-tin"
              required
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.slug && <p className="text-[10px] text-red-500 mt-1">{errors.slug}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-900 mb-2">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Mô tả về danh mục..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Parent Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Loại công việc (Cha)
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="parentId"
                value={formData.parentId || ''}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    parentId: e.target.value ? parseInt(e.target.value) : null
                  }));
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Không có (Loại công việc)</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {formData.parentId 
                ? 'Đây là Lĩnh vực của loại công việc đã chọn'
                : 'Đây là Loại công việc (cấp cha)'}
            </p>
          </div>

          {/* Order */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="1">Đang hoạt động</option>
              <option value="0">Ẩn</option>
            </select>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Nếu không chọn "Loại công việc (Cha)" → Đây là <strong>Loại công việc</strong> (cấp cha)</li>
                <li>Nếu chọn "Loại công việc (Cha)" → Đây là <strong>Lĩnh vực</strong> (cấp con) của loại công việc đó</li>
                <li>Slug sẽ được tự động tạo từ tên, bạn có thể chỉnh sửa nếu cần</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddJobCategoryPage;

