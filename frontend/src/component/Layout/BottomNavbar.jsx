import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

const BottomNavbar = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  const generalItems = [
    { id: 'thong-tin-chung', label: t.generalInfo, icon: LayoutGrid, path: '/agent' },
    { id: 'danh-sach-viec-lam', label: t.jobList, icon: Flag, path: '/agent/jobs' },
    { id: 'ho-so-ung-vien', label: t.candidateProfile, icon: FileCheck, path: '/agent/candidates' },
    { id: 'quan-ly-tien-cu', label: t.nominationManagement, icon: FileText, path: '/agent/nominations' },
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

  // Show first 5 general items (most important)
  const navItems = generalItems.slice(0, 5);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center justify-center p-2.5 rounded-lg transition-colors ${
                active
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title={item.label}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-red-600' : 'text-gray-500'}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavbar;

