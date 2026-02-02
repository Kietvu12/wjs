import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Định nghĩa các model Sequelize dựa trên cấu trúc DB trong schema/structure.sql
 * Lưu ý:
 * - tableName luôn dùng snake_case đúng theo DB
 * - timestamps dùng cột created_at / updated_at
 * - paranoid dùng cột deleted_at nếu bảng có cột này
 * - field trong từng attribute map snake_case <-> camelCase nếu controller đang dùng camelCase
 */

// Admins
export const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      field: 'email_verified_at'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(255)
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    rememberToken: {
      type: DataTypes.STRING(100),
      field: 'remember_token'
    },
    role: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    groupId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'group_id'
    }
  },
  {
    tableName: 'admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Groups
export const Group = sequelize.define(
  'Group',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    referralCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'referral_code'
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    tableName: 'groups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Action Logs
export const ActionLog = sequelize.define(
  'ActionLog',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'admin_id'
    },
    object: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(255)
    },
    before: {
      type: DataTypes.JSON
    },
    after: {
      type: DataTypes.JSON
    },
    description: {
      type: DataTypes.STRING(255)
    }
  },
  {
    tableName: 'action_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Rank Levels
export const RankLevel = sequelize.define(
  'RankLevel',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    pointsRequired: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'points_required'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    tableName: 'rank_levels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Collaborators
export const Collaborator = sequelize.define(
  'Collaborator',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(255)
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      field: 'email_verified_at'
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(255)
    },
    country: {
      type: DataTypes.STRING(255)
    },
    postCode: {
      type: DataTypes.STRING(255),
      field: 'post_code'
    },
    address: {
      type: DataTypes.TEXT
    },
    organizationType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'individual',
      field: 'organization_type'
    },
    companyName: {
      type: DataTypes.STRING(255),
      field: 'company_name'
    },
    taxCode: {
      type: DataTypes.STRING(255),
      field: 'tax_code'
    },
    website: {
      type: DataTypes.STRING(255)
    },
    businessAddress: {
      type: DataTypes.TEXT,
      field: 'business_address'
    },
    businessLicense: {
      type: DataTypes.STRING(255),
      field: 'business_license'
    },
    avatar: {
      type: DataTypes.STRING(255)
    },
    birthday: {
      type: DataTypes.DATEONLY
    },
    gender: {
      type: DataTypes.TINYINT
    },
    facebook: {
      type: DataTypes.STRING(255)
    },
    zalo: {
      type: DataTypes.STRING(255)
    },
    bankName: {
      type: DataTypes.STRING(255),
      field: 'bank_name'
    },
    bankAccount: {
      type: DataTypes.STRING(255),
      field: 'bank_account'
    },
    bankAccountName: {
      type: DataTypes.STRING(255),
      field: 'bank_account_name'
    },
    bankBranch: {
      type: DataTypes.STRING(255),
      field: 'bank_branch'
    },
    organizationLink: {
      type: DataTypes.STRING(255),
      field: 'organization_link'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rankLevelId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'rank_level_id'
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    approvedAt: {
      type: DataTypes.DATE,
      field: 'approved_at'
    },
    groupId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'group_id'
    },
    rememberToken: {
      type: DataTypes.STRING(100),
      field: 'remember_token'
    }
  },
  {
    tableName: 'collaborators',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Companies
export const Company = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255)
    },
    logo: {
      type: DataTypes.STRING(255)
    },
    companyCode: {
      type: DataTypes.STRING(255),
      field: 'company_code'
    },
    type: {
      type: DataTypes.STRING(255)
    },
    address: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING(255)
    },
    email: {
      type: DataTypes.STRING(255)
    },
    website: {
      type: DataTypes.STRING(255)
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Company Business Fields
export const CompanyBusinessField = sequelize.define(
  'CompanyBusinessField',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_company'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'company_business_fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Company Email Addresses
export const CompanyEmailAddress = sequelize.define(
  'CompanyEmailAddress',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'company_id'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 'company_email_addresses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Company Offices
export const CompanyOffice = sequelize.define(
  'CompanyOffice',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_company'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isHeadOffice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_head_office'
    }
  },
  {
    tableName: 'company_offices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Categories
export const JobCategory = sequelize.define(
  'JobCategory',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    parentId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'parent_id'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    tableName: 'job_categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Jobs
export const Job = sequelize.define(
  'Job',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'job_code'
    },
    jobCategoryId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_category_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    instruction: {
      type: DataTypes.TEXT
    },
    interviewLocation: {
      type: DataTypes.TINYINT,
      field: 'interview_location'
    },
    bonus: {
      type: DataTypes.TEXT
    },
    salaryReview: {
      type: DataTypes.TEXT,
      field: 'salary_review'
    },
    holidays: {
      type: DataTypes.TEXT
    },
    socialInsurance: {
      type: DataTypes.TEXT,
      field: 'social_insurance'
    },
    transportation: {
      type: DataTypes.TEXT
    },
    breakTime: {
      type: DataTypes.TEXT,
      field: 'break_time'
    },
    overtime: {
      type: DataTypes.TEXT
    },
    recruitmentType: {
      type: DataTypes.TINYINT,
      field: 'recruitment_type'
    },
    contractPeriod: {
      type: DataTypes.TEXT,
      field: 'contract_period'
    },
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'company_id'
    },
    recruitmentProcess: {
      type: DataTypes.TEXT,
      field: 'recruitment_process'
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'views_count'
    },
    deadline: {
      type: DataTypes.DATEONLY
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_pinned'
    },
    jdFile: {
      type: DataTypes.STRING(255),
      field: 'jd_file'
    },
    jdOriginalFilename: {
      type: DataTypes.STRING(255),
      field: 'jd_original_filename'
    },
    isHot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_hot'
    },
    jobCommissionType: {
      type: DataTypes.ENUM('fixed', 'percent'),
      field: 'job_commission_type'
    },
    requiredCvForm: {
      type: DataTypes.STRING(255),
      field: 'required_cv_form'
    },
    requiredCvFormOriginalFilename: {
      type: DataTypes.STRING(255),
      field: 'required_cv_form_original_filename'
    }
  },
  {
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Applications
export const JobApplication = sequelize.define(
  'JobApplication',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'collaborator_id'
    },
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'admin_id'
    },
    title: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.INTEGER
    },
    cvCode: {
      type: DataTypes.STRING(255),
      field: 'cv_code'
    },
    monthlySalary: {
      type: DataTypes.DECIMAL(15, 2),
      field: 'monthly_salary'
    },
    yearlySalary: {
      type: DataTypes.DECIMAL(15, 2),
      field: 'yearly_salary'
    },
    appliedAt: {
      type: DataTypes.DATE,
      field: 'applied_at'
    },
    interviewDate: {
      type: DataTypes.DATE,
      field: 'interview_date'
    },
    interviewRound2Date: {
      type: DataTypes.DATE,
      field: 'interview_round2_date'
    },
    nyushaDate: {
      type: DataTypes.DATEONLY,
      field: 'nyusha_date'
    },
    expectedPaymentDate: {
      type: DataTypes.DATEONLY,
      field: 'expected_payment_date'
    },
    rejectNote: {
      type: DataTypes.TEXT,
      field: 'reject_note'
    }
  },
  {
    tableName: 'job_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Payment Requests
export const PaymentRequest = sequelize.define(
  'PaymentRequest',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaborator_id'
    },
    jobApplicationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_application_id'
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    note: {
      type: DataTypes.TEXT
    },
    approvedAt: {
      type: DataTypes.DATE,
      field: 'approved_at'
    },
    rejectedAt: {
      type: DataTypes.DATE,
      field: 'rejected_at'
    },
    rejectedReason: {
      type: DataTypes.TEXT,
      field: 'rejected_reason'
    },
    filePath: {
      type: DataTypes.STRING(255),
      field: 'file_path'
    }
  },
  {
    tableName: 'payment_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Posts
export const Post = sequelize.define(
  'Post',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255)
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    categoryId: {
      type: DataTypes.STRING(255),
      field: 'category_id'
    },
    authorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'author_id'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'view_count'
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'like_count'
    },
    tag: {
      type: DataTypes.STRING(255)
    },
    metaTitle: {
      type: DataTypes.STRING(255),
      field: 'meta_title'
    },
    metaDescription: {
      type: DataTypes.STRING(255),
      field: 'meta_description'
    },
    metaKeywords: {
      type: DataTypes.STRING(255),
      field: 'meta_keywords'
    },
    metaImage: {
      type: DataTypes.STRING(255),
      field: 'meta_image'
    },
    metaUrl: {
      type: DataTypes.STRING(255),
      field: 'meta_url'
    },
    publishedAt: {
      type: DataTypes.DATE,
      field: 'published_at'
    }
  },
  {
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Categories (CMS)
export const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#007bff'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order'
    },
    showInDashboard: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'show_in_dashboard'
    }
  },
  {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// FAQs
export const FAQ = sequelize.define(
  'FAQ',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    tableName: 'faqs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Collaborator Notifications
export const CollaboratorNotification = sequelize.define(
  'CollaboratorNotification',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaborator_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'job_id'
    },
    url: {
      type: DataTypes.STRING(255)
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read'
    }
  },
  {
    tableName: 'collaborator_notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Campaigns
export const Campaign = sequelize.define(
  'Campaign',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    maxCv: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'max_cv'
    },
    percent: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Campaign Applications
export const CampaignApplication = sequelize.define(
  'CampaignApplication',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    campaignId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'campaign_id'
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaborator_id'
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    coverLetter: {
      type: DataTypes.TEXT,
      field: 'cover_letter'
    },
    cvFile: {
      type: DataTypes.STRING(255),
      field: 'cv_file'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT
    },
    appliedAt: {
      type: DataTypes.DATE,
      field: 'applied_at'
    }
  },
  {
    tableName: 'campaign_applications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// CV Storages (kho CV)
export const CVStorage = sequelize.define(
  'CVStorage',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'collaborator_id'
    },
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'admin_id'
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    furigana: {
      type: DataTypes.STRING(255)
    },
    name: {
      type: DataTypes.STRING(255)
    },
    email: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING(255)
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      field: 'birth_date'
    },
    gender: {
      type: DataTypes.TINYINT
    },
    ages: {
      type: DataTypes.STRING(255)
    },
    addressOrigin: {
      type: DataTypes.STRING(255),
      field: 'address_origin'
    },
    passport: {
      type: DataTypes.TINYINT
    },
    currentResidence: {
      type: DataTypes.TINYINT,
      field: 'current_residence'
    },
    jpResidenceStatus: {
      type: DataTypes.TINYINT,
      field: 'jp_residence_status'
    },
    visaExpirationDate: {
      type: DataTypes.DATE,
      field: 'visa_expiration_date'
    },
    otherCountry: {
      type: DataTypes.STRING(255),
      field: 'other_country'
    },
    addressCurrent: {
      type: DataTypes.STRING(255),
      field: 'address_current'
    },
    postalCode: {
      type: DataTypes.STRING(20),
      field: 'postal_code'
    },
    spouse: {
      type: DataTypes.TINYINT
    },
    currentIncome: {
      type: DataTypes.INTEGER,
      field: 'current_income'
    },
    desiredIncome: {
      type: DataTypes.INTEGER,
      field: 'desired_income'
    },
    desiredWorkLocation: {
      type: DataTypes.STRING(255),
      field: 'desired_work_location'
    },
    desiredPosition: {
      type: DataTypes.STRING(255),
      field: 'desired_position'
    },
    nyushaTime: {
      type: DataTypes.STRING(255),
      field: 'nyusha_time'
    },
    interviewTime: {
      type: DataTypes.STRING(255),
      field: 'interview_time'
    },
    learnedTools: {
      type: DataTypes.JSON,
      field: 'learned_tools'
    },
    experienceTools: {
      type: DataTypes.JSON,
      field: 'experience_tools'
    },
    jlptLevel: {
      type: DataTypes.TINYINT,
      field: 'jlpt_level'
    },
    experienceYears: {
      type: DataTypes.TINYINT,
      field: 'experience_years'
    },
    specialization: {
      type: DataTypes.TINYINT
    },
    qualification: {
      type: DataTypes.TINYINT
    },
    educations: {
      type: DataTypes.JSON
    },
    workExperiences: {
      type: DataTypes.JSON,
      field: 'work_experiences'
    },
    technicalSkills: {
      type: DataTypes.TEXT,
      field: 'technical_skills'
    },
    certificates: {
      type: DataTypes.JSON
    },
    careerSummary: {
      type: DataTypes.TEXT,
      field: 'career_summary'
    },
    strengths: {
      type: DataTypes.TEXT
    },
    motivation: {
      type: DataTypes.TEXT
    },
    otherDocuments: {
      type: DataTypes.STRING(255),
      field: 'other_documents'
    },
    curriculumVitae: {
      type: DataTypes.STRING(255),
      field: 'curriculum_vitae'
    },
    notes: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    isDuplicate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_duplicate'
    },
    duplicateWithCvId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'duplicate_with_cv_id'
    }
  },
  {
    tableName: 'cv_storages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Mail Settings
export const MailSetting = sequelize.define(
  'MailSetting',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    note: {
      type: DataTypes.STRING(255)
    }
  },
  {
    tableName: 'mail_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Email Templates
export const EmailTemplate = sequelize.define(
  'EmailTemplate',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    description: {
      type: DataTypes.TEXT
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'created_by'
    }
  },
  {
    tableName: 'email_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Email Companies
export const EmailCompany = sequelize.define(
  'EmailCompany',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    recipients: {
      type: DataTypes.JSON
    },
    recipientsDetail: {
      type: DataTypes.JSON,
      field: 'recipients_detail'
    },
    recipientType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'specific',
      field: 'recipient_type'
    },
    attachments: {
      type: DataTypes.JSON
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'draft'
    },
    sentAt: {
      type: DataTypes.DATE,
      field: 'sent_at'
    },
    recipientsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'recipients_count'
    },
    fileAttachmentPath: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_path'
    },
    fileAttachmentOriginalName: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_original_name'
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'created_by'
    }
  },
  {
    tableName: 'email_companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Email Newsletters
export const EmailNewsletter = sequelize.define(
  'EmailNewsletter',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    sentAt: {
      type: DataTypes.DATE,
      field: 'sent_at'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      field: 'scheduled_at'
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'created_by'
    },
    recipients: {
      type: DataTypes.JSON
    },
    recipientsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'recipients_count'
    },
    notes: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    groupId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'group_id'
    },
    fileAttachment: {
      type: DataTypes.STRING(255),
      field: 'file_attachment'
    },
    fileAttachmentOriginalName: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_original_name'
    }
  },
  {
    tableName: 'email_newsletters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Email To Collaborator
export const EmailToCollaborator = sequelize.define(
  'EmailToCollaborator',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaborator_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    recipients: {
      type: DataTypes.JSON
    },
    recipientsDetail: {
      type: DataTypes.JSON,
      field: 'recipients_detail'
    },
    recipientType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'specific',
      field: 'recipient_type'
    },
    attachments: {
      type: DataTypes.JSON
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'draft'
    },
    sentAt: {
      type: DataTypes.DATE,
      field: 'sent_at'
    },
    recipientsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'recipients_count'
    },
    fileAttachmentPath: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_path'
    },
    fileAttachmentOriginalName: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_original_name'
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'created_by'
    }
  },
  {
    tableName: 'email_to_collaborator',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Email To Company
export const EmailToCompany = sequelize.define(
  'EmailToCompany',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    emailCompanyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'email_company_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    recipients: {
      type: DataTypes.JSON
    },
    recipientsDetail: {
      type: DataTypes.JSON,
      field: 'recipients_detail'
    },
    recipientType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'specific',
      field: 'recipient_type'
    },
    attachments: {
      type: DataTypes.JSON
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'draft'
    },
    sentAt: {
      type: DataTypes.DATE,
      field: 'sent_at'
    },
    recipientsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'recipients_count'
    },
    fileAttachmentPath: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_path'
    },
    fileAttachmentOriginalName: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_original_name'
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'created_by'
    }
  },
  {
    tableName: 'email_to_companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Email To Group
export const EmailToGroup = sequelize.define(
  'EmailToGroup',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    groupId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'group_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    recipients: {
      type: DataTypes.JSON
    },
    recipientsDetail: {
      type: DataTypes.JSON,
      field: 'recipients_detail'
    },
    recipientType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'specific',
      field: 'recipient_type'
    },
    attachments: {
      type: DataTypes.JSON
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'draft'
    },
    sentAt: {
      type: DataTypes.DATE,
      field: 'sent_at'
    },
    recipientsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'recipients_count'
    },
    fileAttachmentPath: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_path'
    },
    fileAttachmentOriginalName: {
      type: DataTypes.STRING(255),
      field: 'file_attachment_original_name'
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'created_by'
    }
  },
  {
    tableName: 'email_to_group',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Home Setting Jobs
export const HomeSettingJob = sequelize.define(
  'HomeSettingJob',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    postId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'post_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(20)
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    thumbnail: {
      type: DataTypes.STRING(255)
    },
    description: {
      type: DataTypes.TEXT
    },
    requirement: {
      type: DataTypes.STRING(255)
    },
    salary: {
      type: DataTypes.INTEGER
    },
    salaryUnit: {
      type: DataTypes.STRING(255),
      field: 'salary_unit'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    popup: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'home_setting_jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Home Setting Partners
export const HomeSettingPartner = sequelize.define(
  'HomeSettingPartner',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(255)
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'home_setting_partners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Job Pickups
export const JobPickup = sequelize.define(
  'JobPickup',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    tableName: 'job_pickups',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Pickups Id (mapping job_pickups - jobs)
export const JobPickupId = sequelize.define(
  'JobPickupId',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobPickupId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_job_pickups'
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_job'
    }
  },
  {
    tableName: 'job_pickups_id',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Campaigns (mapping campaigns - jobs)
export const JobCampaign = sequelize.define(
  'JobCampaign',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    campaignId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'campaign_id'
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    }
  },
  {
    tableName: 'job_campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Working Locations
export const WorkingLocation = sequelize.define(
  'WorkingLocation',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(255)
    }
  },
  {
    tableName: 'working_locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Salary Ranges
export const SalaryRange = sequelize.define(
  'SalaryRange',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    salaryRange: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'salary_range'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    tableName: 'salary_ranges',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Salary Range Details
export const SalaryRangeDetail = sequelize.define(
  'SalaryRangeDetail',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'salary_range_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Overtime Allowances
export const OvertimeAllowance = sequelize.define(
  'OvertimeAllowance',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    overtimeAllowanceRange: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'overtime_allowance_range'
    }
  },
  {
    tableName: 'overtime_allowances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Overtime Allowance Details
export const OvertimeAllowanceDetail = sequelize.define(
  'OvertimeAllowanceDetail',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'overtime_allowance_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Benefits
export const Benefit = sequelize.define(
  'Benefit',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'benefits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Requirements
export const Requirement = sequelize.define(
  'Requirement',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    tableName: 'requirements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Smoking Policies
export const SmokingPolicy = sequelize.define(
  'SmokingPolicy',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    allow: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  },
  {
    tableName: 'smoking_policies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Smoking Policy Details
export const SmokingPolicyDetail = sequelize.define(
  'SmokingPolicyDetail',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'smoking_policy_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Working Hours
export const WorkingHour = sequelize.define(
  'WorkingHour',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    workingHours: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'working_hours'
    }
  },
  {
    tableName: 'working_hours',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Working Hours Details
export const WorkingHourDetail = sequelize.define(
  'WorkingHourDetail',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'working_hours_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Working Location Details
export const WorkingLocationDetail = sequelize.define(
  'WorkingLocationDetail',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'working_location_details',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Types (Settings for job attributes)
export const Type = sequelize.define(
  'Type',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    typename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'typename'
    },
    cvField: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'cv_field',
      comment: 'Tên field trong CV để so sánh (ví dụ: jlptLevel, experienceYears, specialization, qualification)'
    }
  },
  {
    tableName: 'types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Values (Values for types)
export const Value = sequelize.define(
  'Value',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    typeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_typename'
    },
    valuename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'valuename'
    },
    comparisonOperator: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'comparison_operator',
      comment: 'Toán tử so sánh: >=, <=, >, <, =, between'
    },
    comparisonValue: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'comparison_value',
      comment: 'Giá trị để so sánh (ví dụ: 3 cho N3, 3 cho 3 năm)'
    },
    comparisonValueEnd: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'comparison_value_end',
      comment: 'Giá trị kết thúc cho between (ví dụ: 5 cho "từ 2 đến 5")'
    }
  },
  {
    tableName: 'values',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Values (Mapping jobs with values)
export const JobValue = sequelize.define(
  'JobValue',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    typeId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_typename'
    },
    valueId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'id_value'
    },
    value: {
      type: DataTypes.STRING(255)
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_required'
    }
  },
  {
    tableName: 'job_values',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Calendars (Lịch hẹn)
export const Calendar = sequelize.define(
  'Calendar',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobApplicationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_application_id'
    },
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'admin_id'
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'collaborator_id'
    },
    eventType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      field: 'event_type'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_at'
    },
    endAt: {
      type: DataTypes.DATE,
      field: 'end_at'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'calendars',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Messages (Tin nhắn)
export const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobApplicationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_application_id'
    },
    adminId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'admin_id'
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'collaborator_id'
    },
    senderType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      field: 'sender_type'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isReadByAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read_by_admin'
    },
    isReadByCollaborator: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read_by_collaborator'
    }
  },
  {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Associations
Admin.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
Group.hasMany(Admin, { as: 'admins', foreignKey: 'groupId' });

ActionLog.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });
Admin.hasMany(ActionLog, { as: 'actionLogs', foreignKey: 'adminId' });

Collaborator.belongsTo(RankLevel, { as: 'rankLevel', foreignKey: 'rankLevelId' });
RankLevel.hasMany(Collaborator, { as: 'collaborators', foreignKey: 'rankLevelId' });

Collaborator.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
Group.hasMany(Collaborator, { as: 'collaborators', foreignKey: 'groupId' });

Job.belongsTo(JobCategory, { as: 'category', foreignKey: 'jobCategoryId' });
JobCategory.hasMany(Job, { as: 'jobs', foreignKey: 'jobCategoryId' });

// JobCategory self-referencing (parent-child)
JobCategory.belongsTo(JobCategory, { as: 'parent', foreignKey: 'parentId' });
JobCategory.hasMany(JobCategory, { as: 'children', foreignKey: 'parentId' });

Job.belongsTo(Company, { as: 'company', foreignKey: 'companyId' });
Company.hasMany(Job, { as: 'jobs', foreignKey: 'companyId' });

// Company associations
// Note: CompanyBusinessField uses 'id_company' field, CompanyOffice uses 'id_company' field
Company.hasMany(CompanyBusinessField, { as: 'businessFields', foreignKey: 'companyId' });
CompanyBusinessField.belongsTo(Company, { as: 'company', foreignKey: 'companyId' });

Company.hasMany(CompanyEmailAddress, { as: 'emailAddresses', foreignKey: 'companyId' });
CompanyEmailAddress.belongsTo(Company, { as: 'company', foreignKey: 'companyId' });

Company.hasMany(CompanyOffice, { as: 'offices', foreignKey: 'companyId' });
CompanyOffice.belongsTo(Company, { as: 'company', foreignKey: 'companyId' });

JobApplication.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(JobApplication, { as: 'applications', foreignKey: 'jobId' });

JobApplication.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(JobApplication, { as: 'jobApplications', foreignKey: 'collaboratorId' });

JobApplication.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });
Admin.hasMany(JobApplication, { as: 'jobApplications', foreignKey: 'adminId' });

