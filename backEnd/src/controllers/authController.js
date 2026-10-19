// src/controllers/authController.js
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// إعداد سيرفر الجيميل (SMTP) لإرسال الأكواد تلقائياً
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// 1. إنشاء حساب جديد (Customer) + إرسال كود التحقق (OTP)
export const register = async (req, res) => {
    const { name, email, password, phone, gender } = req.body;
    const lang = req.lang;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please fill all required fields.' : 'من فضلك املأ جميع الحقول الأساسية.' 
        });
    }

    try {
        const [existingUser] = await db.query('SELECT id, is_verified FROM users WHERE email = ? OR phone = ?', [email, phone]);
        if (existingUser.length > 0) {
            // Allow re-registration if the existing user is unverified (they haven't completed signup yet)
            const isVerified = existingUser[0].is_verified;
            if (isVerified) {
                return res.status(400).json({ 
                    message: lang === 'en' ? 'Email or Phone number is already registered.' : 'هذا البريد الإلكتروني أو رقم الهاتف مسجل بالفعل.' 
                });
            }
            // Unverified user exists — delete the old record so they can re-enter their data
            await db.query('DELETE FROM users WHERE id = ?', [existingUser[0].id]);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // توليد كود الـ OTP ووقت انتهاء صلاحيته (10 دقائق)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        const [result] = await db.query(
            `INSERT INTO users (name, email, password_hash, phone, gender, role, is_verified, verification_code, code_expires_at) 
             VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?)`,
            [name, email, passwordHash, phone, gender || 'male', 'customer', otpCode, expiresAt]
        );

        // إرسال الكود بناءً على اللغة
        const mailSubject = lang === 'en' ? 'Verify Your Account - Delora' : 'تأكيد حسابك - كود التحقق لديلورا';
        const mailHtml = lang === 'en' ? `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; text-align: center;">
                <h2 style="color: #333;">Welcome ${name} to Delora! 🎉</h2>
                <p style="color: #555; font-size: 16px;">Thank you for registering with us. Your account activation OTP code is:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0; font-size: 34px;">${otpCode}</h1>
                </div>
                <p style="color: #999; font-size: 12px;">This code is valid for 10 minutes only for security reasons.</p>
            </div>
        ` : `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; direction: rtl; text-align: center;">
                <h2 style="color: #333;">أهلاً بك يا ${name} في ديلورا! 🎉</h2>
                <p style="color: #555; font-size: 16px;">شكراً لتسجيلك معنا. كود التحقق الخاص بك لتفعيل الحساب هو:</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #4CAF50; letter-spacing: 8px; margin: 0; font-size: 34px;">${otpCode}</h1>
                </div>
                <p style="color: #999; font-size: 12px;">هذا الكود صالح لمدة 10 دقائق فقط لدواعي الأمان.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"ديلورا هايبيرماركت 🛒" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            html: mailHtml
        }).catch(emailErr => {
            console.error('تعذر إرسال البريد الإلكتروني:', emailErr.message);
        });

        res.status(201).json({ 
            message: lang === 'en' ? 'Your data has been registered successfully! Verification code has been sent to your email. 📨' : 'تم تسجيل بياناتك بنجاح! تم إرسال كود التحقق إلى بريدك الإلكتروني. 📨',
            userId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while creating the account.' : 'حدث خطأ أثناء إنشاء الحساب.', 
            error: error.message 
        });
    }
};

// 2. التحقق من الكود وتفعيل الحساب بشكل نهائي
export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    const lang = req.lang;

    if (!email || !otp) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Email and OTP code are required.' : 'البريد الإلكتروني وكود التحقق مطلوبان.' 
        });
    }

    try {
        const [user] = await db.query('SELECT id, name, phone, verification_code, code_expires_at FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }

        const { verification_code, code_expires_at } = user[0];

        if (verification_code !== otp || new Date() > new Date(code_expires_at)) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Invalid or expired code. ❌' : 'الكود غير صحيح أو انتهت صلاحيته ❌' 
            });
        }

        await db.query(
            'UPDATE users SET is_verified = TRUE, verification_code = NULL, code_expires_at = NULL WHERE email = ?',
            [email]
        );

        // Auto-create an open support ticket so the admin can immediately find and message this customer
        try {
            const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            const customerName = user[0].name || 'Customer';
            const customerPhone = user[0].phone || null;

            // Check if a ticket already exists for this email (e.g. from a race condition)
            const [existing] = await db.query(
                'SELECT id FROM contacts WHERE email = ? AND ticket_id IS NOT NULL LIMIT 1',
                [email]
            );

            if (existing.length === 0) {
                await db.query(
                    `INSERT INTO contacts (name, email, phone, subject, message, type, ticket_id, status, is_read) 
                     VALUES (?, ?, ?, ?, ?, 'support', ?, 'OPEN', TRUE)`,
                    [
                        customerName,
                        email,
                        customerPhone,
                        'Account Registration',
                        `Welcome to Delora, ${customerName}! This chat is now available for you. Feel free to reach out anytime.`,
                        ticketId
                    ]
                );

                // Auto-send first message from customer to admin (WhatsApp-style)
                await db.query(
                    `INSERT INTO chat_messages (ticket_id, sender_type, sender_name, message_text, is_read) 
                     VALUES (?, 'user', ?, ?, FALSE)`,
                    [
                        ticketId,
                        customerName,
                        `Hello! I'm ${customerName}. I just registered on Delora. I have a question.`
                    ]
                ).catch(() => {});
            }
        } catch (ticketErr) {
            // Non-critical: don't fail registration if ticket creation fails
            console.error('Auto-ticket creation failed:', ticketErr.message);
        }

        res.status(200).json({ 
            message: lang === 'en' ? 'Your account has been verified successfully! You can log in now. 🚀🛒' : 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول 🚀🛒' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred during verification.' : 'حدث خطأ أثناء عملية التحقق.', 
            error: error.message 
        });
    }
};

