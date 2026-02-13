-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 02, 2026 at 12:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ehr-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `act_of_daily_living`
--

CREATE TABLE `act_of_daily_living` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `mobility_alert` varchar(255) DEFAULT NULL,
  `hygiene_alert` varchar(255) DEFAULT NULL,
  `toileting_alert` varchar(255) DEFAULT NULL,
  `feeding_alert` varchar(255) DEFAULT NULL,
  `hydration_alert` varchar(255) DEFAULT NULL,
  `sleep_pattern_alert` varchar(255) DEFAULT NULL,
  `pain_level_alert` varchar(255) DEFAULT NULL,
  `day_no` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `mobility_assessment` varchar(255) DEFAULT NULL,
  `hygiene_assessment` varchar(255) DEFAULT NULL,
  `toileting_assessment` varchar(255) DEFAULT NULL,
  `feeding_assessment` varchar(255) DEFAULT NULL,
  `hydration_assessment` varchar(255) DEFAULT NULL,
  `sleep_pattern_assessment` varchar(255) DEFAULT NULL,
  `pain_level_assessment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `act_of_daily_living`
--

INSERT INTO `act_of_daily_living` (`id`, `patient_id`, `mobility_alert`, `hygiene_alert`, `toileting_alert`, `feeding_alert`, `hydration_alert`, `sleep_pattern_alert`, `pain_level_alert`, `day_no`, `date`, `mobility_assessment`, `hygiene_assessment`, `toileting_assessment`, `feeding_assessment`, `hydration_assessment`, `sleep_pattern_assessment`, `pain_level_assessment`, `created_at`, `updated_at`) VALUES
(1, 12, 'Orthostatic symptoms on standing. Assess vitals and assist with slow changes in position.', 'Exudate observed on dressing. Notify wound care and document amount/type.', 'Urinary incontinence increasing skin risk. Implement timed toileting and moisture management.', NULL, NULL, NULL, NULL, 15233, '2025-12-03', 'incision pain stabilize numbness', 'needs help skin breakdown', 'hangs on caregiver toilet', NULL, NULL, NULL, NULL, '2025-12-03 12:44:22', '2025-12-03 12:44:22'),
(2, 7, 'Orthostatic symptoms on standing. Assess vitals and assist with slow changes in position.', 'Exudate observed on dressing. Notify wound care and document amount/type.', NULL, NULL, NULL, NULL, NULL, 9994, '2025-12-03', 'incision pain stabilize numbness', 'needs help skin breakdown', NULL, NULL, NULL, NULL, NULL, '2025-12-03 13:28:41', '2025-12-03 13:28:41');

-- --------------------------------------------------------

--
-- Table structure for table `allergies`
--

CREATE TABLE `allergies` (
  `medical_id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `condition_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `medication` text DEFAULT NULL,
  `dosage` text DEFAULT NULL,
  `side_effect` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `user_role` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `user_role`, `action`, `details`, `created_at`, `updated_at`) VALUES
(1, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2025-12-03 10:48:30', '2025-12-03 10:48:30'),
(2, 3, 'nurse', 'Nurse', 'Physical Exam Created', '\"{\\\"details\\\":\\\"User nurse created a new Physical Exam record.\\\",\\\"patient_id\\\":\\\"20\\\"}\"', '2025-12-03 11:13:06', '2025-12-03 11:13:06'),
(3, 3, 'nurse', 'Nurse', 'Intake-and-Output Record Created', '\"{\\\"details\\\":\\\"User nurse created a new IO record.\\\",\\\"patient_id\\\":\\\"7\\\"}\"', '2025-12-03 11:15:58', '2025-12-03 11:15:58'),
(4, 3, 'nurse', 'Nurse', 'Vital Signs Record Created', '\"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"12\\\"}\"', '2025-12-03 11:18:47', '2025-12-03 11:18:47'),
(5, 3, 'nurse', 'Nurse', 'Vital Signs Record Updated', '\"{\\\"details\\\":\\\"User nurse updated a Vital Signs record\\\",\\\"patient_id\\\":\\\"12\\\"}\"', '2025-12-03 12:00:01', '2025-12-03 12:00:01'),
(6, 3, 'nurse', 'Nurse', 'Vital Signs Record Created', '\"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"16\\\"}\"', '2025-12-03 12:00:23', '2025-12-03 12:00:23'),
(7, 3, 'nurse', 'Nurse', 'Intake-and-Output Record Created', '\"{\\\"details\\\":\\\"User nurse created a new IO record.\\\",\\\"patient_id\\\":\\\"12\\\"}\"', '2025-12-03 12:05:10', '2025-12-03 12:05:10'),
(8, 3, 'nurse', 'Nurse', 'Intake-and-Output Record Updated', '\"{\\\"details\\\":\\\"User nurse updated an existing IO record.\\\",\\\"patient_id\\\":\\\"12\\\"}\"', '2025-12-03 12:07:06', '2025-12-03 12:07:06'),
(9, 3, 'nurse', 'Nurse', 'Vital Signs Record Created', '\"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"18\\\"}\"', '2025-12-03 12:10:42', '2025-12-03 12:10:42'),
(10, 3, 'nurse', 'Nurse', 'ADL Record Created', '\"{\\\"details\\\":\\\"User nurse created a new ADL record.\\\",\\\"patient_id\\\":\\\"12\\\"}\"', '2025-12-03 12:44:22', '2025-12-03 12:44:22'),
(11, 3, 'nurse', 'Nurse', 'ADL Record Created', '\"{\\\"details\\\":\\\"User nurse created a new ADL record.\\\",\\\"patient_id\\\":\\\"7\\\"}\"', '2025-12-03 13:28:41', '2025-12-03 13:28:41'),
(12, 3, 'nurse', 'Nurse', 'Lab Values Created', '\"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"12\\\"}\"', '2025-12-03 13:38:22', '2025-12-03 13:38:22'),
(13, 3, 'nurse', 'Nurse', 'Lab Values Created', '\"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"7\\\"}\"', '2025-12-03 14:33:32', '2025-12-03 14:33:32'),
(14, 3, 'nurse', 'Nurse', 'Lab Values Updated', '\"{\\\"details\\\":\\\"User nurse updated an existing Lab Values record.\\\",\\\"patient_id\\\":\\\"7\\\"}\"', '2025-12-03 14:50:13', '2025-12-03 14:50:13'),
(15, 3, 'nurse', 'Nurse', 'Lab Values Created', '\"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"13\\\"}\"', '2025-12-03 15:05:26', '2025-12-03 15:05:26'),
(16, 3, 'nurse', 'Nurse', 'Intake-and-Output Record Created', '\"{\\\"details\\\":\\\"User nurse created a new IO record.\\\",\\\"patient_id\\\":\\\"20\\\"}\"', '2025-12-03 17:01:38', '2025-12-03 17:01:38'),
(17, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2025-12-05 00:06:07', '2025-12-05 00:06:07'),
(18, 3, 'nurse', 'Nurse', 'Lab Values Created', '\"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"10\\\"}\"', '2025-12-05 00:07:32', '2025-12-05 00:07:32'),
(19, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-22 00:16:23', '2026-01-22 00:16:23'),
(20, 3, 'nurse', 'Nurse', 'Vital Signs Record Created', '\"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"20\\\"}\"', '2026-01-22 00:17:32', '2026-01-22 00:17:32'),
(21, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-27 23:25:01', '2026-01-27 23:25:01'),
(22, 3, 'nurse', 'Nurse', 'Patient Created', '\"{\\\"details\\\":\\\"User nurse created a new patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-27 23:41:10', '2026-01-27 23:41:10'),
(23, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-27 23:45:02', '2026-01-27 23:45:02'),
(24, 3, 'nurse', 'Nurse', 'Patient Created', '\"{\\\"details\\\":\\\"User nurse created a new patient record.\\\",\\\"patient_id\\\":22}\"', '2026-01-27 23:47:11', '2026-01-27 23:47:11'),
(25, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":20}\"', '2026-01-27 23:56:39', '2026-01-27 23:56:39'),
(26, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":20}\"', '2026-01-27 23:57:06', '2026-01-27 23:57:06'),
(27, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-28 03:06:26', '2026-01-28 03:06:26'),
(28, 3, 'nurse', 'Nurse', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-01-28 03:07:15', '2026-01-28 03:07:15'),
(29, 2, 'doctor', 'Doctor', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\"', '2026-01-28 03:07:22', '2026-01-28 03:07:22'),
(30, 2, 'doctor', 'Doctor', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-01-28 03:08:04', '2026-01-28 03:08:04'),
(31, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-28 03:08:11', '2026-01-28 03:08:11'),
(32, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-28 03:14:04', '2026-01-28 03:14:04'),
(33, 3, 'nurse', 'Nurse', 'Patient Viewed', '\"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-28 03:14:13', '2026-01-28 03:14:13'),
(34, 3, 'nurse', 'Nurse', 'Patient Viewed', '\"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-28 03:14:45', '2026-01-28 03:14:45'),
(35, 3, 'nurse', 'Nurse', 'Patient Viewed', '\"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-28 03:14:53', '2026-01-28 03:14:53'),
(36, 3, 'nurse', 'Nurse', 'Patient Viewed', '\"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-28 03:15:04', '2026-01-28 03:15:04'),
(37, 3, 'nurse', 'Nurse', 'Patient Viewed', '\"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\"', '2026-01-28 03:15:18', '2026-01-28 03:15:18'),
(38, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-28 14:59:30', '2026-01-28 14:59:30'),
(39, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-29 06:28:01', '2026-01-29 06:28:01'),
(40, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":2}\"', '2026-01-29 07:11:22', '2026-01-29 07:11:22'),
(41, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-29 10:18:51', '2026-01-29 10:18:51'),
(42, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":2}\"', '2026-01-29 10:19:11', '2026-01-29 10:19:11'),
(43, 3, 'nurse', 'Nurse', 'Patient Updated', '\"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":16}\"', '2026-01-29 10:19:27', '2026-01-29 10:19:27'),
(44, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-29 13:49:21', '2026-01-29 13:49:21'),
(45, 3, 'nurse', 'Nurse', 'Physical Exam Updated', '\"{\\\"details\\\":\\\"User nurse updated an existing Physical Exam record.\\\",\\\"patient_id\\\":\\\"20\\\"}\"', '2026-01-29 13:55:51', '2026-01-29 13:55:51'),
(46, 3, 'nurse', 'Nurse', 'Physical Exam Updated', '\"{\\\"details\\\":\\\"User nurse updated an existing Physical Exam record.\\\",\\\"patient_id\\\":\\\"20\\\"}\"', '2026-01-29 14:05:29', '2026-01-29 14:05:29'),
(47, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-01-31 00:30:35', '2026-01-31 00:30:35'),
(48, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-02-01 07:55:27', '2026-02-01 07:55:27'),
(49, 3, 'nurse', 'Nurse', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-01 07:59:08', '2026-02-01 07:59:08'),
(50, 2, 'doctor', 'Doctor', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\"', '2026-02-01 07:59:17', '2026-02-01 07:59:17'),
(51, 2, 'doctor', 'Doctor', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-01 08:00:27', '2026-02-01 08:00:27'),
(52, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-02-01 08:02:51', '2026-02-01 08:02:51'),
(53, 3, 'nurse', 'Nurse', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-01 08:03:06', '2026-02-01 08:03:06'),
(54, 2, 'doctor', 'Doctor', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\"', '2026-02-01 08:03:17', '2026-02-01 08:03:17'),
(55, 2, 'doctor', 'Doctor', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-01 08:06:04', '2026-02-01 08:06:04'),
(56, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-02-01 08:06:11', '2026-02-01 08:06:11'),
(57, 3, 'nurse', 'Nurse', 'Physical Exam Created', '\"{\\\"details\\\":\\\"User nurse created a new Physical Exam record.\\\",\\\"patient_id\\\":\\\"18\\\"}\"', '2026-02-01 08:11:19', '2026-02-01 08:11:19'),
(58, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-02-02 00:16:28', '2026-02-02 00:16:28'),
(59, 3, 'nurse', 'Nurse', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-02 00:19:29', '2026-02-02 00:19:29'),
(60, 2, 'doctor', 'Doctor', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\"', '2026-02-02 00:19:37', '2026-02-02 00:19:37'),
(61, 2, 'doctor', 'Doctor', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-02 00:19:57', '2026-02-02 00:19:57'),
(62, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-02-02 00:20:55', '2026-02-02 00:20:55'),
(63, 3, 'nurse', 'Nurse', 'Physical Exam Created', '\"{\\\"details\\\":\\\"User nurse created a new Physical Exam record.\\\",\\\"patient_id\\\":\\\"13\\\"}\"', '2026-02-02 00:23:47', '2026-02-02 00:23:47'),
(64, 3, 'nurse', 'Nurse', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-02 00:29:45', '2026-02-02 00:29:45'),
(65, 1, 'admin', 'Admin', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Admin\\\"}\"', '2026-02-02 00:29:52', '2026-02-02 00:29:52'),
(66, 1, 'admin', 'Admin', 'Logout', '\"{\\\"details\\\":\\\"User logged out of the system.\\\"}\"', '2026-02-02 00:30:06', '2026-02-02 00:30:06'),
(67, 3, 'nurse', 'Nurse', 'Login Successful', '\"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\"', '2026-02-02 00:35:08', '2026-02-02 00:35:08');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `changes_in_medication`
--

CREATE TABLE `changes_in_medication` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `change_med` varchar(255) DEFAULT NULL,
  `change_dose` varchar(255) DEFAULT NULL,
  `change_route` varchar(255) DEFAULT NULL,
  `change_frequency` varchar(255) DEFAULT NULL,
  `change_text` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `current_medication`
--

CREATE TABLE `current_medication` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `date` date DEFAULT NULL,
  `current_med` varchar(255) DEFAULT NULL,
  `current_dose` varchar(255) DEFAULT NULL,
  `current_route` varchar(255) DEFAULT NULL,
  `current_frequency` varchar(255) DEFAULT NULL,
  `current_indication` varchar(255) DEFAULT NULL,
  `current_text` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `developmental_history`
--

CREATE TABLE `developmental_history` (
  `development_id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `gross_motor` text DEFAULT NULL,
  `fine_motor` text DEFAULT NULL,
  `language` text DEFAULT NULL,
  `cognitive` text DEFAULT NULL,
  `social` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diagnostics`
--

CREATE TABLE `diagnostics` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diagnostics`
--

