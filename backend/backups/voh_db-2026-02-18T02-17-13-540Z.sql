-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: voh_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alert_recipients`
--

DROP TABLE IF EXISTS `alert_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alert_recipients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `alert_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `email` varchar(255) NOT NULL,
  `delivery_status` enum('pending','sent','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `alert_id` (`alert_id`),
  CONSTRAINT `alert_recipients_ibfk_1` FOREIGN KEY (`alert_id`) REFERENCES `alerts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert_recipients`
--

LOCK TABLES `alert_recipients` WRITE;
/*!40000 ALTER TABLE `alert_recipients` DISABLE KEYS */;
INSERT INTO `alert_recipients` VALUES (3,3,4,'gacoernestmae@gmail.com','sent',NULL,'2026-02-05 10:00:42','2026-02-05 10:00:39'),(4,4,4,'gacoernestmae@gmail.com','sent',NULL,'2026-02-05 10:05:47','2026-02-05 10:05:44'),(5,4,5,'erlprincesllorente@gmail.com','sent',NULL,'2026-02-05 10:05:51','2026-02-05 10:05:44'),(6,4,6,'graceboyonas29@gmail.com','sent',NULL,'2026-02-05 10:05:55','2026-02-05 10:05:44'),(10,6,5,'erlprincesllorente110103@gmail.com','sent',NULL,'2026-02-06 20:45:14','2026-02-06 20:45:10'),(11,6,6,'graceboyonas29@gmail.com','sent',NULL,'2026-02-06 20:45:18','2026-02-06 20:45:10'),(12,7,1,'admin@voh.com','sent',NULL,'2026-02-06 22:21:26','2026-02-06 22:21:22'),(13,8,5,'erlprincesllorente110103@gmail.com','sent',NULL,'2026-02-18 09:31:19','2026-02-18 09:31:16'),(14,8,9,'gacoernestmae@gmail.com','sent',NULL,'2026-02-18 09:31:21','2026-02-18 09:31:16'),(15,9,5,'erlprincesllorente110103@gmail.com','failed','Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials d9443c01a7336-2ad1a9d624esm107628365ad.49 - gsmtp',NULL,'2026-02-18 09:48:52'),(16,9,9,'gacoernestmae@gmail.com','failed','Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials d9443c01a7336-2ad1a713d5dsm186856785ad.29 - gsmtp',NULL,'2026-02-18 09:48:52'),(17,10,5,'erlprincesllorente110103@gmail.com','sent',NULL,'2026-02-18 10:04:07','2026-02-18 10:04:04'),(18,10,9,'gacoernestmae@gmail.com','sent',NULL,'2026-02-18 10:04:10','2026-02-18 10:04:04');
/*!40000 ALTER TABLE `alert_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alerts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `priority` enum('high','medium','low') DEFAULT 'medium',
  `status` enum('draft','scheduled','sent','failed') DEFAULT 'sent',
  `recipient_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`recipient_roles`)),
  `scheduled_at` datetime DEFAULT NULL,
  `sent_at` datetime DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
INSERT INTO `alerts` VALUES (3,'I LOVE YOU❤️','TESTING RANI KUNG MO GANA BA.','general','high','sent','[\"Staff\"]',NULL,'2026-02-05 10:00:39',1,'2026-02-05 10:00:39'),(4,'HAHAHAHA','TESTING RA GRA','general','medium','sent','[\"Social Worker\",\"House Parent\",\"Staff\"]',NULL,'2026-02-05 10:05:44',1,'2026-02-05 10:05:44'),(6,'Heart Broken','Louya ni preda😭','health','high','sent','[\"House Parent\",\"Social Worker\"]',NULL,'2026-02-06 20:45:10',1,'2026-02-06 20:45:10'),(7,'Yayay','aray ko','health','medium','sent','[\"Admin\"]',NULL,'2026-02-06 22:21:22',1,'2026-02-06 22:21:22'),(8,'dedcwe','fcdscsc','general','medium','sent','[\"House Parent\"]',NULL,'2026-02-18 09:31:16',1,'2026-02-18 09:31:16'),(9,'jsdnsdc','ddhsbcsd','urgent','medium','failed','[\"House Parent\"]',NULL,'2026-02-18 09:48:52',1,'2026-02-18 09:48:52'),(10,'fdfdvdf','jcbdsjcs','general','medium','sent','[\"House Parent\"]',NULL,'2026-02-18 10:04:04',1,'2026-02-18 10:04:04');
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_trail`
--

DROP TABLE IF EXISTS `audit_trail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_trail` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `user_id` bigint(20) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_role` varchar(100) DEFAULT NULL,
  `action` varchar(30) NOT NULL,
  `module` varchar(120) NOT NULL,
  `resource` varchar(120) DEFAULT NULL,
  `resource_id` varchar(120) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(60) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'info',
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_trail`
--