// 3. إعادة إرسال كود التفعيل (Resend OTP) 🔄
export const resendOTP = async (req, res) => {
    const { email } = req.body;
    const lang = req.lang;

    if (!email) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Email is required.' : 'البريد الإلكتروني مطلوب.' 
        });
    }

    try {
        const [user] = await db.query('SELECT id, name, is_verified FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'This email is not registered.' : 'هذا الإيميل غير مسجل.' 
            });
        }
        if (user[0].is_verified) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'This account is already verified, you can log in.' : 'هذا الحساب مفعّل بالفعل، يمكنك تسجيل الدخول.' 
            });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.query('UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?', [newOtp, expiresAt, email]);

        const mailSubject = lang === 'en' ? 'Resend Verification Code - Delora' : 'إعادة إرسال كود التحقق - ديلورا';
        const mailHtml = lang === 'en' ? `
            <div style="text-align: center; font-family: sans-serif;">
                <h3>Your new verification code is:</h3>
                <h1 style="color: #2196F3; letter-spacing: 5px;">${newOtp}</h1>
                <p>Valid for 10 minutes.</p>
            </div>
        ` : `
            <div style="direction: rtl; text-align: center; font-family: sans-serif;">
                <h3>كود التحقق الجديد الخاص بك:</h3>
                <h1 style="color: #2196F3; letter-spacing: 5px;">${newOtp}</h1>
                <p>صالح لمدة 10 دقائق.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"ديلورا هايبيرماركت 🛒" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            html: mailHtml
        }).catch(emailErr => {
            console.error('تعذر إعادة إرسال البريد:', emailErr.message);
        });

        res.status(200).json({ 
            message: lang === 'en' ? 'Verification code has been resent successfully! 📩' : 'تم إعادة إرسال كود التحقق بنجاح! 📩' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while resending the code.' : 'حدث خطأ أثناء إعادة إرسال الكود.', 
            error: error.message 
        });
    }
};

// 4. طلب استعادة كلمة المرور (Forgot Password) 🔑
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const lang = req.lang;

    if (!email) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please enter your email.' : 'من فضلك أدخل البريد الإلكتروني.' 
        });
    }

    try {
        const [user] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Email not found.' : 'البريد الإلكتروني غير موجود.' 
            });
        }

        // استخدام نفس الحقول المخصصة في قاعدة البيانات
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        // تحديث الأعمدة الخاصة بكود الاستعادة (verification_code و code_expires_at كحل موحد أو استخدام أعمدة محددة إذا وجدت)
        // وبما أن الحقول الافتراضية هي كود التحقق، يُفضل استخدامها أو إدخالها في حقول مخصصة بالداتا بيز
        await db.query('UPDATE users SET verification_code = ?, code_expires_at = ? WHERE email = ?', [resetCode, expiresAt, email]);

        const mailSubject = lang === 'en' ? 'Reset Password Request - Delora' : 'طلب إعادة تعيين كلمة المرور - ديلورا';
        const mailHtml = lang === 'en' ? `
            <div style="text-align: center; font-family: sans-serif;">
                <h2>Reset Password Request</h2>
                <p>Use the following code to reset your account password:</p>
                <h1 style="color: #E91E63; letter-spacing: 5px;">${resetCode}</h1>
                <p>This code expires in 15 minutes.</p>
            </div>
        ` : `
            <div style="direction: rtl; text-align: center; font-family: sans-serif;">
                <h2>طلب تغيير كلمة المرور</h2>
                <p>استخدم الكود التالي لإعادة تعيين باسوورد حسابك:</p>
                <h1 style="color: #E91E63; letter-spacing: 5px;">${resetCode}</h1>
                <p>هذا الكود ينتهي بعد 15 دقيقة.</p>
            </div>
        `;

        await transporter.sendMail({
            from: `"ديلورا هايبيرماركت 🛒" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            html: mailHtml
        }).catch(emailErr => {
            console.error('تعذر إرسال بريد إعادة التعيين:', emailErr.message);
        });

        res.status(200).json({ 
            message: lang === 'en' ? 'Password reset code has been sent to your email successfully!' : 'تم إرسال كود إعادة تعيين الباسوورد إلى إيميلك بنجاح!' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};

// 5. تعيين كلمة المرور الجديدة (Reset Password) 🛠️
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const lang = req.lang;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'All fields are required.' : 'جميع الحقول مطلوبة.' 
        });
    }

    try {
        const [user] = await db.query('SELECT verification_code, code_expires_at FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }

        const { verification_code, code_expires_at } = user[0];

        if (verification_code !== otp || new Date() > new Date(code_expires_at)) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Invalid or expired password reset code ❌' : 'كود استعادة الباسوورد خاطئ أو منتهي الصلاحية ❌' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password_hash = ?, verification_code = NULL, code_expires_at = NULL WHERE email = ?',
            [newPasswordHash, email]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'Password changed successfully! You can now log in with your new password. 🎉' : 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بالباسوورد الجديدة. 🎉' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred while resetting the password.' : 'حدث خطأ أثناء إعادة تعيين كلمة المرور.', 
            error: error.message 
        });
    }
};