INSERT INTO `diagnostics` (`id`, `patient_id`, `type`, `path`, `original_name`, `created_at`, `updated_at`) VALUES
(1, 20, 'xray', 'diagnostics/1769932552_Gemini_Generated_Image_vahmo8vahmo8vahm.png', 'Gemini_Generated_Image_vahmo8vahmo8vahm.png', '2026-02-01 07:55:53', '2026-02-01 07:55:53'),
(2, 18, 'xray', 'diagnostics/1769991563_Gemini_Generated_Image_vahmo8vahmo8vahm.png', 'Gemini_Generated_Image_vahmo8vahmo8vahm.png', '2026-02-02 00:19:24', '2026-02-02 00:19:24');

-- --------------------------------------------------------

--
-- Table structure for table `diagnostic_images`
--

CREATE TABLE `diagnostic_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `image_type` enum('xray','ultrasound','ct_scan_mri','echocardiogram') NOT NULL,
  `storage/app/public/diagnostic_images` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discharge_planning`
--

CREATE TABLE `discharge_planning` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `criteria_feverRes` varchar(255) DEFAULT NULL,
  `criteria_patientCount` varchar(255) DEFAULT NULL,
  `criteria_manageFever` varchar(255) DEFAULT NULL,
  `criteria_manageFever2` varchar(255) DEFAULT NULL,
  `instruction_med` varchar(255) DEFAULT NULL,
  `instruction_appointment` varchar(255) DEFAULT NULL,
  `instruction_fluidIntake` varchar(255) DEFAULT NULL,
  `instruction_exposure` varchar(255) DEFAULT NULL,
  `instruction_complications` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `home_medication`