JobApplication.belongsTo(CVStorage, { as: 'cv', foreignKey: 'cvCode', targetKey: 'code' });
CVStorage.hasMany(JobApplication, { as: 'jobApplications', foreignKey: 'cvCode', sourceKey: 'code' });

PaymentRequest.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(PaymentRequest, { as: 'paymentRequests', foreignKey: 'collaboratorId' });

PaymentRequest.belongsTo(JobApplication, { as: 'jobApplication', foreignKey: 'jobApplicationId' });
JobApplication.hasMany(PaymentRequest, { as: 'paymentRequests', foreignKey: 'jobApplicationId' });

CampaignApplication.belongsTo(Campaign, { as: 'campaign', foreignKey: 'campaignId' });
Campaign.hasMany(CampaignApplication, { as: 'applications', foreignKey: 'campaignId' });

CampaignApplication.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(CampaignApplication, { as: 'campaignApplications', foreignKey: 'collaboratorId' });

CampaignApplication.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(CampaignApplication, { as: 'campaignApplications', foreignKey: 'jobId' });

CollaboratorNotification.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(CollaboratorNotification, { as: 'notifications', foreignKey: 'collaboratorId' });

CollaboratorNotification.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(CollaboratorNotification, { as: 'notifications', foreignKey: 'jobId' });

