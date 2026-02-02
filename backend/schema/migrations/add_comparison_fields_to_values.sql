-- Migration: Add comparison fields to values table
-- Created: 2024-01-29
-- Description: Thêm các trường để hỗ trợ so sánh điều kiện (>=, <=, >, <, =, between)

ALTER TABLE `values`
ADD COLUMN `comparison_operator` varchar(10) DEFAULT NULL COMMENT 'Toán tử so sánh: >=, <=, >, <, =, between' AFTER `valuename`,
ADD COLUMN `comparison_value` varchar(255) DEFAULT NULL COMMENT 'Giá trị để so sánh (ví dụ: 3 cho N3, 3 cho 3 năm)' AFTER `comparison_operator`,
ADD COLUMN `comparison_value_end` varchar(255) DEFAULT NULL COMMENT 'Giá trị kết thúc cho between (ví dụ: 5 cho "từ 2 đến 5")' AFTER `comparison_value`;

-- Index để tối ưu query
CREATE INDEX `idx_values_comparison` ON `values` (`id_typename`, `comparison_operator`, `comparison_value`);