--

CREATE TABLE `home_medication` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `home_med` varchar(255) DEFAULT NULL,
  `home_dose` varchar(255) DEFAULT NULL,
  `home_route` varchar(255) DEFAULT NULL,
  `home_frequency` varchar(255) DEFAULT NULL,
  `home_indication` varchar(255) DEFAULT NULL,
  `home_text` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `intake_and_outputs`
--

CREATE TABLE `intake_and_outputs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `day_no` int(11) DEFAULT NULL,
  `oral_intake` int(11) DEFAULT NULL,
  `iv_fluids_volume` int(11) DEFAULT NULL,
  `iv_fluids_type` varchar(255) DEFAULT NULL,
  `urine_output` int(11) DEFAULT NULL,
  `alert` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `intake_and_outputs`
--

INSERT INTO `intake_and_outputs` (`id`, `patient_id`, `day_no`, `oral_intake`, `iv_fluids_volume`, `iv_fluids_type`, `urine_output`, `alert`, `created_at`, `updated_at`) VALUES
(1, 7, 1, 1000, 500, NULL, 2500, 'WARNING: Negative fluid balance > 500ml. Monitor hydration status.', '2025-12-03 11:15:58', '2025-12-03 11:15:58'),
(2, 12, 1, 2000, 1500, NULL, 1000, 'CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory distress.', '2025-12-03 12:05:10', '2025-12-03 12:07:06'),
(3, 20, 1, 500, 1500, NULL, 200, 'CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory distress.', '2025-12-03 17:01:38', '2025-12-03 17:01:38');

-- --------------------------------------------------------

--
-- Table structure for table `ivs_and_lines`
--

CREATE TABLE `ivs_and_lines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `iv_fluid` varchar(255) DEFAULT NULL,
  `rate` varchar(255) DEFAULT NULL,
  `site` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lab_values`
--

CREATE TABLE `lab_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `wbc_result` varchar(255) DEFAULT NULL,
  `wbc_normal_range` varchar(255) DEFAULT NULL,
  `rbc_result` varchar(255) DEFAULT NULL,
  `rbc_normal_range` varchar(255) DEFAULT NULL,
  `hgb_result` varchar(255) DEFAULT NULL,
  `hgb_normal_range` varchar(255) DEFAULT NULL,
  `hct_result` varchar(255) DEFAULT NULL,
  `hct_normal_range` varchar(255) DEFAULT NULL,
  `platelets_result` varchar(255) DEFAULT NULL,
  `platelets_normal_range` varchar(255) DEFAULT NULL,
  `mcv_result` varchar(255) DEFAULT NULL,
  `mcv_normal_range` varchar(255) DEFAULT NULL,
  `mch_result` varchar(255) DEFAULT NULL,
  `mch_normal_range` varchar(255) DEFAULT NULL,
  `mchc_result` varchar(255) DEFAULT NULL,
  `mchc_normal_range` varchar(255) DEFAULT NULL,
  `rdw_result` varchar(255) DEFAULT NULL,
  `rdw_normal_range` varchar(255) DEFAULT NULL,
  `neutrophils_result` varchar(255) DEFAULT NULL,
  `neutrophils_normal_range` varchar(255) DEFAULT NULL,
  `lymphocytes_result` varchar(255) DEFAULT NULL,
  `lymphocytes_normal_range` varchar(255) DEFAULT NULL,
  `monocytes_result` varchar(255) DEFAULT NULL,
  `monocytes_normal_range` varchar(255) DEFAULT NULL,
  `eosinophils_result` varchar(255) DEFAULT NULL,
  `eosinophils_normal_range` varchar(255) DEFAULT NULL,
  `basophils_result` varchar(255) DEFAULT NULL,
  `basophils_normal_range` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `wbc_alert` varchar(255) DEFAULT NULL,
  `rbc_alert` varchar(255) DEFAULT NULL,
  `hgb_alert` varchar(255) DEFAULT NULL,
  `hct_alert` varchar(255) DEFAULT NULL,
  `platelets_alert` varchar(255) DEFAULT NULL,
  `mcv_alert` varchar(255) DEFAULT NULL,
  `mch_alert` varchar(255) DEFAULT NULL,
  `mchc_alert` varchar(255) DEFAULT NULL,
  `rdw_alert` varchar(255) DEFAULT NULL,
  `neutrophils_alert` varchar(255) DEFAULT NULL,
  `lymphocytes_alert` varchar(255) DEFAULT NULL,
  `monocytes_alert` varchar(255) DEFAULT NULL,
  `eosinophils_alert` varchar(255) DEFAULT NULL,
  `basophils_alert` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_values`
--

INSERT INTO `lab_values` (`id`, `patient_id`, `wbc_result`, `wbc_normal_range`, `rbc_result`, `rbc_normal_range`, `hgb_result`, `hgb_normal_range`, `hct_result`, `hct_normal_range`, `platelets_result`, `platelets_normal_range`, `mcv_result`, `mcv_normal_range`, `mch_result`, `mch_normal_range`, `mchc_result`, `mchc_normal_range`, `rdw_result`, `rdw_normal_range`, `neutrophils_result`, `neutrophils_normal_range`, `lymphocytes_result`, `lymphocytes_normal_range`, `monocytes_result`, `monocytes_normal_range`, `eosinophils_result`, `eosinophils_normal_range`, `basophils_result`, `basophils_normal_range`, `created_at`, `updated_at`, `wbc_alert`, `rbc_alert`, `hgb_alert`, `hct_alert`, `platelets_alert`, `mcv_alert`, `mch_alert`, `mchc_alert`, `rdw_alert`, `neutrophils_alert`, `lymphocytes_alert`, `monocytes_alert`, `eosinophils_alert`, `basophils_alert`) VALUES
(1, 12, '8', '10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 13:38:22', '2025-12-03 13:38:22', 'No findings.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 7, '10', '10', '20', '20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 14:33:32', '2025-12-03 14:50:13', 'Normal WBC.', 'Erythrocytosis.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 13, '10', '10', '20', '20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:05:26', '2025-12-03 15:05:26', 'No findings.', 'No findings.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 10, '8', '10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-05 00:07:32', '2025-12-05 00:07:32', 'No findings.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `medical_administrations`
--

CREATE TABLE `medical_administrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `medication` varchar(255) DEFAULT NULL,
  `dose` varchar(255) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `frequency` varchar(255) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `time` time NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_09_10_164127_create_patients_table', 1),
