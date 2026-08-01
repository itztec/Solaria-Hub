-- ASM Money Shef Solar - cPanel MySQL Database Schema
-- Database Name: kdbkxqfy_main
-- User: kdbkxqfy_root

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for `settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL DEFAULT 'ASM Money Shef Solar',
  `tagline` VARCHAR(255) DEFAULT 'Smart Energy • Safe Future',
  `logo` VARCHAR(255) DEFAULT 'assets/logo.jpg',
  `address` TEXT,
  `city` VARCHAR(100) DEFAULT 'Noida',
  `state` VARCHAR(100) DEFAULT 'Uttar Pradesh',
  `pincode` VARCHAR(20) DEFAULT '201301',
  `phone` VARCHAR(50) DEFAULT '+91 98765 43210',
  `email` VARCHAR(100) DEFAULT 'info@asmmoneyshefsolar.com',
  `website` VARCHAR(100) DEFAULT 'https://www.asmmoneyshefsolar.com',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Settings
INSERT INTO `settings` (`id`, `company_name`, `tagline`, `logo`, `address`, `city`, `state`, `pincode`, `phone`, `email`, `website`) VALUES
(1, 'ASM Money Shef Solar', 'Smart Energy • Safe Future', 'assets/logo.jpg', 'Solar Innovation Tower, Tech Park Road, Sector 62', 'Noida', 'Uttar Pradesh', '201301', '+91 98765 43210', 'info@asmmoneyshefsolar.com', 'https://www.asmmoneyshefsolar.com')
ON DUPLICATE KEY UPDATE `company_name` = VALUES(`company_name`);

-- --------------------------------------------------------
-- Table structure for `system_config`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_username` VARCHAR(255) DEFAULT 'ASM26itztec',
  `admin_password` VARCHAR(255) DEFAULT 'A2S6MSS',
  `master_password` VARCHAR(255) DEFAULT 'SUPER@ASM2026',
  `is_locked` TINYINT(1) DEFAULT 0,
  `lock_reason` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed System Config
INSERT INTO `system_config` (`id`, `admin_username`, `admin_password`, `master_password`, `is_locked`, `lock_reason`) VALUES
(1, 'ASM26itztec', 'A2S6MSS', 'SUPER@ASM2026', 0, '')
ON DUPLICATE KEY UPDATE `admin_username` = VALUES(`admin_username`);

