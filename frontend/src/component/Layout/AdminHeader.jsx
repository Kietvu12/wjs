import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Search, Settings, LogOut, Globe, ChevronDown, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const languageMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const t = translations[language] || translations.vi;

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  }, []);

  // Mapping routes to page titles
  const getPageTitle = () => {
    const routeMap = {
      '/admin': 'Dashboard',
      '/admin/collaborators': 'Quản lý CTV',
      '/admin/candidates': 'Quản lý hồ sơ ứng viên',
      '/admin/jobs': 'Quản lý công việc',
      '/admin/nominations': 'Quản lý đơn tiến cử',
      '/admin/payments': 'Quản lý thanh toán',
      '/admin/companies': 'Quản lý doanh nghiệp',
      '/admin/reports': 'Báo cáo thống kê',
      '/admin/accounts': 'Quản lý tài khoản',
      '/admin/campaigns': 'Chiến dịch',
      '/admin/emails': 'Email hệ thống',
      '/admin/settings': 'Cài đặt',
    };

    // Check exact match first
    if (routeMap[location.pathname]) {
      return routeMap[location.pathname];
    }

    // Check if path starts with any route (for nested routes)
    for (const [route, title] of Object.entries(routeMap)) {
      if (location.pathname.startsWith(route) && route !== '/admin') {
        return title;
      }
    }

    return routeMap['/admin']; // Default title
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await apiService.logoutAdmin();
      // Xóa thông tin đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      // Chuyển về trang đăng nhập
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa thông tin và chuyển về trang đăng nhập ngay cả khi API lỗi
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-64"
            />
          </div>

          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
            >
              <Globe className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                {languages.find(lang => lang.code === language)?.flag}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-700" />
            </button>
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                      language === lang.code ? 'bg-red-50 text-red-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {language === lang.code && (
                      <span className="ml-auto text-red-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Notification Bell */}
          <button className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2.5 relative transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {userInfo && (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{userInfo.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{userInfo.email || ''}</p>
                </div>
              )}
              {!userInfo && (
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-gray-700" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {userInfo && (
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{userInfo.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{userInfo.email || ''}</p>
                  </div>
                )}
                {!userInfo && (
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">admin@example.com</p>
                  </div>
                )}
                <div className="py-1">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" />
                    Thông tin tài khoản
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    Cài đặt
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};

export default AdminHeader;

