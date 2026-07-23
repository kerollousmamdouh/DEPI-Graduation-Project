-- ============================================
-- Migration: Add missing columns and tables
-- ============================================

-- 1. Add created_at to categories table
ALTER TABLE categories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER is_active;

-- 2. Add phone column to contacts table (for ticketing)
ALTER TABLE contacts ADD COLUMN phone VARCHAR(20) NULL AFTER email;

-- 3. Add ticketing columns to contacts table
ALTER TABLE contacts ADD COLUMN type ENUM('inquiry', 'complaint', 'suggestion', 'support') DEFAULT 'inquiry' AFTER message;
ALTER TABLE contacts ADD COLUMN ticket_id VARCHAR(50) NULL AFTER type;
ALTER TABLE contacts ADD COLUMN admin_reply TEXT NULL AFTER is_read;
ALTER TABLE contacts ADD COLUMN status ENUM('OPEN', 'REPLIED', 'CLOSED') DEFAULT 'OPEN' AFTER admin_reply;

-- 4. Add index for faster ticket lookups
ALTER TABLE contacts ADD INDEX idx_ticket_id (ticket_id);
ALTER TABLE contacts ADD INDEX idx_type (type);

-- 5. Update existing contacts to have a status
UPDATE contacts SET status = 'OPEN' WHERE status IS NULL;

-- 6. Drop old payment_methods and recreate with full schema
DROP TABLE IF EXISTS payment_methods;
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NULL,
    description TEXT NULL,
    logo_url TEXT NULL,
    brand_color VARCHAR(20) DEFAULT '#000000',
    provider VARCHAR(100) NULL,
    payment_type ENUM('online', 'offline') DEFAULT 'offline',
    receiver_name VARCHAR(200) NULL,
    receiver_number VARCHAR(255) NULL,
    qr_code TEXT NULL,
    require_screenshot BOOLEAN DEFAULT FALSE,
    require_transaction_id BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Add unit_type to products (per-product, not per-category)
ALTER TABLE products ADD COLUMN unit_type ENUM('quantity', 'weight') DEFAULT 'quantity' AFTER unit_en;

-- 8. Add color columns to site_notifications for announcement banner customization
ALTER TABLE site_notifications ADD COLUMN bg_color VARCHAR(20) NULL DEFAULT '#064e3b' AFTER is_active;
ALTER TABLE site_notifications ADD COLUMN text_color VARCHAR(20) NULL DEFAULT '#f0fdf4' AFTER bg_color;
ALTER TABLE site_notifications ADD COLUMN title_color VARCHAR(20) NULL DEFAULT '#34d399' AFTER text_color;

-- 9. Fix orders.payment_method to be VARCHAR instead of ENUM (support any payment method name)
ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) DEFAULT 'cash_on_delivery';

-- 10. Add payment transaction columns to orders
ALTER TABLE orders ADD COLUMN payment_transaction_id VARCHAR(255) NULL AFTER payment_method;
ALTER TABLE orders ADD COLUMN payment_receipt_url TEXT NULL AFTER payment_transaction_id;
ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20) NULL AFTER shipping_address;
ALTER TABLE orders ADD COLUMN customer_notes TEXT NULL AFTER customer_phone;

-- 11. Create chat_messages table for WhatsApp-like multi-message support chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(50) NOT NULL,
    sender_type ENUM('user', 'admin') NOT NULL,
    sender_name VARCHAR(100) NULL,
    message_text TEXT NULL,
    file_url TEXT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_sender (sender_type)
);

-- 12. Seed default payment methods (Egyptian market)
INSERT INTO payment_methods (name_ar, name_en, description, provider, payment_type, receiver_name, receiver_number, require_screenshot, require_transaction_id, is_active, priority, is_default) VALUES
('الدفع عند الاستلام', 'Cash on Delivery', 'ادفع عند استلام طلبك', 'COD', 'offline', NULL, NULL, FALSE, FALSE, TRUE, 1, TRUE),
('فودافون كاش', 'Vodafone Cash', 'تحويل عبر فودافون كاش', 'vodafone', 'offline', 'Vodafone Cash', '01012345678', FALSE, TRUE, TRUE, 2, FALSE),
('اتصالات كاش', 'Etisalat Cash', 'تحويل عبر اتصالات كاش', 'etisalat', 'offline', 'Etisalat Cash', '01112345678', FALSE, TRUE, TRUE, 3, FALSE),
('أورانج كاش', 'Orange Cash', 'تحويل عبر أورانج كاش', 'orange', 'offline', 'Orange Cash', '01212345678', FALSE, TRUE, TRUE, 4, FALSE),
('WE كاش', 'WE Cash', 'تحويل عبر WE', 'we', 'offline', 'WE Cash', '01512345678', FALSE, TRUE, TRUE, 5, FALSE),
('إنستاباي', 'InstaPay', 'تحويل فوري عبر إنستاباي', 'instapay', 'offline', 'InstaPay', '01012345678', TRUE, TRUE, TRUE, 6, FALSE),
('فيزا / ماستركارد', 'Visa / MasterCard', 'دفع إلكتروني آمن بالبطاقة', 'visa', 'online', NULL, NULL, FALSE, TRUE, TRUE, 7, FALSE);

-- 13. Fix logo_url column to support base64 image data
ALTER TABLE payment_methods MODIFY COLUMN logo_url TEXT NULL;

-- 14. Fix receiver_number to support longer account numbers
ALTER TABLE payment_methods MODIFY COLUMN receiver_number VARCHAR(255) NULL;
