import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  FileCheck,
  DollarSign,
  Building2,
  BarChart3,
  UserCog,
  Megaphone,
  Mail,
  Check,
  Settings,
  ChevronRight,
  List,
  UserPlus,
  Trophy,
  FolderTree,
  UserCheck,
  Handshake,
  UsersRound,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';
import apiService from '../../services/api';

const AdminSidebar = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language] || translations.vi;
  const [showCollaboratorSubmenu, setShowCollaboratorSubmenu] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  // Check if user is Super Admin (role = 1)
  const isSuperAdmin = adminProfile?.role === 1;
  // Check if user is AdminBackOffice (role = 2)
  const isAdminBackOffice = adminProfile?.role === 2;
  // Check if user is Admin CA Team (role = 3)
  const isAdminCATeam = adminProfile?.role === 3;

  // Base menu items - visible to all roles
  const baseMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/admin',
      roles: [1, 2, 3] // All roles
    },
  ];

  // Menu items for Super Admin and Admin Backoffice
  const adminMenuItems = [
    { 
      id: 'quan-ly-ctv', 
      label: 'Quản lý CTV', 
      icon: Users, 
      path: '/admin/collaborators',
      hasSubmenu: true,
      roles: [1, 2], // Super Admin and Admin Backoffice
      submenu: [
        {
          id: 'danh-sach-ctv',
          label: 'Danh sách cộng tác viên',
          icon: List,
          path: '/admin/collaborators',
        },
        {
          id: 'them-moi-ctv',
          label: 'Thêm mới CTV',
          icon: UserPlus,
          path: '/admin/collaborators/new',
          roles: [1], // Only Super Admin
        },
        {
          id: 'bxh-ctv',
          label: 'BXH CTV',
          icon: Trophy,
          path: '/admin/collaborators/ranking',
        },
      ]
    },
    { 
      id: 'quan-ly-ho-so-ung-vien', 
      label: 'Quản lý hồ sơ ứng viên', 
      icon: FileText, 
      path: '/admin/candidates',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'quan-ly-danh-muc-viec-lam', 
      label: 'Quản lý danh mục việc làm', 
      icon: FolderTree, 
      path: '/admin/job-categories',
      roles: [1] // Only Super Admin
    },
    { 
      id: 'quan-ly-cong-viec', 
      label: 'Quản lý công việc', 
      icon: Briefcase, 
      path: '/admin/jobs',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'quan-ly-don-tien-cu', 
      label: 'Quản lý đơn tiến cử', 
      icon: FileCheck, 
      path: '/admin/nominations',
      roles: [1, 2, 3] // All roles
    },
    { 
      id: 'quan-ly-thanh-toan', 
      label: 'Quản lý thanh toán', 
      icon: DollarSign, 
      path: '/admin/payments',
      roles: [1, 2, 3] // All roles
    },
    { 
      id: 'quan-ly-doanh-nghiep', 
      label: 'Quản lý doanh nghiệp nguồn', 
      icon: Building2, 
      path: '/admin/companies',
      roles: [1] // Only Super Admin
    },
    { 
      id: 'bao-cao-thong-ke', 
      label: 'Báo cáo thống kê', 
      icon: BarChart3, 
      path: '/admin/reports',
      roles: [1, 2] // Super Admin and Admin Backoffice
    },
    { 
      id: 'chien-dich', 
      label: 'Chiến dịch', 
      icon: Megaphone, 
      path: '/admin/campaigns',
      roles: [1] // Only Super Admin
    },
    { 
      id: 'email-he-thong', 
      label: 'Email hệ thống', 
      icon: Mail, 
      path: '/admin/emails',
      roles: [1] // Only Super Admin
    },
  ];

  // Menu items for Admin CA Team (role = 3) - limited access
  const adminCATeamMenuItems = [
    { 
      id: 'thong-tin-nhom', 
      label: 'Thông tin nhóm', 
      icon: Users, 
      path: '/admin/my-group',
      roles: [3] // Only Admin CA Team
    },
    { 
      id: 'ctv-nhom', 
      label: 'CTV của nhóm', 
      icon: Users, 
      path: '/admin/group-collaborators',
      roles: [3] // Only Admin CA Team
    },
    { 
      id: 'danh-sach-viec-lam-nhom', 
      label: 'Danh sách việc làm', 
      icon: Briefcase, 
      path: '/admin/group-jobs',
      roles: [3] // Only Admin CA Team
    },
    { 
      id: 'ho-so-ung-vien-nhom', 
      label: 'Hồ sơ ứng viên', 
      icon: FileText, 
      path: '/admin/group-candidates',
      roles: [3] // Only Admin CA Team
    },
  ];

  // Filter menu items based on role
  const menuItems = [
    ...baseMenuItems,
    ...adminMenuItems.filter(item => {
      if (item.roles && !item.roles.includes(adminProfile?.role)) {
        return false;
      }
      // Filter submenu items
      if (item.hasSubmenu && item.submenu) {
        item.submenu = item.submenu.filter(subItem => {
          if (subItem.roles && !subItem.roles.includes(adminProfile?.role)) {
            return false;
          }
          return true;
        });
        // Only show parent if it has visible submenu items
        return item.submenu.length > 0;
      }
      return true;
    }),
    ...adminCATeamMenuItems.filter(item => {
      return item.roles && item.roles.includes(adminProfile?.role);
    })
  ];

  // Add menu items based on role
  const roleBasedMenuItems = [];
  
  // Super Admin: Quản lý phân công CTV và Quản lý nhóm
  if (isSuperAdmin) {
    roleBasedMenuItems.push({
      id: 'phan-cong-ctv',
      label: 'Phân công CTV',
      icon: Handshake,
      path: '/admin/collaborator-assignments',
    });
    roleBasedMenuItems.push({
      id: 'quan-ly-nhom',
      label: 'Quản lý nhóm',
      icon: UsersRound,
      path: '/admin/groups',
    });
  }
  
  // AdminBackOffice: CTV được phân công
  if (isAdminBackOffice) {
    roleBasedMenuItems.push({
      id: 'ctv-duoc-phan-cong',
      label: 'CTV được phân công',
      icon: UserCheck,
      path: '/admin/my-assigned-collaborators',
    });
  }

  // Combine menu items
  const allMenuItems = [...menuItems, ...roleBasedMenuItems];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  // Load admin profile
  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const response = await apiService.getAdminProfile();
        if (response.success && response.data?.admin) {
          setAdminProfile(response.data.admin);
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
      }
    };
    loadAdminProfile();
  }, []);

  // Auto-expand submenu if on collaborators pages
  useEffect(() => {
    if (location.pathname.startsWith('/admin/collaborators')) {
      setShowCollaboratorSubmenu(true);
    }
  }, [location.pathname]);


  return (
    <div className="w-80 bg-white h-screen flex flex-col shadow-sm border-r border-gray-200">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">JobShare Admin</span>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setShowCollaboratorSubmenu(!showCollaboratorSubmenu)}
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
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showCollaboratorSubmenu ? 'rotate-90' : ''}`} />
                  </button>
                  {showCollaboratorSubmenu && item.submenu && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = location.pathname === subItem.path || 
                          (subItem.path === '/admin/collaborators' && location.pathname === '/admin/collaborators');
                        
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              subActive
                                ? 'bg-red-50 text-red-600'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 ${subActive ? 'text-red-600' : 'text-gray-500'}`} />
                            <span className={`text-sm flex-1 text-left ${subActive ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
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

      {/* Account Management Section */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/admin/accounts"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive('/admin/accounts')
              ? 'bg-gray-100 text-red-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <UserCog className={`w-5 h-5 ${isActive('/admin/accounts') ? 'text-red-600' : 'text-gray-600'}`} />
          <span className={`text-sm font-medium ${isActive('/admin/accounts') ? 'text-red-600' : 'text-gray-700'}`}>
            Quản lý tài khoản
          </span>
        </Link>
      </div>

      {/* Settings Section */}
      <div className="px-4 pb-4">
        <Link
          to="/admin/settings"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive('/admin/settings')
              ? 'bg-gray-100 text-red-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className={`w-5 h-5 ${isActive('/admin/settings') ? 'text-red-600' : 'text-gray-600'}`} />
          <span className={`text-sm font-medium ${isActive('/admin/settings') ? 'text-red-600' : 'text-gray-700'}`}>
            Cài đặt
          </span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;