HomeSettingJob.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
Post.hasMany(HomeSettingJob, { as: 'homeSettings', foreignKey: 'postId' });

EmailTemplate.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
Admin.hasMany(EmailTemplate, { as: 'emailTemplates', foreignKey: 'createdBy' });

EmailNewsletter.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
Admin.hasMany(EmailNewsletter, { as: 'emailNewsletters', foreignKey: 'createdBy' });

EmailNewsletter.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
Group.hasMany(EmailNewsletter, { as: 'emailNewsletters', foreignKey: 'groupId' });

EmailCompany.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
Admin.hasMany(EmailCompany, { as: 'emailCompanies', foreignKey: 'createdBy' });

// EmailToCollaborator associations
EmailToCollaborator.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(EmailToCollaborator, { as: 'emails', foreignKey: 'collaboratorId' });

EmailToCollaborator.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
Admin.hasMany(EmailToCollaborator, { as: 'emailsToCollaborators', foreignKey: 'createdBy' });

// EmailToCompany associations
EmailToCompany.belongsTo(EmailCompany, { as: 'emailCompany', foreignKey: 'emailCompanyId' });
EmailCompany.hasMany(EmailToCompany, { as: 'emailToCompanies', foreignKey: 'emailCompanyId' });

EmailToCompany.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
Admin.hasMany(EmailToCompany, { as: 'emailsToCompanies', foreignKey: 'createdBy' });

