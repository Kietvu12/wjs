-- Migration: Add admin_id column to job_applications table
-- Date: 2024
-- Description: Thêm trường admin_id vào bảng job_applications để lưu ID của admin khi admin tiến cử ứng viên

-- Add admin_id column to job_applications table
ALTER TABLE `job_applications`
ADD COLUMN `admin_id` bigint(20) unsigned DEFAULT NULL AFTER `collaborator_id`,
ADD KEY `fk_job_applications_admin` (`admin_id`),
ADD CONSTRAINT `fk_job_applications_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

