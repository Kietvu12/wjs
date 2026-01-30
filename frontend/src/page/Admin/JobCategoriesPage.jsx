import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  Eye,
  EyeOff,
  ArrowUpDown,
} from 'lucide-react';

const JobCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, [selectedStatus]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 1000, // Load all for tree view
        sortBy: 'order',
        sortOrder: 'ASC'
      };

      if (selectedStatus !== '') {
        params.status = selectedStatus;
      }

      const response = await apiService.getJobCategoryTree();
      if (response.success && response.data) {
        setCategories(response.data.tree || []);
        // Auto-expand all categories
        const allIds = [];
        const collectIds = (cats) => {
          cats.forEach(cat => {
            allIds.push(cat.id);
            if (cat.children && cat.children.length > 0) {
              collectIds(cat.children);
            }
          });
        };
        collectIds(response.data.tree || []);
        setExpandedCategories(new Set(allIds));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      return;
    }

    try {
      const response = await apiService.deleteJobCategory(id);
      if (response.success) {
        alert('Xóa danh mục thành công!');
        loadCategories();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa danh mục');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa danh mục');
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleStatus = async (category) => {
    try {
      const newStatus = category.status === 1 ? 0 : 1;
      const response = await apiService.updateJobCategory(category.id, {
        ...category,
        status: newStatus
      });
      if (response.success) {
        alert('Cập nhật trạng thái thành công!');
        loadCategories();
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const filterCategories = (cats) => {
    if (!searchQuery) return cats;
    
    const query = searchQuery.toLowerCase();
    return cats.filter(cat => {
      const matches = cat.name.toLowerCase().includes(query) || 
                     cat.slug.toLowerCase().includes(query);
      const children = cat.children ? filterCategories(cat.children) : [];
      if (children.length > 0) {
        return { ...cat, children };
      }
      return matches;
    }).map(cat => {
      if (cat.children && cat.children.length > 0) {
        return { ...cat, children: filterCategories(cat.children) };
      }
      return cat;
    });
  };

  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isParent = !category.parentId; // Loại công việc
    const isChild = category.parentId; // Lĩnh vực

    const filteredChildren = category.children ? filterCategories(category.children) : [];

    return (
      <div key={category.id} className="mb-1">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
            selectedCategory?.id === category.id ? 'bg-blue-50 border-blue-300' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Icon */}
          {isParent ? (
            <FolderOpen className="w-5 h-5 text-blue-600" />
          ) : (
            <Tag className="w-4 h-4 text-green-600 ml-1" />
          )}

          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 truncate">
                {category.name}
              </span>
              {isParent && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded">
                  Loại công việc
                </span>
              )}
              {isChild && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded">
                  Lĩnh vực
                </span>
              )}
              {category.status === 0 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded">
                  Ẩn
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Slug: {category.slug} | Thứ tự: {category.order} | Số việc làm: {category.jobsCount || 0}
            </div>
            {category.description && (
              <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                {category.description}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleStatus(category)}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={category.status === 1 ? 'Ẩn' : 'Hiện'}
            >
              {category.status === 1 ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => navigate(`/admin/job-categories/${category.id}/edit`)}
              className="p-2 hover:bg-blue-100 rounded transition-colors"
              title="Chỉnh sửa"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="p-2 hover:bg-red-100 rounded transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {filteredChildren.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categories);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Quản lý danh mục việc làm</h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý các loại công việc và lĩnh vực
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/job-categories/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Tất cả</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Ẩn</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadCategories}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            {searchQuery ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào'}
          </div>
        ) : (
          <div className="p-4">
            {filteredCategories.map(category => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCategoriesPage;

