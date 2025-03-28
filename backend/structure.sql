SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `assignment` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `senderType` enum('DIRECT','BROKER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailAddress` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` bigint(30) NOT NULL,
  `slackChannel` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slackId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignmentComment` (
  `assignment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `id` int(11) NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` bigint(30) NOT NULL,
  `slackId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `assignment`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `assignmentComment`
  ADD PRIMARY KEY (`assignment`,`id`);


ALTER TABLE `assignmentComment`
  ADD CONSTRAINT `assignmentComment_ibfk_1` FOREIGN KEY (`assignment`) REFERENCES `assignment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `assignment` ADD COLUMN `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL;

