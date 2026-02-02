-- Migration: Add yearly_salary column to job_applications table
-- Created: 2024-01-29
-- Description: Thêm trường yearly_salary vào bảng job_applications để lưu lương năm của ứng viên

-- Add yearly_salary column to job_applications table
ALTER TABLE `job_applications`
ADD COLUMN `yearly_salary` decimal(15,2) DEFAULT NULL COMMENT 'Lương năm của ứng viên (VND hoặc 万円)' AFTER `monthly_salary`;

