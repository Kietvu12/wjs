-- ============================================
-- CÁC BẢNG LIÊN QUAN ĐẾN EMAIL
-- Trích xuất từ structure.sql
-- ============================================

--
-- Table structure for table `email_companies`
--

DROP TABLE IF EXISTS `email_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_companies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `subject` varchar(255) NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `recipients_detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients_detail`)),
  `recipient_type` varchar(255) NOT NULL DEFAULT 'specific',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `sent_at` timestamp NULL DEFAULT NULL,
  `recipients_count` int(11) NOT NULL DEFAULT 0,
  `file_attachment_path` varchar(255) DEFAULT NULL,
  `file_attachment_original_name` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_newsletters`
--

DROP TABLE IF EXISTS `email_newsletters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_newsletters` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `sent_at` timestamp NULL DEFAULT NULL,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `recipients_count` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `type` tinyint(4) NOT NULL DEFAULT 1,
  `group_id` bigint(20) unsigned DEFAULT NULL,
  `file_attachment` varchar(255) DEFAULT NULL,
  `file_attachment_original_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_email_newsletters_created_by` (`created_by`),
  KEY `fk_email_newsletters_group` (`group_id`),
  CONSTRAINT `fk_email_newsletters_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_email_newsletters_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` tinyint(4) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_email_templates_created_by` (`created_by`),
  CONSTRAINT `fk_email_templates_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_to_collaborator`
--

DROP TABLE IF EXISTS `email_to_collaborator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_to_collaborator` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `collaborator_id` bigint(20) unsigned NOT NULL COMMENT 'ID của collaborator',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `subject` varchar(255) NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `recipients_detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients_detail`)),
  `recipient_type` varchar(255) NOT NULL DEFAULT 'specific',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `sent_at` timestamp NULL DEFAULT NULL,
  `recipients_count` int(11) NOT NULL DEFAULT 0,
  `file_attachment_path` varchar(255) DEFAULT NULL,
  `file_attachment_original_name` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_email_to_collaborator_collaborator` (`collaborator_id`),
  KEY `fk_email_to_collaborator_created_by` (`created_by`),
  CONSTRAINT `fk_email_to_collaborator_collaborator` FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_email_to_collaborator_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_to_companies`
--

DROP TABLE IF EXISTS `email_to_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_to_companies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email_company_id` bigint(20) unsigned NOT NULL COMMENT 'ID của email_companies',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `subject` varchar(255) NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `recipients_detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients_detail`)),
  `recipient_type` varchar(255) NOT NULL DEFAULT 'specific',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `sent_at` timestamp NULL DEFAULT NULL,
  `recipients_count` int(11) NOT NULL DEFAULT 0,
  `file_attachment_path` varchar(255) DEFAULT NULL,
  `file_attachment_original_name` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_email_to_companies_email_company` (`email_company_id`),
  KEY `fk_email_to_companies_created_by` (`created_by`),
  CONSTRAINT `fk_email_to_companies_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_email_to_companies_email_company` FOREIGN KEY (`email_company_id`) REFERENCES `email_companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_to_group`
--

DROP TABLE IF EXISTS `email_to_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_to_group` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `group_id` bigint(20) unsigned NOT NULL COMMENT 'ID của group',
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `subject` varchar(255) NOT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `recipients_detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients_detail`)),
  `recipient_type` varchar(255) NOT NULL DEFAULT 'specific',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `sent_at` timestamp NULL DEFAULT NULL,
  `recipients_count` int(11) NOT NULL DEFAULT 0,
  `file_attachment_path` varchar(255) DEFAULT NULL,
  `file_attachment_original_name` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_email_to_group_group` (`group_id`),
  KEY `fk_email_to_group_created_by` (`created_by`),
  CONSTRAINT `fk_email_to_group_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_email_to_group_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mail_settings`
--

DROP TABLE IF EXISTS `mail_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mail_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `type` tinyint(4) NOT NULL COMMENT '1: CC, 2: BCC',
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- ============================================
-- TÓM TẮT CÁC BẢNG EMAIL:
-- ============================================
-- 1. email_companies          - Email gửi cho công ty (draft)
-- 2. email_newsletters        - Email newsletter gửi cho CTV/Group
-- 3. email_templates          - Template email
-- 4. email_to_collaborator    - Email đã gửi cho CTV cụ thể
-- 5. email_to_companies       - Email đã gửi cho công ty (chi tiết)
-- 6. email_to_group           - Email đã gửi cho group
-- 7. mail_settings            - Cài đặt email (CC/BCC)
-- ============================================