// 6. تسجيل الدخول وتوليد التوكن
export const login = async (req, res) => {
    const { email, password, username } = req.body;
    const lang = req.lang;
    const identifier = username || email;

    if (!identifier || !password) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Please enter your username and password.' : 'من فضلك أدخل اسم المستخدم وكلمة المرور.' 
        });
    }

    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ? OR name = ?', 
            [identifier, identifier, identifier, identifier]
        );
        if (users.length === 0) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Incorrect login credentials.' : 'بيانات الدخول غير صحيحة.' 
            });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(403).json({ 
                message: lang === 'en' ? 'Your account is not verified yet, please enter verification code first.' : 'حسابك لم يتم تفعيله بعد، يرجى إدخال كود التحقق أولاً.' 
            });
        }

        // Check if user is blocked (is_active = FALSE)
        if (user.is_active === false || user.is_active === 0) {
            return res.status(403).json({ 
                message: lang === 'en' ? 'Your account has been blocked. Please contact support.' : 'تم حظر حسابك. يرجى التواصل مع الدعم الفني.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Incorrect login credentials.' : 'بيانات الدخول غير صحيحة.' 
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: lang === 'en' ? 'Logged in successfully!' : 'تم تسجيل الدخول بنجاح!',
            token,
            user: { 
                id: user.id, name: user.name, username: user.username, email: user.email, 
                phone: user.phone, role: user.role, photo_url: user.photo_url,
                jobTitle: user.job_title || null,
                avatar: user.avatar_url || user.photo_url || null,
                permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : (user.permissions || []),
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'An error occurred during login.' : 'حدث خطأ أثناء تسجيل الدخول.', 
            error: error.message 
        });
    }
};

// 7. جلب بيانات الملف الشخصي (Profile)
export const getProfile = async (req, res) => {
    const userId = req.user.id;
    const lang = req.lang;
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, second_phone, gender, photo_url, role, country, governorate, zip_code, job_title, avatar_url, permissions, created_at FROM users WHERE id = ?',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }
        const u = users[0];
        res.status(200).json({
            ...u,
            fullName: u.name,
            jobTitle: u.job_title || null,
            avatar: u.avatar_url || u.photo_url || null,
            permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || []),
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};

// 8. تحديث بيانات الملف الشخصي (Profile Update)
export const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const lang = req.lang;
    const { name, phone, second_phone, gender, photo_url, country, governorate, zip_code } = req.body;

    try {
        if (phone) {
            const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, userId]);
            if (existingPhone.length > 0) {
                return res.status(400).json({ 
                    message: lang === 'en' ? 'This phone number is already registered to another account.' : 'رقم الهاتف هذا مسجل بالفعل لحساب آخر.' 
                });
            }
        }

        await db.query(
            `UPDATE users SET 
                name = COALESCE(?, name), phone = COALESCE(?, phone), second_phone = ?, 
                gender = COALESCE(?, gender), photo_url = ?, country = COALESCE(?, country), 
                governorate = ?, zip_code = ? WHERE id = ?`,
            [name || null, phone || null, second_phone || null, gender || null, photo_url || null, country || null, governorate || null, zip_code || null, userId]
        );
        res.status(200).json({ 
            message: lang === 'en' ? 'Your profile has been updated successfully!' : 'تم تحديث ملفك الشخصي بنجاح! 👤✨' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};

// 9. تغيير كلمة المرور (Change Password)
export const changePassword = async (req, res) => {
    const userId = req.user.id;
    const lang = req.lang;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Current and new passwords are required.' : 'كلمة المرور الحالية والجديدة مطلوبتان.' 
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'New password must be at least 6 characters.' : 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.' 
        });
    }

    try {
        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'User not found.' : 'المستخدم غير موجود.' 
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                message: lang === 'en' ? 'Current password is incorrect.' : 'كلمة المرور الحالية غير صحيحة.' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.status(200).json({ 
            message: lang === 'en' ? 'Password changed successfully!' : 'تم تغيير كلمة المرور بنجاح!' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.', 
            error: error.message 
        });
    }
};

