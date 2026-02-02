import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Globe, ChevronDown, LogOut, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';


const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const languageMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const t = translations[language];

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
      const userType = localStorage.getItem('userType');
      if (userType === 'ctv') {
        await apiService.logoutCTV();
      }
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

  // Mapping routes to page titles
  const getPageTitle = () => {
    const routeMap = {
      '/agent': language === 'vi' ? 'Thông tin chung' : language === 'en' ? 'General Information' : '一般情報',
      '/agent/jobs': language === 'vi' ? 'Danh sách việc làm' : language === 'en' ? 'Job List' : '求人リスト',
      '/agent/candidates': language === 'vi' ? 'Hồ sơ ứng viên' : language === 'en' ? 'Candidate Profile' : '候補者プロフィール',
      '/agent/nominations': language === 'vi' ? 'Quản lý tiến cử' : language === 'en' ? 'Nomination Management' : '推薦管理',
      '/agent/payment-history': language === 'vi' ? 'Lịch sử thanh toán' : language === 'en' ? 'Payment History' : '支払い履歴',
      '/agent/contact': language === 'vi' ? 'Liên hệ' : language === 'en' ? 'Contact' : 'お問い合わせ',
      '/agent/faq': language === 'vi' ? 'Các câu hỏi thường gặp' : language === 'en' ? 'FAQ' : 'よくある質問',
      '/agent/terms': language === 'vi' ? 'Điều khoản sử dụng' : language === 'en' ? 'Terms of Use' : '利用規約',
      '/agent/hotline': language === 'vi' ? 'Hotline hỗ trợ 24/7 qua Zalo' : language === 'en' ? '24/7 Hotline Support via Zalo' : 'Zalo経由24時間ホットラインサポート',
    };

    // Check exact match first
    if (routeMap[location.pathname]) {
      return routeMap[location.pathname];
    }

    // Check if path starts with any route (for nested routes)
    for (const [route, title] of Object.entries(routeMap)) {
      if (location.pathname.startsWith(route) && route !== '/agent') {
        return title;
      }
    }

    return routeMap['/agent']; // Default title
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {/* Right side - Actions (only 3 icons) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 sm:p-2.5 transition-colors"
              title={languages.find(lang => lang.code === language)?.name}
            >
              <Globe className="w-5 h-5 text-gray-700" />
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
          <button 
            className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 sm:p-2.5 relative transition-colors"
            title="Thông báo"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 sm:p-2.5 transition-colors"
              title={userInfo?.name || 'Tài khoản'}
            >
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {userInfo && (
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{userInfo.name || 'CTV'}</p>
                    <p className="text-xs text-gray-500">{userInfo.email || ''}</p>
                  </div>
                )}
                <div className="py-1">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4" />
                    Thông tin tài khoản
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

export default Header;