(5, '2025_09_13_111543_create_sessions_table', 1),
(6, '2025_09_15_045355_medical_history_table', 1),
(7, '2025_09_15_144700_rename_name_to_username_in_users_table', 1),
(8, '2025_09_16_100427_create_physical_exams_table', 1),
(9, '2025_09_20_062524_ivs_and_lines', 1),
(10, '2025_09_20_125103_medication_reconciliation', 1),
(11, '2025_09_21_005901_create_act_of_daily_living_table', 1),
(12, '2025_09_21_161059_vital_signs', 1),
(13, '2025_09_21_211721_discharge_planning', 1),
(14, '2025_09_22_000000_create_intake_and_outputs_table', 1),
(15, '2025_09_22_000000_create_intake_and_outputs_table copy', 1),
(16, '2025_09_22_000137_create_lab_values_table', 1),
(17, '2025_09_22_232719_create_audit_logs_table', 1),
(18, '2025_09_23_052739_create_nursing_diagnoses_table', 1),
(19, '2025_10_23_002639_diagnostic_image', 1),
(20, '2025_10_28_220155_diagnostics', 1),
(21, '2025_11_03_023246_add_soft_deletes_to_patients_table', 1),
(22, '2025_11_06_000000_create_medical_administrations_table', 1),
(23, '2025_11_07_212931_rename_io_cdssalerts', 1),
(24, '2025_11_07_214342_add_alerts_to_act_of_daily_living_table', 1),
(28, '2025_11_08_174006_add_alerts_to_nursing_diagnoses_table', 1),
(32, '2025_11_09_085039_add_rule_file_path_to_nursing_diagnoses_table', 1),
(33, '2025_11_09_114956_add_patient_id_in_nursing_diag', 1),
(34, '2025_11_09_121404_make_adpie_fields_nullable_in_nursing_diagnoses_table', 1),
(35, '2025_11_09_121824_add_intake_and_output_id_to_nursing_diagnoses_table', 1),
(36, '2025_11_09_181153_add_vitals_id_to_nursing_diagnoses_table', 1),
(37, '2025_12_03_190821_add_adl_and_lab_values_to_nursing_diagnoses_table', 2),
(38, '2025_11_07_214845_add_alerts_to_act_of_daily_living_table', 3),
(39, '2025_11_07_215315_add_alert_columns_and_remove_alerts_column_from_lab_values_table', 3),
(40, '2025_11_08_005709_remove_date_from_intake_and_outputs_table', 3),
(41, '2025_11_08_190724_add_date_to_medical_reconciliations_table', 3),
(42, '2025_11_08_214745_change_alerts_to_text_in_vital_signs_table', 3),
(43, '2025_11_09_015410_add_contact_and_room_details_to_patients_table', 3),
(44, '2025_12_04_000000_add_alerts_to_act_of_daily_living_table_fix', 3);

-- --------------------------------------------------------

--
-- Table structure for table `nursing_diagnoses`
--