// EmailToGroup associations
EmailToGroup.belongsTo(Group, { as: 'group', foreignKey: 'groupId' });
Group.hasMany(EmailToGroup, { as: 'emails', foreignKey: 'groupId' });

EmailToGroup.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
Admin.hasMany(EmailToGroup, { as: 'emailsToGroups', foreignKey: 'createdBy' });

Post.belongsTo(Admin, { as: 'author', foreignKey: 'authorId' });
Admin.hasMany(Post, { as: 'posts', foreignKey: 'authorId' });

JobPickupId.belongsTo(JobPickup, { as: 'pickup', foreignKey: 'jobPickupId' });
JobPickup.hasMany(JobPickupId, { as: 'jobPickupIds', foreignKey: 'jobPickupId' });

JobPickupId.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(JobPickupId, { as: 'jobPickupIds', foreignKey: 'jobId' });

// JobCampaign associations
JobCampaign.belongsTo(Campaign, { as: 'campaign', foreignKey: 'campaignId' });
Campaign.hasMany(JobCampaign, { as: 'jobCampaigns', foreignKey: 'campaignId' });

JobCampaign.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(JobCampaign, { as: 'jobCampaigns', foreignKey: 'jobId' });

WorkingLocation.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(WorkingLocation, { as: 'workingLocations', foreignKey: 'jobId' });

