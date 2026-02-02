-- Migration: Create job_recruiting_companies table with separate tables for services and sectors
-- Created: 2024-01-29
-- Description: Tạo bảng lưu thông tin công ty tuyển dụng với bảng riêng cho services và business sectors

-- Table: job_recruiting_companies
-- Mô tả: Lưu thông tin công ty thực sự tuyển dụng (nằm trong JD), khác với company_id (công ty cung cấp JD)
CREATE TABLE IF NOT EXISTS `job_recruiting_companies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint(20) unsigned NOT NULL COMMENT 'ID của job',
  `company_name` varchar(255) DEFAULT NULL COMMENT 'Tên công ty',
  `revenue` varchar(255) DEFAULT NULL COMMENT 'Doanh thu',
  `number_of_employees` varchar(255) DEFAULT NULL COMMENT 'Số nhân viên',
  `headquarters` varchar(255) DEFAULT NULL COMMENT 'Trụ sở tại',
  `company_introduction` text DEFAULT NULL COMMENT 'Giới thiệu chung về công ty',
  `stock_exchange_info` varchar(255) DEFAULT NULL COMMENT 'Thông tin trên sàn chứng khoán',
  `investment_capital` varchar(255) DEFAULT NULL COMMENT 'Vốn đầu tư',
  `established_date` varchar(255) DEFAULT NULL COMMENT 'Thành lập',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_job_recruiting_company` (`job_id`),
  KEY `fk_job_recruiting_companies_job` (`job_id`),
  CONSTRAINT `fk_job_recruiting_companies_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thông tin công ty tuyển dụng thực tế trong JD';

-- Table: job_recruiting_company_services
-- Mô tả: Lưu các dịch vụ cung cấp của công ty tuyển dụng (many-to-many)
CREATE TABLE IF NOT EXISTS `job_recruiting_company_services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_recruiting_company_id` bigint(20) unsigned NOT NULL COMMENT 'ID của job_recruiting_company',
  `service_name` varchar(255) NOT NULL COMMENT 'Tên dịch vụ',
  `order` int(11) NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_job_recruiting_company_services_company` (`job_recruiting_company_id`),
  CONSTRAINT `fk_job_recruiting_company_services_company` FOREIGN KEY (`job_recruiting_company_id`) REFERENCES `job_recruiting_companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Các dịch vụ cung cấp của công ty tuyển dụng';

-- Table: job_recruiting_company_business_sectors
-- Mô tả: Lưu các lĩnh vực kinh doanh của công ty tuyển dụng (many-to-many)
CREATE TABLE IF NOT EXISTS `job_recruiting_company_business_sectors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_recruiting_company_id` bigint(20) unsigned NOT NULL COMMENT 'ID của job_recruiting_company',
  `sector_name` varchar(255) NOT NULL COMMENT 'Tên lĩnh vực kinh doanh',
  `order` int(11) NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_job_recruiting_company_business_sectors_company` (`job_recruiting_company_id`),
  CONSTRAINT `fk_job_recruiting_company_business_sectors_company` FOREIGN KEY (`job_recruiting_company_id`) REFERENCES `job_recruiting_companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Các lĩnh vực kinh doanh của công ty tuyển dụng';