CREATE TABLE `nursing_diagnoses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` varchar(255) DEFAULT NULL,
  `physical_exam_id` bigint(20) UNSIGNED DEFAULT NULL,
  `intake_and_output_id` bigint(20) UNSIGNED DEFAULT NULL,
  `diagnosis` text NOT NULL,
  `diagnosis_alert` text DEFAULT NULL,
  `planning` text DEFAULT NULL,
  `planning_alert` text DEFAULT NULL,
  `intervention` text DEFAULT NULL,
  `intervention_alert` text DEFAULT NULL,
  `evaluation` text DEFAULT NULL,
  `evaluation_alert` text DEFAULT NULL,
  `rule_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `vital_signs_id` bigint(20) UNSIGNED DEFAULT NULL,
  `adl_id` bigint(20) UNSIGNED DEFAULT NULL,
  `lab_values_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nursing_diagnoses`
--

INSERT INTO `nursing_diagnoses` (`id`, `patient_id`, `physical_exam_id`, `intake_and_output_id`, `diagnosis`, `diagnosis_alert`, `planning`, `planning_alert`, `intervention`, `intervention_alert`, `evaluation`, `evaluation_alert`, `rule_file_path`, `created_at`, `updated_at`, `vital_signs_id`, `adl_id`, `lab_values_id`) VALUES
(1, '20', 1, NULL, 'pain', '— Recommend pain assessment (e.g., PQRST, 0-10 scale).\n', 'smart', '— Ensure goals are Specific, Measurable, Achievable, Relevant, and Time-bound.\n', 'educate', '— Include &#039;teach-back&#039; method to confirm understanding.\n', 'partially met', '— Plan needs modification. Specify which parts were met and revise the plan for the parts that were not.\n— Excellent. Document the specific data that supports this (e.g., &#039;Goal met: Patient ambulated 100 feet with walker&#039;).\n', NULL, '2025-12-03 11:14:02', '2025-12-03 11:15:12', NULL, NULL, NULL),
(2, '7', NULL, 1, 'oliguria', '— WARNING: Negative fluid balance > 500ml. Monitor hydration status.', 'monitor intake', '— WARNING: Negative fluid balance > 500ml. Monitor hydration status.', 'fluid bolus\"', '— WARNING: Negative fluid balance > 500ml. Monitor hydration status.', 'normalized output\"', '— WARNING: Negative fluid balance > 500ml. Monitor hydration status.', NULL, '2025-12-03 11:16:28', '2025-12-03 11:17:09', NULL, NULL, NULL),
(3, '12', NULL, NULL, 'mobility', NULL, 'fever\", \"temperature\", \"monitoring\"', '— Plan: Implement fever reduction protocol and continuous temperature monitoring\n', 'antipyretic\", \"medication', '— Administer antipyretic medications as ordered and monitor effectiveness\n', 'temperature\", \"normalized\"', '— Temperature returned to normal range, continue monitoring for changes\n', NULL, '2025-12-03 11:19:17', '2025-12-03 13:41:39', NULL, NULL, NULL),
(4, '12', NULL, 2, 'oliguria', '— CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory distress.', '\"monitor intake\"', '— CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory distress.', 'fluid bolus\"', '— CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory distress.', 'normalized output', '— CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory distress.', NULL, '2025-12-03 12:07:33', '2025-12-03 12:08:27', NULL, NULL, NULL),
(5, '18', NULL, NULL, 'temperature 40', '— Risk for hyperthermia related to severe fever as evidenced by temperature &gt; 40°C. Consider sepsis protocol.\n', 'fever\", \"temperature\", \"monitoring\"', '— Plan: Implement fever reduction protocol and continuous temperature monitoring\n', 'antipyretic\", \"medication', '— Administer antipyretic medications as ordered and monitor effectiveness\n', 'temperature\", \"normalized\"', '— Temperature returned to normal range, continue monitoring for changes\n', NULL, '2025-12-03 12:37:39', '2025-12-03 12:39:33', 3, NULL, NULL),
(6, '12', NULL, NULL, 'oliguria', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 14:19:26', '2025-12-03 14:19:26', 1, NULL, NULL),
(7, '7', NULL, NULL, 'Impaired physical mobility', 'Risk for falls related to impaired physical mobility.', 'Risk for falls\"]', 'Goal: Patient will remain free from falls. Outcome: Patient will demonstrate ability to use call bell for assistance.', 'Insomnia', 'Provide a quiet environment. Cluster care to minimize interruptions. Offer a warm beverage before sleep.', 'Imbalanced nutrition', 'Evaluate food intake. Assess patient\'s weight. Goal met if patient is consuming at least 75% of meals and weight is stable.', NULL, '2025-12-03 14:25:56', '2025-12-03 14:29:23', NULL, 2, NULL),
(8, '13', NULL, NULL, 'Leukopenia', 'Risk for Infection related to low white blood cell count.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 16:54:31', '2025-12-03 16:54:31', NULL, NULL, 8),
(9, '20', NULL, 3, 'edema', 'Fluid volume excess related to compromised regulatory mechanisms', 'limit intake', 'Plan: Maintain fluid restriction as ordered, monitor for compliance', '', NULL, '', NULL, NULL, '2025-12-03 17:04:22', '2025-12-03 17:04:53', NULL, NULL, NULL),
(10, '10', NULL, NULL, 'Leukopenia', 'Risk for Infection related to low white blood cell count.', 'Activity Intolerance', 'Goal: Patient will demonstrate increased tolerance for activity. Outcome: Patient will report a decreased level of fatigue during activity.', '[\"Imbalanced Nutrition', 'Provide a diet rich in iron, vitamin B12, and folate. Administer nutritional supplements as ordered. Monitor dietary intake and tolerance.', '\"Risk for Ineffective Tissue Perfusion', 'Evaluate skin color, temperature, and capillary refill. Review hemoglobin and hematocrit levels. Goal met if patient\'s skin is warm and dry, and H&H levels are stable or improving.', NULL, '2025-12-05 00:08:10', '2025-12-05 00:15:59', NULL, NULL, 9);

-- --------------------------------------------------------

--
-- Table structure for table `past_medical_surgical`
--

CREATE TABLE `past_medical_surgical` (
  `medical_id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `condition_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `medication` text DEFAULT NULL,
  `dosage` text DEFAULT NULL,
  `side_effect` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `age` int(11) NOT NULL,
  `birthdate` date DEFAULT NULL,
  `sex` enum('Male','Female','Other') NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `birthplace` varchar(255) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `ethnicity` varchar(100) DEFAULT NULL,
  `chief_complaints` text DEFAULT NULL,
  `admission_date` date NOT NULL,
  `room_no` varchar(255) DEFAULT NULL,
  `bed_no` varchar(255) DEFAULT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `contact_relationship` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`patient_id`, `first_name`, `last_name`, `middle_name`, `age`, `birthdate`, `sex`, `address`, `birthplace`, `religion`, `ethnicity`, `chief_complaints`, `admission_date`, `room_no`, `bed_no`, `contact_name`, `contact_relationship`, `contact_number`, `user_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Gisselle', 'Rutherford', 'Oswald', 33, '1985-05-18', 'Female', '266 Dicki Ranch Suite 784\nKutchburgh, SC 08043-3944', 'Funkmouth', 'Catholic', 'Foreign', 'Fatigue', '2009-06-22', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(2, 'Crawford', 'Towne', 'Jamil', 5, '2020-02-23', 'Female', '5267 Clay WallWest Roslynview, WY 78304-5764', 'Murrayside', 'Christian', 'Foreign', 'Sore throat', '2003-09-15', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2026-01-29 07:11:22', NULL),
