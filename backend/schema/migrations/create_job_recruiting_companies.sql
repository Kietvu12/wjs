-- Migration: Create job_recruiting_companies table
-- Created: 2024-01-29
-- Description: Tạo bảng lưu thông tin công ty tuyển dụng thực tế trong JD (khác với công ty cung cấp JD)

-- Table: job_recruiting_companies
-- Mô tả: Lưu thông tin công ty thực sự tuyển dụng (nằm trong JD), khác với company_id (công ty cung cấp JD)
CREATE TABLE IF NOT EXISTS `job_recruiting_companies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint(20) unsigned NOT NULL COMMENT 'ID của job',
  `company_name` varchar(255) DEFAULT NULL COMMENT 'Tên công ty',
  `services_provided` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Các dịch vụ cung cấp (JSON array)' CHECK (json_valid(`services_provided`)),
  `revenue` varchar(255) DEFAULT NULL COMMENT 'Doanh thu',
  `number_of_employees` varchar(255) DEFAULT NULL COMMENT 'Số nhân viên',
  `headquarters` varchar(255) DEFAULT NULL COMMENT 'Trụ sở tại',
  `company_introduction` text DEFAULT NULL COMMENT 'Giới thiệu chung về công ty',
  `stock_exchange_info` varchar(255) DEFAULT NULL COMMENT 'Thông tin trên sàn chứng khoán',
  `business_sector` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Phân loại lĩnh vực kinh doanh (JSON array)' CHECK (json_valid(`business_sector`)),
  `investment_capital` varchar(255) DEFAULT NULL COMMENT 'Vốn đầu tư',
  `established_date` varchar(255) DEFAULT NULL COMMENT 'Thành lập',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_job_recruiting_companies_job` (`job_id`),
  CONSTRAINT `fk_job_recruiting_companies_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Thông tin công ty tuyển dụng thực tế trong JD';