WorkingLocationDetail.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(WorkingLocationDetail, { as: 'workingLocationDetails', foreignKey: 'jobId' });

SalaryRange.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(SalaryRange, { as: 'salaryRanges', foreignKey: 'jobId' });

SalaryRangeDetail.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(SalaryRangeDetail, { as: 'salaryRangeDetails', foreignKey: 'jobId' });

OvertimeAllowance.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(OvertimeAllowance, { as: 'overtimeAllowances', foreignKey: 'jobId' });

OvertimeAllowanceDetail.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(OvertimeAllowanceDetail, { as: 'overtimeAllowanceDetails', foreignKey: 'jobId' });

Requirement.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(Requirement, { as: 'requirements', foreignKey: 'jobId' });

Benefit.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(Benefit, { as: 'benefits', foreignKey: 'jobId' });

SmokingPolicy.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(SmokingPolicy, { as: 'smokingPolicies', foreignKey: 'jobId' });

SmokingPolicyDetail.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(SmokingPolicyDetail, { as: 'smokingPolicyDetails', foreignKey: 'jobId' });

WorkingHour.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(WorkingHour, { as: 'workingHours', foreignKey: 'jobId' });

WorkingHourDetail.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(WorkingHourDetail, { as: 'workingHourDetails', foreignKey: 'jobId' });

