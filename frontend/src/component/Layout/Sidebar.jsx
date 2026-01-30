import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Flag,
  FileCheck,
  FileText,
  History,
  Mail,
  HelpCircle,
  FileType,
  Phone,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [showNominationSubmenu, setShowNominationSubmenu] = useState(false);

  const generalItems = [
    { id: 'thong-tin-chung', label: t.generalInfo, icon: LayoutGrid, path: '/agent' },
    { id: 'danh-sach-viec-lam', label: t.jobList, icon: Flag, path: '/agent/jobs' },
    { id: 'ho-so-ung-vien', label: t.candidateProfile, icon: FileCheck, path: '/agent/candidates' },
    { id: 'quan-ly-tien-cu', label: t.nominationManagement, icon: FileText, path: '/agent/nominations', hasSubmenu: true },
    { id: 'lich-su-thanh-toan', label: t.paymentHistory, icon: History, path: '/agent/payment-history' },
  ];

  const otherItems = [
    { id: 'lien-he', label: t.contact, icon: Mail, path: '/agent/contact' },
    { id: 'cau-hoi-thuong-gap', label: t.faq, icon: HelpCircle, path: '/agent/faq' },
    { id: 'dieu-khoan-su-dung', label: t.terms, icon: FileType, path: '/agent/terms' },
    { id: 'hotline-zalo', label: t.hotline, icon: Phone, path: '/agent/hotline' },
  ];

  const isActive = (path) => {
    if (path === '/agent') {
      return location.pathname === '/agent' || location.pathname === '/agent/';
    }
    return location.pathname.startsWith(path);
  };

  // Auto-expand submenu if on nominations page
  useEffect(() => {
    if (location.pathname.startsWith('/agent/nominations')) {
      setShowNominationSubmenu(true);
    }
  }, [location.pathname]);

  return (
    <div className="hidden lg:flex w-64 bg-white h-screen flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/agent" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobShare</span>
        </Link>
      </div>

      {/* Team/Space Selector */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">E</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Elux Space</span>
              <span className="text-sm font-medium text-gray-900">HR Team</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* General Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            {t.general}
          </h3>
          <div className="space-y-1">
            {generalItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <div key={item.id}>
                  {item.hasSubmenu ? (
                    <button
                      onClick={() => {
                        setShowNominationSubmenu(!showNominationSubmenu);
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? 'bg-gray-100 text-red-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-red-600' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium flex-1 text-left ${active ? 'text-red-600' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showNominationSubmenu ? 'rotate-90' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? 'bg-gray-100 text-red-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-red-600' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium flex-1 text-left ${active ? 'text-red-600' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </Link>
                  )}
                  {item.hasSubmenu && showNominationSubmenu && (
                    <div className="ml-8 mt-1 space-y-1">
                      {/* Submenu items can be added here */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Others Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
            {t.others}
          </h3>
          <div className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-gray-100 text-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium flex-1 text-left ${active ? 'text-red-600' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;