(3, 'Coby', 'O\'keefe', 'Cornell', 13, '2019-10-21', 'Female', '534 Raleigh Knolls\nPort Daijaton, MA 83427', 'Harveyhaven', 'Christian', 'Filipino', 'Chest pain', '1971-10-31', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(4, 'Christiana', 'Walker', 'Justen', 41, '1997-03-13', 'Female', '59913 Celine Club\nPort Devin, AZ 27454', 'Port Anabelle', 'Catholic', 'Filipino', 'Nausea and vomiting', '1974-04-02', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(5, 'Omari', 'Schulist', 'Evie', 31, '1988-09-04', 'Female', '82566 Schiller Islands\nEast Trent, WI 04131', 'New Ericport', 'Christian', 'Filipino', 'Diarrhea', '2025-09-27', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(6, 'Rosamond', 'Mclaughlin', 'Elbert', 28, '2010-03-23', 'Female', '7272 Christiansen Station Suite 477\nLake Ted, AL 96405-2606', 'South Monserrate', 'Christian', 'Foreign', 'Fatigue', '2004-12-03', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(7, 'Cassandra', 'Bins', 'Collin', 16, '1995-10-08', 'Male', '508 Alia Junction\nFerryville, OK 15816-2882', 'Reichelside', 'Catholic', 'Filipino', 'Swelling of legs', '1998-07-25', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(8, 'Xander', 'Ondricka', 'Jordyn', 33, '1993-05-11', 'Female', '803 Iva Spring\nCornellville, IA 21219-4603', 'Millsfort', 'Catholic', 'Foreign', 'Cough with phlegm', '1990-08-13', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(9, 'Arnold', 'Reichel', 'Delaney', 14, '1988-08-07', 'Female', '7919 Hosea Heights\nNorth Ethanland, LA 56958-5028', 'Erickmouth', 'Iglesia ni Cristo', 'Filipino', 'Abdominal pain', '2024-05-26', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(10, 'Charlene', 'Rempel', 'Karson', 33, '1980-12-27', 'Female', '8246 Torphy Dam\nBoyermouth, SC 82558', 'West Kaylahhaven', 'Iglesia ni Cristo', 'Filipino', 'Chest pain', '2016-05-24', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(11, 'Joy', 'Krajcik', 'Donald', 9, '2020-11-30', 'Male', '612 Berneice Row Suite 709\nEast Abbieville, NC 29917', 'West Saul', 'Iglesia ni Cristo', 'Foreign', 'Skin rash', '1997-04-11', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(12, 'Briana', 'Anderson', 'Bridget', 38, '1972-11-27', 'Male', '72709 Solon Mountains\nNew Harley, NH 07919', 'Lake Simeon', 'Christian', 'Filipino', 'Swelling of legs', '1984-03-21', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(13, 'Amanda', 'Ferry', 'Loyce', 36, '1982-12-24', 'Female', '604 Shields Skyway\nNorth Chanelle, MT 02123', 'Ceasarport', 'Catholic', 'Filipino', 'Shortness of breath', '1986-01-02', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(14, 'Alexis', 'Hills', 'Rosendo', 5, '1980-02-25', 'Female', '740 Kale Manor Suite 400\nRusselbury, NE 74723-5283', 'Minamouth', 'Catholic', 'Filipino', 'Skin rash', '2024-12-02', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(15, 'Florine', 'Lockman', 'Duane', 26, '2006-11-30', 'Male', '857 Glenda Orchard Suite 836\nIdellaborough, TX 06519', 'DuBuquebury', 'Iglesia ni Cristo', 'Foreign', 'Swelling of legs', '2024-03-14', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(16, 'Anita', 'Boyer', 'Fabian', 11, '2014-09-07', 'Female', '590 Rice PrairieHaagborough, IA 99394-0448', 'Hintzview', 'Catholic', 'Filipino', 'Skin rash', '1972-09-03', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2026-01-29 10:19:27', NULL),
(17, 'Arlene', 'Leuschke', 'Jaleel', 14, '1991-06-02', 'Female', '3768 Teagan Burg\nAileenchester, WV 81457', 'Lake Mohammedstad', 'Iglesia ni Cristo', 'Filipino', 'Fatigue', '2009-10-17', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(18, 'Kristian', 'Dickens', 'Laura', 20, '2024-09-28', 'Male', '20268 Lang Flat Suite 526\nLake Leola, OH 60863', 'Kshlerintown', 'Catholic', 'Filipino', 'Palpitations', '1990-01-26', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(19, 'Leif', 'Muller', 'Elva', 6, '2003-09-01', 'Female', '9950 Kemmer Square\nSouth Kalifurt, CT 51440-6485', 'Kevinmouth', 'Christian', 'Filipino', 'Weight loss', '1998-07-11', NULL, NULL, NULL, NULL, NULL, 3, '2025-12-02 16:44:57', '2025-12-02 16:44:57', NULL),
(20, 'Kali', 'Bernier', 'Elissa', 5, '2020-09-21', 'Male', '4044 Gutkowski RidgeBrandynberg, NV 09438', 'Lake Rashawnshire', 'Christian', 'Filipino', 'Skin rash', '2010-06-06', NULL, NULL, '[\"keith\",\"mark\"]', '[\"nanay\",\"tatay\"]', '[\"012357124251\",\"012315124124\"]', 3, '2025-12-02 16:44:57', '2026-01-27 23:57:06', NULL),
(21, 'Jorejj', 'Panco', 'Geio', 20, '2005-04-12', 'Female', '682 Tre Hills Apt. 493North Tyrique, NE 33079-0604', 'New Deonte', 'Roman Catholic', 'Cebuano', 'sakit tyan', '2026-01-28', NULL, NULL, '[\"keith\",\"mark\"]', '[\"father\",\"mother\"]', '[\"0923489510\",\"09247583910\"]', 3, '2026-01-27 23:41:09', '2026-01-27 23:45:02', NULL),
(22, 'Mark', 'Miklang', 'Tahi', 22, '2003-03-29', 'Male', '682 Tre Hills Apt. 493North Tyrique, NE 33079-0604', 'Oberbrunnershire', 'Protestant', 'Ilocano', 'potanging', '2026-01-28', NULL, NULL, '[\"keithas\",\"rice\"]', '[\"parent\",\"parent\"]', '[\"29746591657\",\"09235162577\"]', 3, '2026-01-27 23:47:11', '2026-01-27 23:47:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `physical_exams`
--

CREATE TABLE `physical_exams` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `general_appearance` varchar(255) DEFAULT NULL,
  `skin_condition` varchar(255) DEFAULT NULL,
  `eye_condition` varchar(255) DEFAULT NULL,
  `oral_condition` varchar(255) DEFAULT NULL,
  `cardiovascular` varchar(255) DEFAULT NULL,
  `abdomen_condition` varchar(255) DEFAULT NULL,
  `extremities` varchar(255) DEFAULT NULL,
  `neurological` varchar(255) DEFAULT NULL,
  `general_appearance_alert` varchar(255) DEFAULT NULL,
  `skin_alert` varchar(255) DEFAULT NULL,
  `eye_alert` varchar(255) DEFAULT NULL,
  `oral_alert` varchar(255) DEFAULT NULL,
  `cardiovascular_alert` varchar(255) DEFAULT NULL,
  `abdomen_alert` varchar(255) DEFAULT NULL,
  `extremities_alert` varchar(255) DEFAULT NULL,
  `neurological_alert` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `physical_exams`
--

INSERT INTO `physical_exams` (`id`, `patient_id`, `general_appearance`, `skin_condition`, `eye_condition`, `oral_condition`, `cardiovascular`, `abdomen_condition`, `extremities`, `neurological`, `general_appearance_alert`, `skin_alert`, `eye_alert`, `oral_alert`, `cardiovascular_alert`, `abdomen_alert`, `extremities_alert`, `neurological_alert`, `created_at`, `updated_at`) VALUES
(1, 20, 'pale', 'jaundice', 'blurry eyes', NULL, NULL, NULL, NULL, NULL, 'Abnormal Circulation (Pallor): Patient appears pale. Pallor can be an early sign of shock due to peripheral vasoconstriction or anemia. Assess perfusion status immediately.', 'Jaundice (yellowing of skin and sclera) indicates high bilirubin levels. Assess for liver disease or hemolysis.', 'Strabismus (misalignment of the eyes) is common in young children but persistence after 4-6 months of age is abnormal. It can lead to amblyopia (lazy eye) if not corrected. Requires pediatric ophthalmology evaluation.', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', '2025-12-03 11:13:06', '2025-12-03 11:13:06'),
(2, 18, 'pale', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Abnormal Circulation (Pallor): Patient appears pale. Pallor can be an early sign of shock due to peripheral vasoconstriction or anemia. Assess perfusion status immediately.', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', '2026-02-01 08:11:19', '2026-02-01 08:11:19'),
(3, 13, 'pale', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Abnormal Circulation (Pallor): Patient appears pale. Pallor can be an early sign of shock due to peripheral vasoconstriction or anemia. Assess perfusion status immediately.', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', 'No Findings', '2026-02-02 00:23:47', '2026-02-02 00:23:47');

-- --------------------------------------------------------

--
-- Table structure for table `present_illness`
--

CREATE TABLE `present_illness` (
  `medical_id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `condition_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `medication` text DEFAULT NULL,
  `dosage` text DEFAULT NULL,
  `side_effect` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` text NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('BopjM8dRB48jS4LtDzHY5rUXGGNtA8JTvigQMNAa', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoidTlKdGpSZGlSYkluOTdEdnpXdWdpRlRvd1pJZ1F1Tm85a2lic2RTMCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzU6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9waHlzaWNhbC1leGFtIjt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6Mzt9', 1769992518),
('M5w8fPmen8r8wgbe2wcNJ68CBhO83jbWNWvnHDee', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo3OntzOjY6Il90b2tlbiI7czo0MDoiRGhIWlUwYzh0U3lnbmNUelJFUVlZVUlmUVNyaURHZ2syRzVwZ3ZlRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC92aXRhbC1zaWducyI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjM7czoxOToic2VsZWN0ZWRfcGF0aWVudF9pZCI7czoyOiIxMyI7czoxMzoic2VsZWN0ZWRfZGF0ZSI7czoxMDoiMjAyNi0wMi0wMSI7czoxNToic2VsZWN0ZWRfZGF5X25vIjtpOjE0NjQxO30=', 1769933623),
('nEVhA1HFFPEZvAM43KKzR3i7cI0Or3eQniBwjsxO', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZm5jaFZqRmRRNm5HWXNPbnRtTXR6YWNqb3BoWVBvRGs5bzNKaEhnZyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9udXJzZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjM7fQ==', 1769821453);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Doctor','Nurse') NOT NULL DEFAULT 'Nurse',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@example.com', '$2y$12$ywBr2v8rmmsdcgi2rvQLq.yXiSu.s3HaoRHOaug0c2OFd3BAjKxbC', 'Admin', '2025-12-02 16:44:54', '2025-12-02 16:44:54'),
(2, 'doctor', 'doctor@example.com', '$2y$12$x7zMcDv700y9F7zF5zJnzeuPQnZEj/0DjD7hzUsmvHo8ooVV.FVVa', 'Doctor', '2025-12-02 16:44:55', '2025-12-02 16:44:55'),
(3, 'nurse', 'nurse@example.com', '$2y$12$4Jc2Gq/qj2wMMEFVHO9vyeftr/1RRei9viE4lGCBq/jfz0fn1BWem', 'Nurse', '2025-12-02 16:44:55', '2025-12-02 16:44:55');

-- --------------------------------------------------------

--
-- Table structure for table `vaccination`
--

CREATE TABLE `vaccination` (
  `medical_id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `condition_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `medication` text DEFAULT NULL,
  `dosage` text DEFAULT NULL,
  `side_effect` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vital_signs`
--

CREATE TABLE `vital_signs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `day_no` int(11) DEFAULT NULL,
  `temperature` varchar(255) DEFAULT NULL,
  `hr` varchar(255) DEFAULT NULL,
  `rr` varchar(255) DEFAULT NULL,
  `bp` varchar(255) DEFAULT NULL,
  `spo2` varchar(255) DEFAULT NULL,
  `temperature_alert` varchar(255) DEFAULT NULL,
  `hr_alert` varchar(255) DEFAULT NULL,
  `rr_alert` varchar(255) DEFAULT NULL,
  `bp_alert` varchar(255) DEFAULT NULL,
  `spo2_alert` varchar(255) DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `diagnosis_alert` text DEFAULT NULL,
  `planning` text DEFAULT NULL,
  `planning_alert` text DEFAULT NULL,
  `intervention` text DEFAULT NULL,
  `intervention_alert` text DEFAULT NULL,
  `evaluation` text DEFAULT NULL,
  `evaluation_alert` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vital_signs`
--

INSERT INTO `vital_signs` (`id`, `patient_id`, `date`, `time`, `day_no`, `temperature`, `hr`, `rr`, `bp`, `spo2`, `alerts`, `created_at`, `updated_at`) VALUES
(1, 12, '2025-12-03', '06:00:00', 15233, '37', '120', '30', '120/80', '20', '', '2025-12-03 11:18:47', '2025-12-03 12:00:01'),
(2, 16, '2025-12-03', '06:00:00', 15233, '37', '120', '30', '120/80', '20', '', '2025-12-03 12:00:23', '2025-12-03 12:00:23'),
(3, 18, '2025-12-03', '06:00:00', 13096, '37', '120', '30', '120/80', '30', 'Normal Findings', '2025-12-03 12:10:42', '2025-12-03 12:12:22'),
(4, 20, '2026-01-22', '06:00:00', 5710, '37', '120', 'asd', '120/80', '20', 'Severe Bradypnea (Possible CNS depression); Severe Hypoxemia (Apply O₂, urgent eval); Low SpO₂ with tachypnea — Possible respiratory distress.; Hypotension and hypoxia — Critical instability.', '2026-01-22 00:17:32', '2026-01-22 00:17:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `act_of_daily_living`
--
ALTER TABLE `act_of_daily_living`
  ADD PRIMARY KEY (`id`),
  ADD KEY `act_of_daily_living_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `allergies`
--
ALTER TABLE `allergies`
  ADD PRIMARY KEY (`medical_id`),
  ADD KEY `allergies_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `changes_in_medication`
--
ALTER TABLE `changes_in_medication`
  ADD PRIMARY KEY (`id`),
  ADD KEY `changes_in_medication_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `current_medication`
--
ALTER TABLE `current_medication`
  ADD PRIMARY KEY (`id`),
  ADD KEY `current_medication_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `developmental_history`
--
ALTER TABLE `developmental_history`
  ADD PRIMARY KEY (`development_id`),
  ADD KEY `developmental_history_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `diagnostics`
--
ALTER TABLE `diagnostics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `diagnostics_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `diagnostic_images`
--
ALTER TABLE `diagnostic_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `diagnostic_images_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `discharge_planning`
--
ALTER TABLE `discharge_planning`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discharge_planning_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `home_medication`
--
ALTER TABLE `home_medication`
  ADD PRIMARY KEY (`id`),
  ADD KEY `home_medication_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `intake_and_outputs`
--
ALTER TABLE `intake_and_outputs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intake_and_outputs_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `ivs_and_lines`
--
ALTER TABLE `ivs_and_lines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ivs_and_lines_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lab_values`
--
ALTER TABLE `lab_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_values_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `medical_administrations`
--
ALTER TABLE `medical_administrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_administrations_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nursing_diagnoses`
--
ALTER TABLE `nursing_diagnoses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nursing_diagnoses_physical_exam_id_foreign` (`physical_exam_id`),
  ADD KEY `nursing_diagnoses_intake_and_output_id_foreign` (`intake_and_output_id`),
  ADD KEY `nursing_diagnoses_vital_signs_id_foreign` (`vital_signs_id`),
  ADD KEY `nursing_diagnoses_adl_id_foreign` (`adl_id`),
  ADD KEY `nursing_diagnoses_lab_values_id_foreign` (`lab_values_id`);

--
-- Indexes for table `past_medical_surgical`
--
ALTER TABLE `past_medical_surgical`
  ADD PRIMARY KEY (`medical_id`),
  ADD KEY `past_medical_surgical_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`patient_id`),
  ADD KEY `patients_user_id_foreign` (`user_id`);

--
-- Indexes for table `physical_exams`
--
ALTER TABLE `physical_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `physical_exams_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `present_illness`
--
ALTER TABLE `present_illness`
  ADD PRIMARY KEY (`medical_id`),
  ADD KEY `present_illness_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `vaccination`
--
ALTER TABLE `vaccination`
  ADD PRIMARY KEY (`medical_id`),
  ADD KEY `vaccination_patient_id_foreign` (`patient_id`);

--
-- Indexes for table `vital_signs`
--
ALTER TABLE `vital_signs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vital_signs_patient_id_foreign` (`patient_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `act_of_daily_living`
--
ALTER TABLE `act_of_daily_living`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `allergies`
--
ALTER TABLE `allergies`
  MODIFY `medical_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `changes_in_medication`
--
ALTER TABLE `changes_in_medication`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `current_medication`
--
ALTER TABLE `current_medication`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `developmental_history`
--
ALTER TABLE `developmental_history`
  MODIFY `development_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diagnostics`
--
ALTER TABLE `diagnostics`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `diagnostic_images`
--
ALTER TABLE `diagnostic_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discharge_planning`
--
ALTER TABLE `discharge_planning`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `home_medication`
--
ALTER TABLE `home_medication`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `intake_and_outputs`
--
ALTER TABLE `intake_and_outputs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ivs_and_lines`
--
ALTER TABLE `ivs_and_lines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lab_values`
--
ALTER TABLE `lab_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `medical_administrations`
--
ALTER TABLE `medical_administrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `nursing_diagnoses`
--
ALTER TABLE `nursing_diagnoses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `past_medical_surgical`
--
ALTER TABLE `past_medical_surgical`
  MODIFY `medical_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `patient_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `physical_exams`
--
ALTER TABLE `physical_exams`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `present_illness`
--
ALTER TABLE `present_illness`
  MODIFY `medical_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vaccination`
--
ALTER TABLE `vaccination`
  MODIFY `medical_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vital_signs`
--
ALTER TABLE `vital_signs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `act_of_daily_living`
--
ALTER TABLE `act_of_daily_living`
  ADD CONSTRAINT `act_of_daily_living_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `allergies`
--
ALTER TABLE `allergies`
  ADD CONSTRAINT `allergies_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `changes_in_medication`
--
ALTER TABLE `changes_in_medication`
  ADD CONSTRAINT `changes_in_medication_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `current_medication`
--
ALTER TABLE `current_medication`
  ADD CONSTRAINT `current_medication_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `developmental_history`
--
ALTER TABLE `developmental_history`
  ADD CONSTRAINT `developmental_history_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `diagnostics`
--
ALTER TABLE `diagnostics`
  ADD CONSTRAINT `diagnostics_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `diagnostic_images`
--
ALTER TABLE `diagnostic_images`
  ADD CONSTRAINT `diagnostic_images_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `discharge_planning`
--
ALTER TABLE `discharge_planning`
  ADD CONSTRAINT `discharge_planning_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `home_medication`
--
ALTER TABLE `home_medication`
  ADD CONSTRAINT `home_medication_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `intake_and_outputs`
--
ALTER TABLE `intake_and_outputs`
  ADD CONSTRAINT `intake_and_outputs_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `ivs_and_lines`
--
ALTER TABLE `ivs_and_lines`
  ADD CONSTRAINT `ivs_and_lines_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `lab_values`
--
ALTER TABLE `lab_values`
  ADD CONSTRAINT `lab_values_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_administrations`
--
ALTER TABLE `medical_administrations`
  ADD CONSTRAINT `medical_administrations_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `nursing_diagnoses`
--
ALTER TABLE `nursing_diagnoses`
  ADD CONSTRAINT `nursing_diagnoses_adl_id_foreign` FOREIGN KEY (`adl_id`) REFERENCES `act_of_daily_living` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nursing_diagnoses_intake_and_output_id_foreign` FOREIGN KEY (`intake_and_output_id`) REFERENCES `intake_and_outputs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nursing_diagnoses_lab_values_id_foreign` FOREIGN KEY (`lab_values_id`) REFERENCES `lab_values` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nursing_diagnoses_physical_exam_id_foreign` FOREIGN KEY (`physical_exam_id`) REFERENCES `physical_exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `nursing_diagnoses_vital_signs_id_foreign` FOREIGN KEY (`vital_signs_id`) REFERENCES `vital_signs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `past_medical_surgical`
--
ALTER TABLE `past_medical_surgical`
  ADD CONSTRAINT `past_medical_surgical_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `physical_exams`
--
ALTER TABLE `physical_exams`
  ADD CONSTRAINT `physical_exams_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `present_illness`
--
ALTER TABLE `present_illness`
  ADD CONSTRAINT `present_illness_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `vaccination`
--
ALTER TABLE `vaccination`
  ADD CONSTRAINT `vaccination_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;

--
-- Constraints for table `vital_signs`
--
ALTER TABLE `vital_signs`
  ADD CONSTRAINT `vital_signs_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