// Type and Value associations
Value.belongsTo(Type, { as: 'type', foreignKey: 'typeId' });
Type.hasMany(Value, { as: 'values', foreignKey: 'typeId' });

// JobValue associations
JobValue.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasMany(JobValue, { as: 'jobValues', foreignKey: 'jobId' });

JobValue.belongsTo(Type, { as: 'type', foreignKey: 'typeId' });
Type.hasMany(JobValue, { as: 'jobValues', foreignKey: 'typeId' });

JobValue.belongsTo(Value, { as: 'valueRef', foreignKey: 'valueId' });
Value.hasMany(JobValue, { as: 'jobValues', foreignKey: 'valueId' });

CVStorage.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(CVStorage, { as: 'cvStorages', foreignKey: 'collaboratorId' });

CVStorage.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });
Admin.hasMany(CVStorage, { as: 'cvStorages', foreignKey: 'adminId' });

// Calendar associations
Calendar.belongsTo(JobApplication, { as: 'jobApplication', foreignKey: 'jobApplicationId' });
JobApplication.hasMany(Calendar, { as: 'calendars', foreignKey: 'jobApplicationId' });

Calendar.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });
Admin.hasMany(Calendar, { as: 'calendars', foreignKey: 'adminId' });

Calendar.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(Calendar, { as: 'calendars', foreignKey: 'collaboratorId' });