LOCK TABLES `audit_trail` WRITE;
/*!40000 ALTER TABLE `audit_trail` DISABLE KEYS */;
INSERT INTO `audit_trail` VALUES (122,'2026-02-11 20:50:23',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','11','Updated child profile: Lloyd Anora','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(123,'2026-02-11 20:50:59',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','19','Generated PDF report: Child Profile Report: Lloyd fd Anora','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(124,'2026-02-11 20:51:03',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','19','Viewed report: Child Profile Report: Lloyd fd Anora','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(125,'2026-02-11 20:57:49',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','11','Updated child profile: Lloyd Anora','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(126,'2026-02-11 21:08:55',1,'Jevie P. Boniel','Admin','CREATE','Children Management','Child','12','Created child profile: dfvdf vdfvdf','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(127,'2026-02-11 21:10:32',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','20','Generated PDF report: All Children Overview Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(128,'2026-02-11 21:10:34',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','20','Viewed report: All Children Overview Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(129,'2026-02-11 21:11:34',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','20','Viewed report: All Children Overview Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(130,'2026-02-11 21:11:40',1,'Jevie P. Boniel','Admin','PRINT','Reports','Report','20','Printed report: All Children Overview Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(131,'2026-02-11 21:12:18',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(132,'2026-02-11 21:12:38',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(133,'2026-02-11 21:13:24',1,'Jevie P. Boniel','Admin','SHARE','Reports','Report','20','Shared report: All Children Overview Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(134,'2026-02-11 21:14:38',NULL,NULL,NULL,'UPDATE','Development Tracking','Milestone','13','Updated milestone \"Physical\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(135,'2026-02-12 18:04:57',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','12','Updated child profile: dfvdf vdfvdf','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(136,'2026-02-12 18:11:20',NULL,NULL,NULL,'UPDATE','Development Tracking','Milestone','15','Updated milestone \"sleep\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(137,'2026-02-12 18:12:05',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','12','Updated child profile: dfvdf vdfvdf','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(138,'2026-02-12 19:44:17',4,'Ernest Mae T. Gaco','Staff','LOGIN','Authentication','System Access','user_4','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(139,'2026-02-12 19:45:14',4,'Ernest Mae T. Gaco','Staff','UPDATE','Development Tracking','Milestone','15','Updated milestone \"sleep\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(140,'2026-02-12 19:45:59',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(141,'2026-02-12 20:08:14',1,'Jevie P. Boniel','Admin','CREATE','Children Management','Child','13','Created child profile: Ernest Mae Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(142,'2026-02-12 20:09:59',1,'Jevie P. Boniel','Admin','CREATE','Development Tracking','Milestone','16','Created milestone \"NEED HUG\" for childId=13','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(143,'2026-02-12 20:10:10',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(144,'2026-02-12 20:10:50',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','21','Generated PDF report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(145,'2026-02-12 20:10:52',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','21','Viewed report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(146,'2026-02-12 20:12:13',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(147,'2026-02-12 20:12:24',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User','4','Updated user: gacoernestmae@gmail.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(148,'2026-02-12 20:12:37',4,'Ernest Mae T. Gaco','Staff','LOGIN','Authentication','System Access','user_4','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(149,'2026-02-12 20:12:51',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(150,'2026-02-12 20:15:19',1,'Jevie P. Boniel','Admin','CREATE','Children Management','Education Record','2','Created education record for child #13 (Mathematics)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(151,'2026-02-12 20:15:47',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Education Summary','13','Updated education summary for child #13','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(152,'2026-02-12 20:17:18',1,'Jevie P. Boniel','Admin','CREATE','Children Management','Health Record','5','Created health record for child #13','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(153,'2026-02-12 20:19:11',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','13','Updated child profile: Ernest Mae Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(154,'2026-02-12 20:19:38',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','22','Generated PDF report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(155,'2026-02-12 20:19:42',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','22','Viewed report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(156,'2026-02-12 20:22:08',1,'Jevie P. Boniel','Admin','EXPORT','Audit Trail','AuditTrail',NULL,'Exported audit trail CSV','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info','{\"q\":\"\",\"module\":\"all\",\"action\":\"ALL\"}'),(157,'2026-02-12 20:24:45',1,'Jevie P. Boniel','Admin','PRINT','Reports','Report','22','Printed report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(158,'2026-02-13 09:15:10',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','23','Generated PDF report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(159,'2026-02-13 09:15:17',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','23','Viewed report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(160,'2026-02-13 09:16:08',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','24','Generated PDF report: Donations Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(161,'2026-02-13 09:16:11',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','24','Viewed report: Donations Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(162,'2026-02-13 09:16:25',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','25','Generated PDF report: Houses Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(163,'2026-02-13 09:18:05',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(164,'2026-02-13 09:18:11',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','25','Viewed report: Houses Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(165,'2026-02-13 09:18:34',1,'Jevie P. Boniel','Admin','PRINT','Reports','Report','24','Printed report: Donations Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(166,'2026-02-13 09:20:12',4,'Ernest Mae T. Gaco','Staff','LOGIN','Authentication','System Access','user_4','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(167,'2026-02-13 09:21:03',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(168,'2026-02-13 10:10:15',1,'Jevie P. Boniel','Admin','CREATE','Backup','SystemBackup',NULL,'Created backup (metadata recorded)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(169,'2026-02-13 10:10:39',1,'Jevie P. Boniel','Admin','UPDATE','Settings','SystemSettings',NULL,'Updated system settings (general/security/notifications/theme)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(170,'2026-02-13 10:12:14',1,'Jevie P. Boniel','Admin','CREATE','User Management','User','7','Created user: darling@gmail.com (Admin)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(171,'2026-02-13 10:22:53',7,'Darling B. Butil','Admin','LOGIN','Authentication','System Access','user_7','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(172,'2026-02-13 10:23:47',7,'Darling B. Butil','Admin','UPDATE','User Management','User','7','Updated user: darling@gmail.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(173,'2026-02-13 10:24:02',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(174,'2026-02-13 10:29:50',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','26','Generated PDF report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(175,'2026-02-13 10:29:52',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','26','Viewed report: Child Profile Report: Ernest Mae T. Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(176,'2026-02-13 10:32:37',4,'Ernest Mae T. Gaco','Staff','LOGIN','Authentication','System Access','user_4','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(177,'2026-02-13 10:34:39',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(178,'2026-02-13 10:35:06',1,'Jevie P. Boniel','Admin','UPDATE','Settings','SystemSettings',NULL,'Updated system settings (general/security/notifications/theme)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(179,'2026-02-13 10:35:17',4,'Ernest Mae T. Gaco','Staff','LOGIN','Authentication','System Access','user_4','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(180,'2026-02-13 10:36:16',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(181,'2026-02-13 10:36:25',1,'Jevie P. Boniel','Admin','UPDATE','Settings','SystemSettings',NULL,'Updated system settings (general/security/notifications/theme)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(182,'2026-02-13 10:36:37',4,'Ernest Mae T. Gaco','Staff','LOGIN','Authentication','System Access','user_4','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(183,'2026-02-13 10:37:29',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(184,'2026-02-13 10:38:17',1,'Jevie P. Boniel','Admin','DELETE','User Management','User','7','Deleted user account','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(185,'2026-02-13 10:38:27',1,'Jevie P. Boniel','Admin','DELETE','User Management','User','4','Deleted user account','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(186,'2026-02-13 10:39:59',1,'Jevie P. Boniel','Admin','CREATE','User Management','User','8','Created user: jeptha@gmail.com (House Parent)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(187,'2026-02-13 10:40:39',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User','8','Updated user: gacoernestmae@gmail.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(188,'2026-02-13 10:41:04',8,'Ernest Mae T. Gaco','House Parent','LOGIN_FAIL','Authentication','System Access','user_8','Login failed (attempt 1/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(189,'2026-02-13 10:41:11',8,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_8','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(190,'2026-02-13 10:43:18',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(191,'2026-02-13 10:44:22',6,'Grasya O. Boyonas','Social Worker','LOGIN_FAIL','Authentication','System Access','user_6','Login failed (attempt 1/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(192,'2026-02-13 10:44:28',6,'Grasya O. Boyonas','Social Worker','LOGIN_FAIL','Authentication','System Access','user_6','Login failed (attempt 2/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(193,'2026-02-13 10:44:37',6,'Grasya O. Boyonas','Social Worker','LOGIN_FAIL','Authentication','System Access','user_6','Login failed (attempt 3/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(194,'2026-02-13 10:44:41',6,'Grasya O. Boyonas','Social Worker','LOGIN_FAIL','Authentication','System Access','user_6','Login failed (attempt 4/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(195,'2026-02-13 10:44:46',6,'Grasya O. Boyonas','Social Worker','LOGIN_LOCK','Authentication','System Access','user_6','Account locked after 5 failed login attempts','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(196,'2026-02-13 10:44:58',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(197,'2026-02-13 10:45:08',1,'Jevie P. Boniel','Admin','UPDATE','Settings','SystemSettings',NULL,'Updated system settings (general/security/notifications/theme)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(198,'2026-02-13 10:49:46',8,'Ernest Mae T. Gaco','House Parent','LOGIN_FAIL','Authentication','System Access','user_8','Login failed (attempt 1/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(199,'2026-02-13 10:49:46',8,'Ernest Mae T. Gaco','House Parent','LOGIN_FAIL','Authentication','System Access','user_8','Login failed (attempt 2/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(200,'2026-02-13 10:50:19',8,'Ernest Mae T. Gaco','House Parent','LOGIN_FAIL','Authentication','System Access','user_8','Login failed (attempt 3/5)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(201,'2026-02-13 10:50:35',8,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_8','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(202,'2026-02-13 10:52:46',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(203,'2026-02-16 13:37:04',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(204,'2026-02-16 13:39:56',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','13','Updated child profile: Ernest Mae Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(205,'2026-02-16 20:31:13',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User','8','Updated user: gacoernestmae@gmail.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(206,'2026-02-16 20:31:55',1,'Jevie P. Boniel','Admin','DELETE','User Management','User','8','Deleted user account','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(207,'2026-02-16 20:33:57',1,'Jevie P. Boniel','Admin','CREATE','User Management','User','9','Created user: gacoernestmae@gmail.com (House Parent)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(208,'2026-02-16 20:34:15',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(209,'2026-02-16 20:35:02',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(210,'2026-02-16 20:35:12',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User','1','Updated user: admin@voh.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(211,'2026-02-16 20:35:42',1,'Jevie vee P. Boniel','Admin','UPDATE','User Management','User','1','Updated user: admin@voh.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(212,'2026-02-16 20:36:28',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(213,'2026-02-16 20:36:50',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(214,'2026-02-16 20:39:31',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(215,'2026-02-16 21:43:13',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(216,'2026-02-16 21:47:34',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(217,'2026-02-16 22:07:46',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(218,'2026-02-16 22:08:49',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(219,'2026-02-16 22:09:00',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(220,'2026-02-16 22:09:19',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(221,'2026-02-16 22:10:37',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(222,'2026-02-16 22:11:14',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(223,'2026-02-16 22:12:03',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(224,'2026-02-16 22:12:11',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(225,'2026-02-16 22:14:42',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(226,'2026-02-16 22:14:45',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(227,'2026-02-16 22:14:51',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(228,'2026-02-16 22:21:34',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User','1','Updated user: admin@voh.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(229,'2026-02-16 22:21:49',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(230,'2026-02-16 22:22:25',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(231,'2026-02-16 22:22:52',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User Status','5','Toggled user status to Suspended','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','warning',NULL),(232,'2026-02-16 22:22:57',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User Status','5','Toggled user status to Active','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(233,'2026-02-16 22:46:47',NULL,NULL,NULL,'CREATE','Donation Management','Donation','pi_r6jWSkgnvnmXEACMcdQpX6iZ','Created donation intent: PHP 5000 (One-time)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(234,'2026-02-16 22:47:42',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(235,'2026-02-16 22:48:13',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(236,'2026-02-16 22:50:24',1,'Jevie P. Boniel','Admin','CREATE','Reports','Report','27','Generated PDF report: Donations Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(237,'2026-02-16 22:50:26',1,'Jevie P. Boniel','Admin','VIEW','Reports','Report','27','Viewed report: Donations Summary Report','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(238,'2026-02-18 08:05:42',1,'Jevie P. Boniel','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(239,'2026-02-18 08:22:17',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','13','Updated child profile: Ernest Mae Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(240,'2026-02-18 08:23:16',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','13','Updated child profile: Ernest Mae Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(241,'2026-02-18 08:52:04',1,'Jevie P. Boniel','Admin','UPDATE','Development Tracking','Milestone','16','Updated milestone \"NEED HUG\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(242,'2026-02-18 08:52:34',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','13','Updated child profile: Ernest Maee Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(243,'2026-02-18 08:53:22',1,'Jevie P. Boniel','Admin','CREATE','Children Management','Child','14','Created child profile: cddsc sdcdsc','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(244,'2026-02-18 08:55:24',1,'Jevie P. Boniel','Admin','create','backup','backup_file','voh_db-2026-02-18T00-55-24-239Z.sql','Created database backup','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info','{\"filename\":\"voh_db-2026-02-18T00-55-24-239Z.sql\"}'),(245,'2026-02-18 09:27:52',1,'Jevie P. Boniel','Admin','UPDATE','Children Management','Child','14','Updated child profile: Ernest Mae Gaco','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(246,'2026-02-18 09:29:30',1,'Jevie P. Boniel','Admin','CREATE','Development Tracking','Milestone','17','Created milestone \"Level 3\" for childId=14','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(247,'2026-02-18 09:31:16',1,'Jevie P. Boniel','Admin','CREATE','Alerts','Alert','8','Created alert \"dedcwe\" (sent) to roles: House Parent','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(248,'2026-02-18 09:48:52',1,'Jevie P. Boniel','Admin','CREATE','Alerts','Alert','9','Created alert \"jsdnsdc\" (sent) to roles: House Parent','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(249,'2026-02-18 10:04:04',1,'Jevie P. Boniel','Admin','CREATE','Alerts','Alert','10','Created alert \"fdfdvdf\" (sent) to roles: House Parent','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(250,'2026-02-18 10:06:11',1,'Jevie P. Boniel','Admin','UPDATE','User Management','User','1','Updated user: hopegardenvoh@gmail.com','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(251,'2026-02-18 10:06:51',1,'Hope Garden PH','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(252,'2026-02-18 10:09:59',1,'Hope Garden PH','Admin','LOGIN','Authentication','System Access','user_1','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(253,'2026-02-18 10:11:48',NULL,NULL,NULL,'CREATE','Donation Management','Donation','pi_B4wBXwCQP4ukYVWsDSiAHDbf','Created donation intent: PHP 5000 (One-time)','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(254,'2026-02-18 10:14:45',1,'Hope Garden PH','Admin','UPDATE','Development Tracking','Milestone','17','Updated milestone \"Level 3\"','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL),(255,'2026-02-18 10:16:22',9,'Ernest Mae T. Gaco','House Parent','LOGIN','Authentication','System Access','user_9','User logged into the system','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0','info',NULL);
/*!40000 ALTER TABLE `audit_trail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `children`
--

DROP TABLE IF EXISTS `children`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `children` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` varchar(20) NOT NULL,
  `admission_date` date DEFAULT NULL,
  `house` varchar(100) DEFAULT NULL,
  `house_parent` varchar(100) DEFAULT NULL,
  `health_status` varchar(50) DEFAULT NULL,
  `education_level` varchar(100) DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `case_type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `adoption_status` varchar(80) DEFAULT 'Not Available for Adoption',
  `notes` text DEFAULT NULL,
  `last_checkup` varchar(20) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `reintegration` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reintegration`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `children`
--

LOCK TABLES `children` WRITE;
/*!40000 ALTER TABLE `children` DISABLE KEYS */;
INSERT INTO `children` VALUES (14,'Ernest Mae','T.','Gaco',12,'Female','2026-02-17','cdsvd','sdcsdc','Good','2','094324334343','Orphan','Active','Not Available for Adoption','Need Hug','0943423','/uploads/child_1771378072343.jpg',NULL,'2026-02-18 00:53:22');
/*!40000 ALTER TABLE `children` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paymongo_payment_intent_id` varchar(120) DEFAULT NULL,
  `paymongo_payment_id` varchar(120) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'PHP',
  `purpose` varchar(150) DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `type` varchar(30) DEFAULT 'One-time',
  `status` varchar(30) DEFAULT 'Pending',
  `donor_name` varchar(150) DEFAULT NULL,
  `donor_email` varchar(190) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `paymongo_payment_intent_id` (`paymongo_payment_intent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (2,'pi_hUtYzo3PyWDMp6S2i1dRaVZn','pay_b24HkgaDWspkjvaV4C3t9BGU',300.00,'PHP','Education Support','gcash','One-time','Completed','jevie',NULL,'2026-02-05 08:03:52','2026-02-05 08:04:12'),(15,'pi_V9NYfNudhnogt9JoUENxBcJz','pay_v1WDzy5ez3SEw7Hh8n3rqNpd',15000.00,'PHP','Healthcare','gcash','One-time','Completed','Grace Boyonas','graceboyonas29@gmail.com','2026-02-05 08:58:15','2026-02-05 08:58:25'),(16,'pi_XgiEMYziYGJoCEdc2v7eryuC','pay_7P2bJM85DBzJesKvNCRXtrWL',10000.00,'PHP','Healthcare','gcash','One-time','Completed','For Preda',NULL,'2026-02-06 12:47:01','2026-02-06 12:49:44'),(17,'pi_tSD7tcGVTXVuX4TEX1iCxmMX','pay_kGVydWCQFXtQskExNJ4XyTJm',10000.00,'PHP','Education Support','gcash','One-time','Completed','for preda',NULL,'2026-02-06 12:49:18','2026-02-06 12:49:22'),(18,'pi_PLNo5G1xF6KogFPPdqdJSxN9','pay_8G8LHccmYBb2giSog3b1RdFD',5000.00,'PHP','General Support','gcash','One-time','Completed','esme','gacoernestmae@gmail.com','2026-02-07 09:28:38','2026-02-07 09:28:45'),(19,'pi_XJt7MaKBPF6iG6iJjM4qkaev','pay_zxahipW3oVcWufes6TAag9ks',5500.00,'PHP','Food & Nutrition','card','One-time','Completed','Darling',NULL,'2026-02-08 07:45:23','2026-02-08 07:45:25'),(20,'pi_r6jWSkgnvnmXEACMcdQpX6iZ','pay_zRUyFqBQF1dyQKyw5n85Kxxy',5000.00,'PHP','Infrastructure','gcash','One-time','Completed','jevie',NULL,'2026-02-16 14:46:47','2026-02-16 14:46:54'),(21,'pi_B4wBXwCQP4ukYVWsDSiAHDbf','pay_sGXxmgNrNPDZDFNVGgHGVXw7',5000.00,'PHP','General Support','gcash','One-time','Completed','lloyd',NULL,'2026-02-18 02:11:48','2026-02-18 02:11:52');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education_records`
--

DROP TABLE IF EXISTS `education_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `education_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `child_id` int(11) NOT NULL,
  `subject` varchar(150) NOT NULL,
  `grade` varchar(20) NOT NULL,
  `teacher` varchar(150) NOT NULL,
  `term` varchar(60) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `child_id` (`child_id`),
  CONSTRAINT `education_records_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education_records`
--

LOCK TABLES `education_records` WRITE;
/*!40000 ALTER TABLE `education_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `education_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education_summaries`
--

DROP TABLE IF EXISTS `education_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `education_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `child_id` int(11) NOT NULL,
  `school` varchar(150) DEFAULT NULL,
  `average_grade` decimal(5,2) DEFAULT NULL,
  `honor` varchar(150) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `child_id` (`child_id`),
  CONSTRAINT `education_summaries_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education_summaries`
--

LOCK TABLES `education_summaries` WRITE;
/*!40000 ALTER TABLE `education_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `education_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `generated_reports`
--

DROP TABLE IF EXISTS `generated_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_reports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `report_key` varchar(120) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(80) NOT NULL,
  `subcategory` varchar(120) DEFAULT NULL,
  `period_label` varchar(80) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Ready',
  `format` varchar(10) NOT NULL DEFAULT 'PDF',
  `file_url` text DEFAULT NULL,
  `file_size_kb` int(11) DEFAULT NULL,
  `pages` int(11) DEFAULT NULL,
  `child_id` bigint(20) DEFAULT NULL,
  `generated_by` bigint(20) DEFAULT NULL,
  `generated_by_name` varchar(255) DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_category` (`category`),
  KEY `idx_child_id` (`child_id`),
  KEY `idx_report_key` (`report_key`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generated_reports`
--

LOCK TABLES `generated_reports` WRITE;
/*!40000 ALTER TABLE `generated_reports` DISABLE KEYS */;
INSERT INTO `generated_reports` VALUES (19,'2026-02-11 20:50:59','child_profile','Child Profile Report: Lloyd fd Anora','Single child profile including health and education summary.','Children','Child Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/child_profile_11_1770814259564_Child_Profile_Report_Lloyd_fd_Anora.pdf',2,NULL,11,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(20,'2026-02-11 21:10:32','children_overview','All Children Overview Report','Summary of all children including demographics, health status, and placement.','Children','Summary Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/children_overview_1770815432830_All_Children_Overview_Report.pdf',2,NULL,NULL,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(21,'2026-02-12 20:10:50','child_profile','Child Profile Report: Ernest Mae T. Gaco','Single child profile including health and education summary.','Children','Child Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/child_profile_13_1770898250819_Child_Profile_Report_Ernest_Mae_T_Gaco.pdf',2,NULL,13,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(22,'2026-02-12 20:19:38','child_profile','Child Profile Report: Ernest Mae T. Gaco','Single child profile including health and education summary.','Children','Child Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/child_profile_13_1770898778249_Child_Profile_Report_Ernest_Mae_T_Gaco.pdf',2,NULL,13,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(23,'2026-02-13 09:15:10','child_profile','Child Profile Report: Ernest Mae T. Gaco','Single child profile including health and education summary.','Children','Child Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/child_profile_13_1770945310132_Child_Profile_Report_Ernest_Mae_T_Gaco.pdf',2,NULL,13,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(24,'2026-02-13 09:16:08','donations_summary','Donations Summary Report','Overview of donation totals, trends, and purposes.','Financial','Donation Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/donations_summary_1770945368668_Donations_Summary_Report.pdf',2,NULL,NULL,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(25,'2026-02-13 09:16:25','houses_summary','Houses Summary Report','Overview of children distribution and house information.','Houses','Summary Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/houses_summary_1770945385958_Houses_Summary_Report.pdf',1,NULL,NULL,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(26,'2026-02-13 10:29:50','child_profile','Child Profile Report: Ernest Mae T. Gaco','Single child profile including health and education summary.','Children','Child Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/child_profile_13_1770949790285_Child_Profile_Report_Ernest_Mae_T_Gaco.pdf',2,NULL,13,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}'),(27,'2026-02-16 22:50:24','donations_summary','Donations Summary Report','Overview of donation totals, trends, and purposes.','Financial','Donation Reports','February 2026','Ready','PDF','http://localhost:5000/uploads/reports/donations_summary_1771253424673_Donations_Summary_Report.pdf',2,NULL,NULL,1,'Jevie P. Boniel','{\"generatedFrom\":\"live_db\"}');
/*!40000 ALTER TABLE `generated_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `health_records`
--

DROP TABLE IF EXISTS `health_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `health_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `child_id` int(11) NOT NULL,
  `record_type` varchar(100) NOT NULL,
  `provider` varchar(150) NOT NULL,
  `record_date` date NOT NULL,
  `notes` text NOT NULL,
  `next_appointment` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `child_id` (`child_id`),
  CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `health_records`
--

LOCK TABLES `health_records` WRITE;
/*!40000 ALTER TABLE `health_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `health_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestone_objectives`
--

DROP TABLE IF EXISTS `milestone_objectives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `milestone_objectives` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `milestone_id` bigint(20) NOT NULL,
  `objective` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_objectives_milestone` (`milestone_id`),
  CONSTRAINT `fk_objectives_milestone` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestone_objectives`
--

LOCK TABLES `milestone_objectives` WRITE;
/*!40000 ALTER TABLE `milestone_objectives` DISABLE KEYS */;
INSERT INTO `milestone_objectives` VALUES (94,17,'bdsjcdsvcsd'),(95,17,'dcdscscs');
/*!40000 ALTER TABLE `milestone_objectives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `milestones` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `child_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('Planned','In Progress','At Risk','Completed') NOT NULL DEFAULT 'Planned',
  `progress` int(11) NOT NULL DEFAULT 0,
  `assigned_by` varchar(120) DEFAULT NULL,
  `created_date` date DEFAULT NULL,
  `last_updated` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_milestones_child` (`child_id`),
  CONSTRAINT `fk_milestones_child` FOREIGN KEY (`child_id`) REFERENCES `children` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
INSERT INTO `milestones` VALUES (17,14,'Emotional','Level 3','need attendance','2026-02-17','bhdgfhtbfg','Completed',100,'System Admin','2026-02-18','2026-02-18','2026-02-18 01:29:30','2026-02-18 02:14:45');
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_events`
--

DROP TABLE IF EXISTS `notification_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_events`
--

LOCK TABLES `notification_events` WRITE;
/*!40000 ALTER TABLE `notification_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_settings`
--

DROP TABLE IF EXISTS `notification_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_settings`
--

LOCK TABLES `notification_settings` WRITE;
/*!40000 ALTER TABLE `notification_settings` DISABLE KEYS */;
INSERT INTO `notification_settings` VALUES (1,'System Update','System maintenance and updates',1),(2,'Health Alerts','Health check-up reminders',1),(3,'Development Milestones','Milestone progress notifications',1),(4,'Donation Alerts','New donation notifications',1),(5,'User Activity','User login and activity alerts',1),(6,'Data Backup','Backup completion notifications',1);
/*!40000 ALTER TABLE `notification_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(60) NOT NULL,
  `title` varchar(120) NOT NULL,
  `message` text DEFAULT NULL,
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymongo_webhook_events`
--

DROP TABLE IF EXISTS `paymongo_webhook_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paymongo_webhook_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` varchar(120) DEFAULT NULL,
  `event_type` varchar(80) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymongo_webhook_events`
--

LOCK TABLES `paymongo_webhook_events` WRITE;
/*!40000 ALTER TABLE `paymongo_webhook_events` DISABLE KEYS */;
INSERT INTO `paymongo_webhook_events` VALUES (1,'evt_ctSkXJ6EyRKHcNnimjG6hk7d','payment.paid','{\"data\":{\"id\":\"evt_ctSkXJ6EyRKHcNnimjG6hk7d\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_b24HkgaDWspkjvaV4C3t9BGU\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":30000,\"balance_transaction_id\":\"bal_txn_Zqn6rACgop1q5dAuHzzyDtLz\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"jevie\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Education Support\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":750,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":29250,\"origin\":\"api\",\"payment_intent_id\":\"pi_hUtYzo3PyWDMp6S2i1dRaVZn\",\"payout\":null,\"source\":{\"id\":\"src_QcSqWxcAWnzwvmXqLYPVgRVP\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770627600,\"created_at\":1770278652,\"credited_at\":1770858000,\"paid_at\":1770278652,\"updated_at\":1770278652}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770278652,\"updated_at\":1770278652}}}','2026-02-05 08:04:12'),(2,'evt_FX3tHzXvmbCdLS7AhQhv9UbE','payment.paid','{\"data\":{\"id\":\"evt_FX3tHzXvmbCdLS7AhQhv9UbE\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_iGcsyusUsgpGVrdKqztgWBAt\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":1000000,\"balance_transaction_id\":\"bal_txn_GCxoPxeJDfPmaUu7jn75fntW\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"jevie\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Healthcare\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":25000,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":975000,\"origin\":\"api\",\"payment_intent_id\":\"pi_R1jk8tbPwLemR6TtMyBgC41v\",\"payout\":null,\"source\":{\"id\":\"src_fQALiNAtcHuoQDDg1rvGHJNu\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770627600,\"created_at\":1770278764,\"credited_at\":1770858000,\"paid_at\":1770278764,\"updated_at\":1770278764}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770278764,\"updated_at\":1770278764}}}','2026-02-05 08:06:05'),(3,'evt_pcwprdB1xEduCDbere1HR4J1','payment.paid','{\"data\":{\"id\":\"evt_pcwprdB1xEduCDbere1HR4J1\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_VfUqw2HHLyPjK1Hf4NrgzwJo\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":150000,\"balance_transaction_id\":\"bal_txn_iBLwRhtc6JyR4ZcJxpsC2yve\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"Esmae\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"General Support\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":6750,\"foreign_fee\":0,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":143250,\"origin\":\"api\",\"payment_intent_id\":\"pi_m3ncCvWcUPrSqSYczYvw7hNm\",\"payout\":null,\"source\":{\"id\":\"card_2gszCpBJLaFLEHGNMBHaM81o\",\"type\":\"card\",\"brand\":\"visa\",\"country\":\"PH\",\"last4\":\"1421\"},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770714000,\"created_at\":1770280835,\"credited_at\":1770858000,\"paid_at\":1770280835,\"updated_at\":1770280835}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770280835,\"updated_at\":1770280835}}}','2026-02-05 08:40:35'),(4,'evt_t8LkWdYtRKnnwsG9KGo6UfKE','payment.paid','{\"data\":{\"id\":\"evt_t8LkWdYtRKnnwsG9KGo6UfKE\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_hY9PHNHe4g8Vojp3E1noCrqi\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":2000000,\"balance_transaction_id\":\"bal_txn_EEx6mg9EdXU6CELpLwfBaxMf\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"jevieboniel@gmail.com\",\"name\":\"Preda\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Food & Nutrition\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":71500,\"foreign_fee\":0,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":1928500,\"origin\":\"api\",\"payment_intent_id\":\"pi_HELSchpMVpZD2iXAbfuubBrR\",\"payout\":null,\"source\":{\"id\":\"card_ZC5X4qkye8K2K6Z6RrbRtxNj\",\"type\":\"card\",\"brand\":\"visa\",\"country\":\"PH\",\"last4\":\"1421\"},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770714000,\"created_at\":1770281075,\"credited_at\":1770858000,\"paid_at\":1770281075,\"updated_at\":1770281075}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770281075,\"updated_at\":1770281075}}}','2026-02-05 08:44:36'),(11,'evt_qKt3JCn5qqmifnrrDRhMoLmN','payment.paid','{\"data\":{\"id\":\"evt_qKt3JCn5qqmifnrrDRhMoLmN\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_bv2jAtMwv2i3uRatra6Dhnfz\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":2000000,\"balance_transaction_id\":\"bal_txn_XKh3eSWaAGWn58WKPJFrp7xm\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"jevieboniel@gmail.com\",\"name\":\"Preda\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Food & Nutrition\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":71500,\"foreign_fee\":0,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":1928500,\"origin\":\"api\",\"payment_intent_id\":\"pi_6v3sK7s1XXqZmHy3mue8HTUG\",\"payout\":null,\"source\":{\"id\":\"card_xFKwhJfFaf9FPYRBXEgjM3Kb\",\"type\":\"card\",\"brand\":\"visa\",\"country\":\"PH\",\"last4\":\"1421\"},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770714000,\"created_at\":1770281306,\"credited_at\":1770858000,\"paid_at\":1770281306,\"updated_at\":1770281306}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770281306,\"updated_at\":1770281306}}}','2026-02-05 08:48:26'),(13,'evt_gaTPADaG5PJoEH5bgXFYFNzv','payment.paid','{\"data\":{\"id\":\"evt_gaTPADaG5PJoEH5bgXFYFNzv\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_v1WDzy5ez3SEw7Hh8n3rqNpd\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":1500000,\"balance_transaction_id\":\"bal_txn_2oSbdtSWCpyWkf1CB5kYTyeo\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"graceboyonas29@gmail.com\",\"name\":\"Grace Boyonas\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Healthcare\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":37500,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":1462500,\"origin\":\"api\",\"payment_intent_id\":\"pi_V9NYfNudhnogt9JoUENxBcJz\",\"payout\":null,\"source\":{\"id\":\"src_YJDobtdTsi1yW8WYXhUjeNGb\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770627600,\"created_at\":1770281905,\"credited_at\":1770858000,\"paid_at\":1770281905,\"updated_at\":1770281905}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770281905,\"updated_at\":1770281905}}}','2026-02-05 08:58:25'),(14,'evt_9tuGgMmAy4iarAh8tjA63kKU','payment.paid','{\"data\":{\"id\":\"evt_9tuGgMmAy4iarAh8tjA63kKU\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_kGVydWCQFXtQskExNJ4XyTJm\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":1000000,\"balance_transaction_id\":\"bal_txn_f9PDnzcuRBZ6TfyZ3jru1c3t\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"for preda\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Education Support\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":25000,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":975000,\"origin\":\"api\",\"payment_intent_id\":\"pi_tSD7tcGVTXVuX4TEX1iCxmMX\",\"payout\":null,\"source\":{\"id\":\"src_CtAm7hPCqtrnfL9khoDd44CB\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770800400,\"created_at\":1770382162,\"credited_at\":1770858000,\"paid_at\":1770382162,\"updated_at\":1770382162}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770382162,\"updated_at\":1770382162}}}','2026-02-06 12:49:22'),(15,'evt_ippfw5HJYuZdutmwRa57H7sB','payment.paid','{\"data\":{\"id\":\"evt_ippfw5HJYuZdutmwRa57H7sB\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_7P2bJM85DBzJesKvNCRXtrWL\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":1000000,\"balance_transaction_id\":\"bal_txn_XPgDgTcGspKAbNXkNPTs5eHU\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"For Preda\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Healthcare\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":25000,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":975000,\"origin\":\"api\",\"payment_intent_id\":\"pi_XgiEMYziYGJoCEdc2v7eryuC\",\"payout\":null,\"source\":{\"id\":\"src_HS254aHeQxgF7QsbocK57P5w\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770800400,\"created_at\":1770382025,\"credited_at\":1770858000,\"paid_at\":1770382025,\"updated_at\":1770382025}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770382025,\"updated_at\":1770382025}}}','2026-02-06 12:49:44'),(16,'evt_SXBPbFpYhYTUJa1so18hbunt','payment.paid','{\"data\":{\"id\":\"evt_SXBPbFpYhYTUJa1so18hbunt\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_8G8LHccmYBb2giSog3b1RdFD\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":500000,\"balance_transaction_id\":\"bal_txn_RDcRwpT7aYhG5sZkXGNwscH5\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"gacoernestmae@gmail.com\",\"name\":\"esme\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"General Support\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":12500,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":487500,\"origin\":\"api\",\"payment_intent_id\":\"pi_PLNo5G1xF6KogFPPdqdJSxN9\",\"payout\":null,\"source\":{\"id\":\"src_VyYp23xU75v3HyHkvW8vcNXA\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770800400,\"created_at\":1770456525,\"credited_at\":1770858000,\"paid_at\":1770456525,\"updated_at\":1770456525}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770456525,\"updated_at\":1770456525}}}','2026-02-07 09:28:45'),(17,'evt_LSpx6RtcQHaUFhWMHjcQxpCZ','payment.paid','{\"data\":{\"id\":\"evt_LSpx6RtcQHaUFhWMHjcQxpCZ\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_zxahipW3oVcWufes6TAag9ks\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":550000,\"balance_transaction_id\":\"bal_txn_NUJLR1RUFVrdaRwxaXZXE3oB\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"Darling\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Food & Nutrition\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":20750,\"foreign_fee\":0,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":529250,\"origin\":\"api\",\"payment_intent_id\":\"pi_XJt7MaKBPF6iG6iJjM4qkaev\",\"payout\":null,\"source\":{\"id\":\"card_1RLXaBWWAucju8EYeeMymzQ2\",\"type\":\"card\",\"brand\":\"visa\",\"country\":\"PH\",\"last4\":\"1421\"},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1770886800,\"created_at\":1770536724,\"credited_at\":1771462800,\"paid_at\":1770536724,\"updated_at\":1770536724}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1770536724,\"updated_at\":1770536724}}}','2026-02-08 07:45:25'),(18,'evt_MKu895wR5hddVxWdXbRQWoLK','payment.paid','{\"data\":{\"id\":\"evt_MKu895wR5hddVxWdXbRQWoLK\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_zRUyFqBQF1dyQKyw5n85Kxxy\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":500000,\"balance_transaction_id\":\"bal_txn_PuqsXc9YyXM2afSLB6Wg1Ycg\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"jevie\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"Infrastructure\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":12500,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":487500,\"origin\":\"api\",\"payment_intent_id\":\"pi_r6jWSkgnvnmXEACMcdQpX6iZ\",\"payout\":null,\"source\":{\"id\":\"src_ZpuovPKTcM8qEernqBbranRT\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1771491600,\"created_at\":1771253214,\"credited_at\":1772067600,\"paid_at\":1771253214,\"updated_at\":1771253214}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1771253214,\"updated_at\":1771253214}}}','2026-02-16 14:46:54'),(19,'evt_DCe5kyYG5CCDnKbkr3D6tqmT','payment.paid','{\"data\":{\"id\":\"evt_DCe5kyYG5CCDnKbkr3D6tqmT\",\"type\":\"event\",\"attributes\":{\"type\":\"payment.paid\",\"livemode\":false,\"data\":{\"id\":\"pay_sGXxmgNrNPDZDFNVGgHGVXw7\",\"type\":\"payment\",\"attributes\":{\"access_url\":null,\"amount\":500000,\"balance_transaction_id\":\"bal_txn_bX5YZzCprSbqhYH6qGr1eTKf\",\"billing\":{\"address\":{\"city\":null,\"country\":null,\"line1\":null,\"line2\":null,\"postal_code\":null,\"state\":null},\"email\":\"anonymous@example.com\",\"name\":\"lloyd\",\"phone\":null},\"currency\":\"PHP\",\"description\":\"General Support\",\"digital_withholding_vat_amount\":0,\"disputed\":false,\"external_reference_number\":null,\"fee\":12500,\"instant_settlement\":null,\"livemode\":false,\"net_amount\":487500,\"origin\":\"api\",\"payment_intent_id\":\"pi_B4wBXwCQP4ukYVWsDSiAHDbf\",\"payout\":null,\"source\":{\"id\":\"src_8KHfSri5Ahm5fEyLi1qS4o4Y\",\"type\":\"gcash\",\"provider\":{\"id\":null},\"provider_id\":null},\"statement_descriptor\":\"PACQUIAO BONIEL\",\"status\":\"paid\",\"tax_amount\":null,\"metadata\":null,\"promotion\":null,\"refunds\":[],\"taxes\":[],\"available_at\":1771578000,\"created_at\":1771380712,\"credited_at\":1772067600,\"paid_at\":1771380712,\"updated_at\":1771380712}},\"previous_data\":{},\"pending_webhooks\":1,\"created_at\":1771380712,\"updated_at\":1771380712}}}','2026-02-18 02:11:52');
/*!40000 ALTER TABLE `paymongo_webhook_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reports` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `report_key` varchar(120) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(60) NOT NULL,
  `subcategory` varchar(80) NOT NULL,
  `period` varchar(40) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Ready',
  `file_size` varchar(30) DEFAULT NULL,
  `pages` int(11) NOT NULL DEFAULT 0,
  `format` varchar(10) NOT NULL DEFAULT 'PDF',
  `file_path` varchar(255) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reports_category` (`category`),
  KEY `idx_reports_title` (`title`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `website` varchar(255) DEFAULT NULL,
  `timezone` varchar(100) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `language` varchar(50) NOT NULL,
  `dark_mode` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `password_min_length` int(11) NOT NULL DEFAULT 8,
  `password_expiry_days` int(11) NOT NULL DEFAULT 90,
  `require_uppercase` tinyint(1) NOT NULL DEFAULT 1,
  `require_lowercase` tinyint(1) NOT NULL DEFAULT 1,
  `require_numbers` tinyint(1) NOT NULL DEFAULT 1,
  `require_special` tinyint(1) NOT NULL DEFAULT 0,
  `failed_login_limit` int(11) NOT NULL DEFAULT 5,
  `lockout_minutes` int(11) NOT NULL DEFAULT 15,
  `system_version` varchar(30) DEFAULT NULL,
  `last_update` date DEFAULT NULL,
  `uptime_percent` varchar(20) DEFAULT NULL,
  `storage_used_gb` decimal(10,2) DEFAULT NULL,
  `storage_total_gb` decimal(10,2) DEFAULT NULL,
  `last_backup` datetime DEFAULT NULL,
  `backup_status` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'Village of Hope Orphanage','Maranatha ','+639552334343','admin@villageofhope.org','www.villageofhope.org','Africa/Nairobi','KES','English',0,'2026-02-18 00:36:56',8,90,1,1,1,0,5,15,NULL,NULL,NULL,NULL,NULL,'2026-02-13 10:10:15','Completed');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `status` enum('Active','Inactive','Suspended') NOT NULL DEFAULT 'Active',
  `phone` varchar(30) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `permissions` text DEFAULT NULL,
  `failed_login_attempts` int(11) NOT NULL DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Hope Garden PH','hopegardenvoh@gmail.com','$2b$10$wc2EEo18xAZTvyDQmj.gs.K3aTaKULRccIlMZZCpRb3UxrLeR3Bge','Admin','Active','09275813394','http://localhost:5000/uploads/avatar_1770186472533_8042a88591524.jpg','2026-01-26 12:03:32','2026-02-18 10:09:59','[\"Full Access\"]',0,NULL,'2026-02-16 22:21:34'),(5,'Erl Princes V. Llorente','erlprincesllorente110103@gmail.com','$2b$10$lLAY6/m/1L807wRsPtanteov3mNj/RvGdEa5DtgP1wCjXy62MR86C','House Parent','Active','09505330834','http://localhost:5000/uploads/avatar_1770195041909_d67a01782ec61.jpg','2026-02-04 08:05:24',NULL,'[\"Child Management\",\"Donations\",\"User Management\",\"Development Tracking\"]',0,NULL,NULL),(6,'Grasya O. Boyonas','graceboyonas29@gmail.com','$2b$10$5ZkMu8QUSDcXL.QTGhTCXuoKzSFefDwY1CStwhDwBfAOrz2l6JPr2','Social Worker','Active','0910267145','http://localhost:5000/uploads/avatar_1770195034924_24e60dc9e67b8.jpg','2026-02-04 08:06:22','2026-02-04 16:06:48','[\"Reports\",\"Donations\",\"Child Management\",\"Development Tracking\"]',5,'2026-02-13 10:59:46',NULL),(9,'Ernest Mae T. Gaco','gacoernestmae@gmail.com','$2b$10$V9mNWJorH.JRjZuEm7H5.ebwFI3ANylgHcwjy7280jQJ.dnrrZrU.','House Parent','Active','09123692905','/uploads/avatar_1771245237331_139fd76a1b5a1.jpg','2026-02-16 12:33:57','2026-02-18 10:16:22','[\"Child Management\",\"Donations\",\"Development Tracking\"]',0,NULL,'2026-02-16 20:33:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'voh_db'
--

--
-- Dumping routines for database 'voh_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-18 10:17:13