-- --------------------------------------------------------
-- Table structure for `distributors`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `distributors` (
  `id` VARCHAR(50) PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL,
  `distributor_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `alt_phone` VARCHAR(50) DEFAULT '',
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL DEFAULT 'password123',
  `state` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) DEFAULT '',
  `area` VARCHAR(100) DEFAULT '',
  `pincode` VARCHAR(20) DEFAULT '',
  `full_address` TEXT,
  `agreement_date` DATE,
  `status` VARCHAR(50) DEFAULT 'Active',
  `photo` LONGTEXT,
  `pdf_doc` LONGTEXT,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Distributors
INSERT IGNORE INTO `distributors` (`id`, `company_name`, `distributor_name`, `phone`, `alt_phone`, `email`, `password`, `state`, `district`, `area`, `pincode`, `full_address`, `agreement_date`, `status`, `notes`) VALUES
('DIS-2026-001', 'GreenGrid Solar Tech', 'Rajesh Sharma', '9823011223', '9823011299', 'rajesh@greengrid.in', 'password123', 'Maharashtra', 'Pune', 'Hinjewadi', '411057', 'Plot 45, Phase 1, Hinjewadi IT Park, Pune', '2026-01-15', 'Active', 'Premium tier solar inverter & panel distributor for Western Maharashtra.'),
('DIS-2026-002', 'SunPower Enterprises', 'Anita Roy', '9711099887', '9711099800', 'anita@sunpower.com', 'password123', 'Karnataka', 'Bengaluru Urban', 'Whitefield', '560066', 'No 12, EPIP Zone, Whitefield, Bengaluru', '2026-02-10', 'Active', 'Leading distributor handling commercial solar rooftop projects.'),
('DIS-2026-003', 'Surya Infra & Electricals', 'Venkatesh Rao', '9440122334', '', 'vrao@suryainfra.com', 'password123', 'Telangana', 'Hyderabad', 'Gachibowli', '500032', 'Building B, Financial District, Gachibowli, Hyderabad', '2026-03-01', 'Active', 'Authorized distribution channel for Telangana solar pump solutions.'),
('DIS-2026-004', 'EcoRay Energy Ltd', 'Vikram Singh', '9810055443', '9810055444', 'vikram@ecoray.in', 'password123', 'Delhi', 'South Delhi', 'Okhla Phase 3', '110020', 'C-21, Okhla Industrial Area Phase 3, New Delhi', '2026-04-12', 'Pending', 'Agreement pending final compliance verification.');

-- --------------------------------------------------------
-- Table structure for `customers`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) DEFAULT '',
  `address` TEXT,
  `pincode` VARCHAR(20) DEFAULT '',
  `city` VARCHAR(100) DEFAULT '',
  `district` VARCHAR(100) DEFAULT '',
  `state` VARCHAR(100) DEFAULT '',
  `system_size` VARCHAR(100) DEFAULT '',
  `lead_source` VARCHAR(100) DEFAULT '',
  `ca_number` VARCHAR(100) DEFAULT '',
  `sanction_load` VARCHAR(100) DEFAULT '',
  `bank_loan` VARCHAR(10) DEFAULT 'No',
  `project_cost` VARCHAR(50) DEFAULT '',
  `discom_name` VARCHAR(100) DEFAULT '',
  `connection_type` VARCHAR(100) DEFAULT '',
  `distributor_id` VARCHAR(50) NOT NULL,
  `distributor_name` VARCHAR(255) DEFAULT '',
  `status` VARCHAR(50) DEFAULT 'Active',
  `documents` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`distributor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Initial Customers
INSERT IGNORE INTO `customers` (`id`, `customer_name`, `phone`, `email`, `address`, `pincode`, `city`, `district`, `state`, `system_size`, `lead_source`, `ca_number`, `sanction_load`, `bank_loan`, `project_cost`, `discom_name`, `connection_type`, `distributor_id`, `distributor_name`, `status`) VALUES
('CUST-2026-001', 'Aarav Mehta', '9920199201', 'aarav.m@gmail.com', 'Flat 402, Green Avenue, Wakad, Pune', '411057', 'Pune', 'Pune', 'Maharashtra', '4kw solar system', 'Website Inquiry', 'CA-98213871', '5 kW', 'No', '220000', 'MSEDCL', 'Single Phase', 'DIS-2026-001', 'GreenGrid Solar Tech', 'Active'),
('CUST-2026-002', 'Priya Sundaram', '9845012345', 'priya.sun@outlook.com', 'Villa 18, Palm Meadows, Marathahalli', '560037', 'Bengaluru', 'Bengaluru', 'Karnataka', '3kw solar system', 'Referral', 'CA-44210988', '4 kW', 'Yes', '175000', 'BESCOM', 'Single Phase', 'DIS-2026-002', 'SunPower Enterprises', 'Active'),
('CUST-2026-003', 'Ramesh Reddy', '9440987654', 'ramesh.reddy@yahoo.com', 'Plot 88, KPHB Colony, Kukatpally', '500072', 'Hyderabad', 'Hyderabad', 'Telangana', '7.5 HP Solar Pump', 'Exhibition', 'CA-10928374', '8 kW', 'Yes', '350000', 'TSSPDCL', 'Three Phase', 'DIS-2026-003', 'Surya Infra & Electricals', 'Active'),
('CUST-2026-004', 'Sanjay Verma', '9811122334', 'sanjay.verma@gmail.com', 'H.No 45, Lajpat Nagar 2, New Delhi', '110024', 'Delhi', 'Delhi', 'Delhi', '5kw solar system', 'Social Media', 'CA-55610293', '6 kW', 'No', '265000', 'BSES Rajdhani', 'Three Phase', 'DIS-2026-004', 'EcoRay Energy Ltd', 'Pending');

COMMIT;