// Message associations
Message.belongsTo(JobApplication, { as: 'jobApplication', foreignKey: 'jobApplicationId' });
JobApplication.hasMany(Message, { as: 'messages', foreignKey: 'jobApplicationId' });

Message.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });
Admin.hasMany(Message, { as: 'messages', foreignKey: 'adminId' });

Message.belongsTo(Collaborator, { as: 'collaborator', foreignKey: 'collaboratorId' });
Collaborator.hasMany(Message, { as: 'messages', foreignKey: 'collaboratorId' });

export {
  sequelize
};

export default {
  sequelize,
  Admin,
  Group,
  ActionLog,
  RankLevel,
  Collaborator,
  Company,
  CompanyBusinessField,
  CompanyEmailAddress,
  CompanyOffice,
  JobCategory,
  Job,
  JobApplication,
  PaymentRequest,
  Post,
  Category,
  FAQ,
  CollaboratorNotification,
  Campaign,
  CampaignApplication,
  CVStorage,
  MailSetting,
  EmailTemplate,
  EmailCompany,
  EmailNewsletter,
  EmailToCollaborator,
  EmailToCompany,
  EmailToGroup,
  HomeSettingJob,
  HomeSettingPartner,
  JobPickup,
  JobPickupId,
  JobCampaign,
  WorkingLocation,
  WorkingLocationDetail,
  SalaryRange,
  SalaryRangeDetail,
  OvertimeAllowance,
  OvertimeAllowanceDetail,
  Benefit,
  Requirement,
  SmokingPolicy,
  SmokingPolicyDetail,
  WorkingHour,
  WorkingHourDetail,
  Type,
  Value,
  JobValue,
  Calendar,
  Message
};

