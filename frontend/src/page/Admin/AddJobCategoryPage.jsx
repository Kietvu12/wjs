import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Save,
  X,
  Folder,
  Tag,
  Plus,
  Trash2,
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
  const [childCategories, setChildCategories] = useState([]); // Array of child categories to create
  const [showAddChildren, setShowAddChildren] = useState(false);

  // Helper function to find category and all its descendants in tree
  const findCategoryAndDescendants = (categoryId, tree) => {
    const result = new Set();
    
    const findInTree = (cats, targetId) => {
      for (const cat of cats) {
        if (cat.id === targetId) {
          result.add(cat.id);
          // Add all descendants
          if (cat.children && cat.children.length > 0) {
            const addDescendants = (children) => {
              children.forEach(child => {
                result.add(child.id);
                if (child.children && child.children.length > 0) {
                  addDescendants(child.children);
                }
              });
            };
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
        // Flatten tree to get ALL categories (support nested categories)
        const flattenAllCategories = (cats, level = 0, parentPath = '') => {
          let result = [];
          cats.forEach(cat => {
            const currentPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
            // Add current category with level info
            result.push({
              ...cat,
              level: level,
              displayName: '├─ '.repeat(level) + cat.name,
              fullPath: currentPath
            });
            // Recursively add children
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenAllCategories(cat.children, level + 1, currentPath));
            }
          });
          return result;
        };
        const allCategories = flattenAllCategories(response.data.tree || []);
        // Exclude current category if editing (and its descendants to prevent circular reference)
        const filtered = categoryId 
          ? (() => {
              const currentId = parseInt(categoryId);
              const excludedIds = findCategoryAndDescendants(currentId, response.data.tree || []);
              return allCategories.filter(cat => !excludedIds.has(cat.id));
            })()
          : allCategories;
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

  const addChildCategory = () => {
    setChildCategories(prev => [...prev, {
      name: '',
      slug: '',
      description: '',
      parentId: formData.parentId || null, // Default to current category's parent, or will be set to current category after creation
      order: prev.length,
      status: 1,
      level: 0 // Will be calculated based on parent
    }]);
  };

  const removeChildCategory = (index) => {
    setChildCategories(prev => prev.filter((_, i) => i !== index));
  };

  const updateChildCategory = (index, field, value) => {
    setChildCategories(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      // Auto-generate slug from name
      if (field === 'name' && value) {
        updated[index].slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Validate child categories if any
    // Only validate categories that have at least some information (user started filling)
    const childErrors = {};
    const validChildCategories = [];
    
    childCategories.forEach((child, index) => {
      // Check if this child category has any information (user started filling it)
      const hasAnyInfo = (child.name && child.name.trim()) || (child.slug && child.slug.trim());
      
      if (hasAnyInfo) {
        // Only validate if user started filling this category
        if (!child.name || !child.name.trim()) {
          childErrors[`child_${index}_name`] = 'Tên category con là bắt buộc';
        }
        if (!child.slug || !child.slug.trim()) {
          childErrors[`child_${index}_slug`] = 'Slug category con là bắt buộc';
        }
        
        // Only add to validChildCategories if it passes validation
        if (child.name && child.name.trim() && child.slug && child.slug.trim()) {
          validChildCategories.push(child);
        }
      }
      // If no info at all, skip this category (user didn't fill it, so ignore it)
    });

    if (Object.keys(childErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...childErrors }));
      alert('Vui lòng điền đầy đủ thông tin cho các category con (tên và slug là bắt buộc)');
      return;
    }

    try {
      setLoading(true);
      
      // Create main category first
      const mainCategoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
        parentId: formData.parentId || null,
        order: formData.order || 0,
        status: formData.status,
      };

      const mainResponse = categoryId
        ? await apiService.updateJobCategory(categoryId, mainCategoryData)
        : await apiService.createJobCategory(mainCategoryData);

      if (!mainResponse.success) {
        alert(mainResponse.message || (categoryId ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi tạo'));
        return;
      }

      // Get the created/updated category ID
      const createdCategoryId = categoryId || mainResponse.data?.category?.id;
      
      // Create child categories if any (only those with valid information)
      const categoriesToCreate = childCategories.filter(child => 
        child.name && child.name.trim() && child.slug && child.slug.trim()
      );
      
      if (categoriesToCreate.length > 0) {
        // Create a map to store created category IDs
        const createdIds = new Map();
        createdIds.set('main', createdCategoryId);
        
        // Sort children by dependency: 
        // Categories that depend on other children (parentId starts with "child_") should be created after their parents
        const sortedChildren = [];
        const remaining = [...categoriesToCreate];
        const processed = new Set();
        
        // Create a map from child object to its index in categoriesToCreate
        const childIndexMap = new Map();
        categoriesToCreate.forEach((child, idx) => {
          childIndexMap.set(child, idx);
        });
        
        // Helper to check if a category's dependencies are satisfied
        const canCreate = (child) => {
          if (!child.parentId) return true; // No parent, can create
          if (typeof child.parentId === 'string' && child.parentId.startsWith('child_')) {
            // Find the referenced child category
            const depIndexStr = child.parentId.replace('child_', '');
            const depIndex = parseInt(depIndexStr);
            if (!isNaN(depIndex)) {
              // Check if the referenced child (by original index in childCategories) has been processed
              // We need to map back to categoriesToCreate index
              if (depIndex < childCategories.length) {
                const referencedChild = childCategories[depIndex];
                const refIndexInCategoriesToCreate = categoriesToCreate.findIndex(c => 
                  c.name === referencedChild.name && c.slug === referencedChild.slug
                );
                if (refIndexInCategoriesToCreate >= 0) {
                  return processed.has(refIndexInCategoriesToCreate);
                }
              }
            }
            return false; // Dependency not found or not processed
          }
          return true; // Existing category as parent, can create
        };
        
        // Process in rounds: create categories whose dependencies are satisfied
        while (remaining.length > 0) {
          let foundAny = false;
          for (let i = remaining.length - 1; i >= 0; i--) {
            const child = remaining[i];
            const indexInCategoriesToCreate = childIndexMap.get(child);
            if (indexInCategoriesToCreate !== undefined && canCreate(child)) {
              sortedChildren.push(child);
              remaining.splice(i, 1);
              processed.add(indexInCategoriesToCreate);
              foundAny = true;
            }
          }
          // If no progress, break to avoid infinite loop (circular dependency)
          if (!foundAny) {
            // Add remaining with warning
            sortedChildren.push(...remaining);
            break;
          }
        }

        const createdChildIds = [];
        const errors = [];

        // Create children sequentially to handle dependencies
        // Map each child to its index in categoriesToCreate for tracking
        const childToIndexMap = new Map();
        categoriesToCreate.forEach((child, index) => {
          const key = `${child.name}_${child.slug}`;
          childToIndexMap.set(key, index);
        });

        for (let sortedIndex = 0; sortedIndex < sortedChildren.length; sortedIndex++) {
          const child = sortedChildren[sortedIndex];
          const key = `${child.name}_${child.slug}`;
          const originalIndex = childToIndexMap.get(key) ?? sortedIndex;
          
          try {
            // Determine parentId: use specified parent, or main category, or a previously created child
            let finalParentId = child.parentId;
            
            // Check if parentId is a reference to another child category being created (string like "child_0")
            if (typeof finalParentId === 'string' && finalParentId.startsWith('child_')) {
              const referencedChildIndex = parseInt(finalParentId.replace('child_', ''));
              if (!isNaN(referencedChildIndex) && createdIds.has(`child_${referencedChildIndex}`)) {
                finalParentId = createdIds.get(`child_${referencedChildIndex}`);
              } else {
                // If the referenced child hasn't been created yet, use main category as fallback
                finalParentId = createdCategoryId;
              }
            } else if (!finalParentId || finalParentId === createdCategoryId) {
              finalParentId = createdCategoryId;
            } else if (typeof finalParentId === 'number') {
              // Check if it's a reference to a child by numeric index (shouldn't happen, but handle it)
              if (createdIds.has(`child_${finalParentId}`)) {
                finalParentId = createdIds.get(`child_${finalParentId}`);
              }
              // Otherwise, use the specified parentId (existing category ID)
            }

            const childData = {
              name: child.name.trim(),
              slug: child.slug.trim(),
              description: child.description || null,
              parentId: finalParentId,
              order: child.order !== undefined ? child.order : i,
              status: child.status || 1,
            };

            const childResponse = await apiService.createJobCategory(childData);
            
            if (childResponse.success && childResponse.data?.category?.id) {
              const childId = childResponse.data.category.id;
              // Store the created ID with the original index
              createdIds.set(`child_${originalIndex}`, childId);
              createdChildIds.push(childId);
            } else {
              errors.push(`Category "${child.name}": ${childResponse.message || 'Lỗi không xác định'}`);
            }
          } catch (error) {
            errors.push(`Category "${child.name}": ${error.message || 'Lỗi không xác định'}`);
          }
        }

        if (errors.length > 0) {
          alert(`Đã tạo category chính và ${createdChildIds.length}/${categoriesToCreate.length} category con thành công.\n\nLỗi:\n${errors.join('\n')}`);
        } else {
          alert(`Tạo thành công ${categoriesToCreate.length + 1} category! (1 category chính + ${categoriesToCreate.length} category con)`);
        }
      } else {
        alert(categoryId ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!');
      }

      navigate('/admin/job-categories');
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
              Category cha (Parent Category)
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
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              >
                <option value="">-- Không có (Category cấp cha) --</option>
                {parentCategories.length > 0 ? (
                  parentCategories.map((category) => {
                    const indent = '  '.repeat(category.level || 0);
                    const prefix = category.level > 0 ? '└─ ' : '';
                    const levelIndicator = category.level > 0 ? `[Cấp ${category.level}] ` : '[Cấp 0] ';
                    return (
                      <option key={category.id} value={category.id}>
                        {levelIndicator}{indent}{prefix}{category.name}
                      </option>
                    );
                  })
                ) : (
                  <option disabled>Đang tải danh sách categories...</option>
                )}
              </select>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {formData.parentId 
                ? (() => {
                    const selectedParent = parentCategories.find(c => c.id === formData.parentId);
                    if (selectedParent) {
                      return `Category này sẽ là con của: "${selectedParent.fullPath || selectedParent.name}" (Cấp ${(selectedParent.level || 0) + 1})`;
                    }
                    return `Đây là category con của category đã chọn`;
                  })()
                : 'Đây là category cấp cha (không có parent) - Cấp 0'}
            </p>
            <p className="text-[10px] text-blue-600 mt-1 font-medium">
              💡 Bạn có thể chọn bất kỳ category nào (kể cả category đã có parent) để tạo category con
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

        {/* Add Child Categories Section */}
        {!categoryId && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Thêm category con cùng lúc</h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  Tạo nhiều category con của category này trong một lần
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddChildren(!showAddChildren);
                  if (!showAddChildren && childCategories.length === 0) {
                    addChildCategory();
                  }
                }}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddChildren ? 'Ẩn' : 'Thêm category con'}
              </button>
            </div>

            {showAddChildren && (
              <div className="space-y-3">
                {childCategories.map((child, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-700">
                        Category con #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeChildCategory(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                          Tên category con <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => updateChildCategory(index, 'name', e.target.value)}
                          placeholder="VD: Software Development"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {errors[`child_${index}_name`] && (
                          <p className="text-[10px] text-red-500 mt-0.5">{errors[`child_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                          Slug <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={child.slug}
                          onChange={(e) => updateChildCategory(index, 'slug', e.target.value)}
                          placeholder="VD: software-development"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        {errors[`child_${index}_slug`] && (
                          <p className="text-[10px] text-red-500 mt-0.5">{errors[`child_${index}_slug`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        value={child.description}
                        onChange={(e) => updateChildCategory(index, 'description', e.target.value)}
                        placeholder="Mô tả về category con..."
                        rows="2"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                          Thứ tự
                        </label>
                        <input
                          type="number"
                          value={child.order}
                          onChange={(e) => updateChildCategory(index, 'order', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                          Trạng thái
                        </label>
                        <select
                          value={child.status}
                          onChange={(e) => updateChildCategory(index, 'status', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="1">Đang hoạt động</option>
                          <option value="0">Ẩn</option>
                        </select>
                      </div>
                    </div>

                    {/* Parent for child category (can be current category, another existing category, or another child being created) */}
                    <div className="mt-3">
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">
                        Category cha của category con này
                      </label>
                      <select
                        value={child.parentId || ''}
                        onChange={(e) => updateChildCategory(index, 'parentId', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">-- Sử dụng category chính làm parent --</option>
                        {/* Show other child categories being created (for nested children) */}
                        {childCategories.map((otherChild, otherIndex) => {
                          if (otherIndex === index) return null;
                          return (
                            <option key={`child_${otherIndex}`} value={`child_${otherIndex}`}>
                              [Category con #{otherIndex + 1}] {otherChild.name || 'Chưa đặt tên'}
                            </option>
                          );
                        })}
                        {/* Show existing categories */}
                        {parentCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.fullPath || cat.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-500 mt-1">
                        {(() => {
                          if (!child.parentId) {
                            return `Category con này sẽ thuộc về category chính "${formData.name || 'category đang tạo'}"`;
                          }
                          const parentOption = childCategories.find((_, i) => `child_${i}` === child.parentId.toString());
                          if (parentOption) {
                            return `Category con này sẽ thuộc về category con khác đang được tạo: "${parentOption.name || 'Chưa đặt tên'}"`;
                          }
                          const existingParent = parentCategories.find(c => c.id === child.parentId);
                          if (existingParent) {
                            return `Category con này sẽ thuộc về: "${existingParent.fullPath || existingParent.name}"`;
                          }
                          return `Category con này sẽ thuộc về category đã chọn`;
                        })()}
                      </p>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addChildCategory}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm category con khác
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold mb-1">Lưu ý về cấu trúc category:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Không chọn parent</strong> → Tạo category cấp cha (Cấp 0) - parentId = NULL</li>
                <li><strong>Chọn category cấp cha</strong> → Tạo category con (Cấp 1)</li>
                <li><strong>Chọn category cấp 1</strong> → Tạo category con của category con (Cấp 2)</li>
                <li><strong>Chọn category cấp 2</strong> → Tạo category cấp 3, và cứ thế...</li>
                <li className="mt-2 font-semibold text-blue-900">✅ Bạn có thể chọn BẤT KỲ category nào (kể cả category đã có parent) để tạo category con!</li>
                {!categoryId && (
                  <li className="mt-2 font-semibold text-blue-900">✅ Bạn có thể tạo nhiều category con cùng lúc bằng cách sử dụng phần "Thêm category con cùng lúc"!</li>
                )}
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

