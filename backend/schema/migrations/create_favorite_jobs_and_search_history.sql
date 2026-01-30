-- Migration: Create tables for Favorite Jobs and Search History
-- Created: 2024-01-01
-- Description: Tạo bảng favorite_jobs và search_history cho CTV

-- Table: favorite_jobs
-- Mô tả: Lưu danh sách job yêu thích của CTV
DROP TABLE IF EXISTS `favorite_jobs`;
CREATE TABLE `favorite_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `collaborator_id` bigint(20) unsigned NOT NULL COMMENT 'ID của collaborator',
  `job_id` bigint(20) unsigned NOT NULL COMMENT 'ID của job',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_collaborator_job` (`collaborator_id`, `job_id`),
  KEY `fk_favorite_jobs_collaborator` (`collaborator_id`),
  KEY `fk_favorite_jobs_job` (`job_id`),
  CONSTRAINT `fk_favorite_jobs_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_favorite_jobs_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh sách job yêu thích của CTV';

-- Table: search_history
-- Mô tả: Lưu lịch sử tìm kiếm của CTV
DROP TABLE IF EXISTS `search_history`;
CREATE TABLE `search_history` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `collaborator_id` bigint(20) unsigned NOT NULL COMMENT 'ID của collaborator',
  `keyword` varchar(255) DEFAULT NULL COMMENT 'Từ khóa tìm kiếm',
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Các điều kiện lọc đã chọn (JSON)',
  `result_count` int(11) DEFAULT 0 COMMENT 'Số lượng kết quả tìm được',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_search_history_collaborator_created` (`collaborator_id`, `created_at`),
  CONSTRAINT `fk_search_history_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch sử tìm kiếm của CTV';

