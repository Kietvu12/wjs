-- Migration: Create Outlook email sync tables
-- Created: 2024-01-29

-- Table: outlook_connections
-- Lưu thông tin kết nối với tài khoản Outlook
CREATE TABLE IF NOT EXISTS `outlook_connections` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL COMMENT 'Email của tài khoản Outlook',
  `access_token` text DEFAULT NULL COMMENT 'Access token từ Microsoft OAuth',
  `refresh_token` text DEFAULT NULL COMMENT 'Refresh token để làm mới access token',
  `expires_at` datetime DEFAULT NULL COMMENT 'Thời gian hết hạn của access token',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Trạng thái kết nối: 1 = active, 0 = inactive',
  `last_sync_at` datetime DEFAULT NULL COMMENT 'Thời gian đồng bộ lần cuối',
  `sync_enabled` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Bật/tắt đồng bộ tự động',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_outlook_connections_email` (`email`),
  KEY `idx_outlook_connections_active` (`is_active`, `sync_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: synced_emails
-- Lưu các email đã đồng bộ từ Outlook
CREATE TABLE IF NOT EXISTS `synced_emails` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `outlook_connection_id` bigint(20) unsigned NOT NULL COMMENT 'ID của outlook_connection',
  `message_id` varchar(255) NOT NULL COMMENT 'Message ID từ Microsoft Graph API',
  `conversation_id` varchar(255) DEFAULT NULL COMMENT 'Conversation ID để nhóm email',
  `internet_message_id` varchar(255) DEFAULT NULL COMMENT 'Internet Message ID',
  `subject` varchar(500) DEFAULT NULL COMMENT 'Tiêu đề email',
  `body` text DEFAULT NULL COMMENT 'Nội dung email (HTML)',
  `body_preview` text DEFAULT NULL COMMENT 'Preview nội dung email',
  `from_email` varchar(255) DEFAULT NULL COMMENT 'Email người gửi',
  `from_name` varchar(255) DEFAULT NULL COMMENT 'Tên người gửi',
  `to_recipients` json DEFAULT NULL COMMENT 'Danh sách người nhận (JSON array)',
  `cc_recipients` json DEFAULT NULL COMMENT 'Danh sách CC (JSON array)',
  `bcc_recipients` json DEFAULT NULL COMMENT 'Danh sách BCC (JSON array)',
  `received_date_time` datetime DEFAULT NULL COMMENT 'Thời gian nhận email',
  `sent_date_time` datetime DEFAULT NULL COMMENT 'Thời gian gửi email',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Đã đọc: 1 = đã đọc, 0 = chưa đọc',
  `has_attachments` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Có đính kèm: 1 = có, 0 = không',
  `importance` varchar(50) DEFAULT 'normal' COMMENT 'Mức độ quan trọng: low, normal, high',
  `folder` varchar(100) DEFAULT 'inbox' COMMENT 'Thư mục: inbox, sent, drafts, etc.',
  `direction` enum('inbound','outbound') NOT NULL DEFAULT 'inbound' COMMENT 'Hướng: inbound = nhận, outbound = gửi',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_synced_emails_message_id` (`message_id`),
  KEY `idx_synced_emails_connection` (`outlook_connection_id`, `received_date_time`),
  KEY `idx_synced_emails_folder_read` (`folder`, `is_read`),
  KEY `idx_synced_emails_received` (`received_date_time`),
  CONSTRAINT `fk_synced_emails_connection` FOREIGN KEY (`outlook_connection_id`) REFERENCES `outlook_connections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

