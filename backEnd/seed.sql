-- ============================================
-- SEED DATA (append after your CREATE TABLE statements)
-- ============================================

-- Test users (passwords: admin123, manager123, customer123)
INSERT INTO users (name, username, email, password_hash, phone, role, is_verified, is_active) VALUES
('Admin', 'admin', 'admin@delora.com', '$2b$10$a709pAbwbA5G5QLroAlIZ.l4bYcyaiSYVD8iU0BSSgK5fb.qyhGXK', '01000000000', 'super_admin', TRUE, TRUE),
('Store Manager', 'manager', 'manager@delora.com', '$2b$10$a709pAbwbA5G5QLroAlIZ.3YNA18d7CX9IG7jf0VhRAD5GLHYSmky', '01000000001', 'store_manager', TRUE, TRUE),
('Customer', 'customer', 'customer@delora.com', '$2b$10$a709pAbwbA5G5QLroAlIZ.a4Pcb8pcm4j50hWRK0HwNboOBoX/GCe', '01000000002', 'customer', TRUE, TRUE)
ON DUPLICATE KEY UPDATE username=VALUES(username), role=VALUES(role), is_verified=TRUE, is_active=TRUE;

-- Store settings
INSERT INTO store_settings (key_name, key_value_ar, key_value_en, display_name_ar, display_name_en) VALUES
('store_name_ar', 'ديالرا سوبر ماركت', NULL, 'اسم المتجر', 'Store Name'),
('store_name_en', NULL, 'Delora Supermarket', 'اسم المتجر', 'Store Name'),
('hotline', '16000', NULL, 'خط الساخن', 'Hotline'),
('email_contact', 'info@delora.com', NULL, 'البريد الإلكتروني', 'Email'),
('facebook_link', 'https://facebook.com/delora', NULL, 'فيسبوك', 'Facebook'),
('instagram_link', 'https://instagram.com/delora', NULL, 'انستغرام', 'Instagram'),
('twitter_link', 'https://twitter.com/delora', NULL, 'تويتر', 'Twitter'),
('working_hours_ar', '9 ص - 12 م يومياً', NULL, 'ساعات العمل', 'Working Hours'),
('address_ar', 'شارع التحرير، القاهرة', 'Tahrir Street, Cairo', 'العنوان', 'Address'),
('footer_description_ar', 'ديالرا - تسوقة ذكية لكل العائلة', 'Delora - Smart Shopping for the Whole Family', 'وصف الفوتر', 'Footer Description'),
('site_name_ar', 'ديالرا', 'Delora', 'اسم الموقع', 'Site Name'),
('site_description_ar', 'سوبر ماركت أونلاين', 'Online Supermarket', 'وصف الموقع', 'Site Description'),
('footer_logo', '/images/logo3.png', NULL, 'شعار الفوتر', 'Footer Logo'),
('footer_about_ar', 'ديالرا - وجهتك الأولى للتسوق الذكي. نوفر لك أفضل المنتجات بأسعار منافسة مع خدمة توصيل سريعة لباب بيتك.', NULL, 'وصف الفوتر بالعربي', 'Footer About AR'),
('footer_about_en', 'DELORA - Your premier destination for smart shopping. We provide the best products at competitive prices with fast home delivery.', NULL, 'وصف الفوتر بالإنجليزي', 'Footer About EN'),
('footer_working_hours_ar', '9 ص - 12 م يومياً', NULL, 'ساعات العمل بالعربي', 'Footer Working Hours AR'),
('footer_working_hours_en', '9 AM - 12 AM Daily', NULL, 'ساعات العمل بالإنجليزي', 'Footer Working Hours EN'),
('footer_phones', '["01012345678","01187654321"]', NULL, 'هواتف الفوتر', 'Footer Phones'),
('footer_locations', '[{"name":"فرع مدينة نصر","nameEn":"Nasr City Branch","url":"https://maps.google.com/?q=Nasr+City"},{"name":"فرع التجمع","nameEn":"Tagamoa Branch","url":"https://maps.google.com/?q=Tagamoa"}]', NULL, 'مواقع الفروع', 'Footer Locations'),
('footer_social_links', '[{"name":"Facebook","url":"https://fb.com/delora","icon":"facebook"},{"name":"Instagram","url":"https://instagram.com/delora","icon":"instagram"},{"name":"WhatsApp","url":"https://wa.me/201001105352","icon":"whatsapp"},{"name":"Telegram","url":"https://t.me/delora","icon":"telegram"}]', NULL, 'روابط التواصل الاجتماعي', 'Footer Social Links')
ON DUPLICATE KEY UPDATE key_value_ar=VALUES(key_value_ar), key_value_en=VALUES(key_value_en);