// =============================================
// DASHBOARD-ONLY AUTH (separate from storefront)
// Uses team_members table — completely isolated.
// Token stored in httpOnly cookie.
// =============================================

const COOKIE_NAME = 'delora_dash_token';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// Dashboard Login — checks team_members table only
export const dashboardLogin = async (req, res) => {
    const { email, password } = req.body;
    const identifier = email || '';
    const lang = req.lang;

    if (!identifier || !password) {
        return res.status(400).json({
            message: lang === 'en' ? 'Email/username and password are required.' : 'البريد الإلكتروني أو اسم المستخدم وكلمة المرور مطلوبان.'
        });
    }

    try {
        const [members] = await db.query(
            'SELECT * FROM team_members WHERE email = ? OR name = ? OR phone = ?',
            [identifier, identifier, identifier]
        );
        if (members.length === 0) {
            return res.status(401).json({
                message: lang === 'en' ? 'Incorrect email or password.' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            });
        }

        const member = members[0];

        if (!member.is_active) {
            return res.status(403).json({
                message: lang === 'en' ? 'Your account has been disabled. Contact the owner.' : 'تم تعطيل حسابك. تواصل مع المالك.'
            });
        }

        const isMatch = await bcrypt.compare(password, member.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                message: lang === 'en' ? 'Incorrect email or password.' : 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            });
        }

        // Owner (job_title='Owner') gets super_admin role so they can manage team members
        const memberRole = member.job_title === 'Owner' ? 'super_admin' : 'team_member';

        // JWT with source='team' to distinguish from storefront tokens
        const token = jwt.sign(
            { id: member.id, role: memberRole, source: 'team' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set httpOnly cookie — never exposed to JavaScript
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

        const permissions = typeof member.permissions === 'string'
            ? JSON.parse(member.permissions)
            : (member.permissions || []);

        res.status(200).json({
            message: lang === 'en' ? 'Logged in successfully!' : 'تم تسجيل الدخول بنجاح!',
            token, // also return token in body for Authorization header fallback
            user: {
                id: member.id,
                fullName: member.name,
                name: member.name,
                email: member.email,
                phone: member.phone,
                jobTitle: member.job_title || null,
                avatar: member.avatar_url || null,
                salary: member.salary || null,
                role: memberRole,
                permissions,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.',
            error: error.message
        });
    }
};

// Dashboard Profile — reads from team_members table
export const dashboardProfile = async (req, res) => {
    const lang = req.lang;

    // Only allow team_member tokens
    if (req.user?.source !== 'team') {
        return res.status(403).json({
            message: lang === 'en' ? 'This endpoint is for dashboard members only.' : 'هذا المسار مخصص لأعضاء لوحة التحكم فقط.'
        });
    }

    try {
        const [members] = await db.query(
            'SELECT id, name, email, phone, job_title, avatar_url, salary, is_active, permissions, created_at FROM team_members WHERE id = ?',
            [req.user.id]
        );
        if (members.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }
        const m = members[0];
        const memberRole = m.job_title === 'Owner' ? 'super_admin' : 'team_member';
        res.status(200).json({
            id: m.id,
            fullName: m.name,
            name: m.name,
            email: m.email,
            phone: m.phone,
            jobTitle: m.job_title || null,
            avatar: m.avatar_url || null,
            salary: m.salary || null,
            role: memberRole,
            is_active: m.is_active,
            permissions: typeof m.permissions === 'string' ? JSON.parse(m.permissions) : (m.permissions || []),
            created_at: m.created_at,
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر.',
            error: error.message
        });
    }
};

// Dashboard Logout — clears the httpOnly cookie
export const dashboardLogout = (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.status(200).json({ message: 'Logged out.' });
};