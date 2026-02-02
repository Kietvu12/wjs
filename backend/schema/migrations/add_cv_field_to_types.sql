-- Migration: Add cv_field to types table
-- Created: 2024-02-01
-- Description: Thêm trường cv_field để chỉ định field trong CV mà type này sẽ so sánh với (ví dụ: 'jlptLevel', 'experienceYears')

ALTER TABLE `types`
ADD COLUMN `cv_field` VARCHAR(255) DEFAULT NULL COMMENT 'Tên field trong CV để so sánh (ví dụ: jlptLevel, experienceYears, specialization, qualification)' AFTER `typename`;

-- Update existing types với cv_field tương ứng
-- Giả sử typeId = 1 là JLPT, typeId = 2 là Experience Years
-- Bạn cần kiểm tra và cập nhật theo dữ liệu thực tế của mình
UPDATE `types` SET `cv_field` = 'jlptLevel' WHERE `typename` LIKE '%JLPT%' OR `typename` LIKE '%jlpt%' OR `id` = 1;
UPDATE `types` SET `cv_field` = 'experienceYears' WHERE `typename` LIKE '%Experience%' OR `typename` LIKE '%Kinh nghiệm%' OR `id` = 2;
UPDATE `types` SET `cv_field` = 'specialization' WHERE `typename` LIKE '%Specialization%' OR `typename` LIKE '%Chuyên ngành%';
UPDATE `types` SET `cv_field` = 'qualification' WHERE `typename` LIKE '%Qualification%' OR `typename` LIKE '%Bằng cấp%';