// Favorite Jobs (CTV lưu job yêu thích)
export const FavoriteJob = sequelize.define(
  'FavoriteJob',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaborator_id',
      references: {
        model: 'collaborators',
        key: 'id'
      }
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id',
      references: {
        model: 'jobs',
        key: 'id'
      }
    }
  },
  {
    tableName: 'favorite_jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['collaborator_id', 'job_id']
      }
    ]
  }
);

// Search History (Lịch sử tìm kiếm của CTV)
export const SearchHistory = sequelize.define(
  'SearchHistory',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    collaboratorId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'collaborator_id',
      references: {
        model: 'collaborators',
        key: 'id'
      }
    },
    keyword: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Từ khóa tìm kiếm'
    },
    filters: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Các điều kiện lọc đã chọn (JSON)'
    },
    resultCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'result_count',
      comment: 'Số lượng kết quả tìm được'
    }
  },
  {
    tableName: 'search_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['collaborator_id', 'created_at']
      }
    ]
  }
);

// Associations for FavoriteJob
FavoriteJob.belongsTo(Collaborator, {
  foreignKey: 'collaboratorId',
  as: 'collaborator'
});

FavoriteJob.belongsTo(Job, {
  foreignKey: 'jobId',
  as: 'job'
});

// Associations for SearchHistory
SearchHistory.belongsTo(Collaborator, {
  foreignKey: 'collaboratorId',
  as: 'collaborator'
});

// Job Recruiting Company (Công ty tuyển dụng thực tế trong JD)
export const JobRecruitingCompany = sequelize.define(
  'JobRecruitingCompany',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_id'
    },
    companyName: {
      type: DataTypes.STRING(255),
      field: 'company_name'
    },
    revenue: {
      type: DataTypes.STRING(255)
    },
    numberOfEmployees: {
      type: DataTypes.STRING(255),
      field: 'number_of_employees'
    },
    headquarters: {
      type: DataTypes.STRING(255)
    },
    companyIntroduction: {
      type: DataTypes.TEXT,
      field: 'company_introduction'
    },
    stockExchangeInfo: {
      type: DataTypes.STRING(255),
      field: 'stock_exchange_info'
    },
    investmentCapital: {
      type: DataTypes.STRING(255),
      field: 'investment_capital'
    },
    establishedDate: {
      type: DataTypes.STRING(255),
      field: 'established_date'
    }
  },
  {
    tableName: 'job_recruiting_companies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Recruiting Company Service
export const JobRecruitingCompanyService = sequelize.define(
  'JobRecruitingCompanyService',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobRecruitingCompanyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_recruiting_company_id'
    },
    serviceName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'service_name'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'job_recruiting_company_services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Job Recruiting Company Business Sector
export const JobRecruitingCompanyBusinessSector = sequelize.define(
  'JobRecruitingCompanyBusinessSector',
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    jobRecruitingCompanyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'job_recruiting_company_id'
    },
    sectorName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'sector_name'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    tableName: 'job_recruiting_company_business_sectors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
);

// Associations for JobRecruitingCompany
JobRecruitingCompany.belongsTo(Job, { as: 'job', foreignKey: 'jobId' });
Job.hasOne(JobRecruitingCompany, { as: 'recruitingCompany', foreignKey: 'jobId' });

JobRecruitingCompany.hasMany(JobRecruitingCompanyService, { 
  as: 'services', 
  foreignKey: 'jobRecruitingCompanyId' 
});
JobRecruitingCompanyService.belongsTo(JobRecruitingCompany, { 
  as: 'recruitingCompany', 
  foreignKey: 'jobRecruitingCompanyId' 
});

JobRecruitingCompany.hasMany(JobRecruitingCompanyBusinessSector, { 
  as: 'businessSectors', 
  foreignKey: 'jobRecruitingCompanyId' 
});
JobRecruitingCompanyBusinessSector.belongsTo(JobRecruitingCompany, { 
  as: 'recruitingCompany', 
  foreignKey: 'jobRecruitingCompanyId' 
});

