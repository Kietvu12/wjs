-- Migration: Add admin_responsible_id column to job_applications table
-- Date: 2024
-- Description: Thêm trường admin_responsible_id vào bảng job_applications để lưu ID của admin phụ trách khi admin tự tiến cử ứng viên (không qua CTV)
-- Phân biệt với admin_id: admin_id là admin tạo đơn (tương ứng với CTV thuộc admin đó), admin_responsible_id là admin phụ trách (khi admin tự tiến cử)

-- Add admin_responsible_id column to job_applications table
ALTER TABLE `job_applications`
ADD COLUMN `admin_responsible_id` bigint(20) unsigned DEFAULT NULL AFTER `admin_id`,
ADD KEY `fk_job_applications_admin_responsible` (`admin_responsible_id`),
ADD CONSTRAINT `fk_job_applications_admin_responsible` FOREIGN KEY (`admin_responsible_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

