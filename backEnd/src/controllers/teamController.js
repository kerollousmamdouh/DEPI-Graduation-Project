import db from '../config/db.js';
import bcrypt from 'bcrypt';

// =============================================
// SEPARATE team_members table — completely
// independent of the 'users' (customers) table.
// =============================================

const ensureSchema = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS team_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(30) NULL,
                job_title VARCHAR(100) NULL,
                avatar_url TEXT NULL,
                salary DECIMAL(10,2) NULL,
                is_active BOOLEAN DEFAULT TRUE,
                permissions JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Auto-seed the owner (super_admin from users table) into team_members
        // so they can log in to the dashboard.
        const [admins] = await db.query(
            "SELECT id, name, email, password_hash, phone, photo_url FROM users WHERE role = 'super_admin' LIMIT 1"
        );
        if (admins.length > 0) {
            const admin = admins[0];
            const [exists] = await db.query('SELECT id FROM team_members WHERE email = ?', [admin.email]);
            if (exists.length === 0) {
                await db.query(
                    `INSERT INTO team_members (name, email, password_hash, phone, avatar_url, job_title, permissions)
                     VALUES (?, ?, ?, ?, ?, 'Owner', NULL)`,
                    [admin.name, admin.email, admin.password_hash, admin.phone, admin.photo_url]
                );
                console.log(`✅ Auto-seeded owner "${admin.name}" into team_members`);
            } else {
                // Ensure owner's password_hash stays in sync with users table
                await db.query(
                    'UPDATE team_members SET password_hash = ?, avatar_url = COALESCE(?, avatar_url) WHERE email = ?',
                    [admin.password_hash, admin.photo_url, admin.email]
                );
            }
        }
    } catch (err) {
        console.error('team_members schema error:', err.message);
    }
};

// Run schema + seed at module load (non-blocking for the rest of the app)
ensureSchema();

// =============================================
// GET all team members
// =============================================
export const getTeamMembers = async (req, res) => {
    const lang = req.lang;
    try {
        const [members] = await db.query(
            `SELECT id, name, email, phone, job_title, avatar_url, salary, is_active, permissions, created_at
             FROM team_members ORDER BY created_at DESC`
        );

        const normalized = members.map(m => ({
            id: m.id,
            fullName: m.name,
            email: m.email,
            phone: m.phone,
            jobTitle: m.job_title || null,
            avatar: m.avatar_url || null,
            salary: m.salary || null,
            status: m.is_active ? "Active" : "Disabled",
            permissions: typeof m.permissions === 'string' ? JSON.parse(m.permissions) : (m.permissions || []),
            created_at: m.created_at,
        }));

        res.status(200).json(normalized);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

// =============================================
// CREATE a new team member
// Email uniqueness is checked ONLY within
// team_members — customers table is untouched.
// =============================================
export const createTeamMember = async (req, res) => {
    const lang = req.lang;
    const { name, fullName, email, password, phone, jobTitle, avatar, salary, permissions, is_active } = req.body;
    const memberName = name || fullName;

    if (!memberName || !email || !password) {
        return res.status(400).json({
            message: lang === 'en' ? 'Name, email and password are required.' : 'الاسم والإيميل وكلمة المرور مطلوبة.'
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM team_members WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({
                message: lang === 'en' ? 'Email already exists among team members.' : 'البريد الإلكتروني موجود بالفعل بين أعضاء الفريق.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const permissionsJson = permissions ? JSON.stringify(permissions) : null;
        const activeStatus = is_active !== undefined ? (is_active ? 1 : 0) : 1;

        await db.query(
            `INSERT INTO team_members (name, email, password_hash, phone, job_title, avatar_url, salary, permissions, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [memberName, email, passwordHash, phone || null, jobTitle || null, avatar || null, salary || null, permissionsJson, activeStatus]
        );

        res.status(201).json({
            message: lang === 'en' ? 'Team member added successfully.' : 'تم إضافة العضو بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

// =============================================
// UPDATE a team member
// =============================================
export const updateTeamMember = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;
    const { name, fullName, email, phone, is_active, jobTitle, avatar, salary, status, permissions, password } = req.body;
    const memberName = name || fullName;
    const activeStatus = is_active !== undefined
        ? (is_active ? 1 : 0)
        : (status === "Active" ? 1 : status === "Disabled" ? 0 : null);
    const permissionsJson = permissions ? JSON.stringify(permissions) : null;

    try {
        const [existing] = await db.query('SELECT id FROM team_members WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }

        if (email) {
            const [emailTaken] = await db.query('SELECT id FROM team_members WHERE email = ? AND id != ?', [email, id]);
            if (emailTaken.length > 0) {
                return res.status(400).json({
                    message: lang === 'en' ? 'Email already exists among team members.' : 'البريد الإلكتروني موجود بالفعل بين أعضاء الفريق.'
                });
            }
        }

        let passwordHash = null;
        if (password && password.trim()) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(password, salt);
        }

        await db.query(
            `UPDATE team_members SET
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                phone = ?,
                job_title = COALESCE(?, job_title),
                avatar_url = COALESCE(?, avatar_url),
                salary = COALESCE(?, salary),
                is_active = COALESCE(?, is_active),
                permissions = COALESCE(?, permissions),
                password_hash = COALESCE(?, password_hash)
             WHERE id = ?`,
            [memberName || null, email || null, phone || null, jobTitle || null, avatar || null, salary || null, activeStatus, permissionsJson, passwordHash, id]
        );

        res.status(200).json({
            message: lang === 'en' ? 'Member updated successfully.' : 'تم تحديث العضو بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

// =============================================
// DELETE a team member
// =============================================
export const deleteTeamMember = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        const [existing] = await db.query('SELECT id FROM team_members WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }

        await db.query('DELETE FROM team_members WHERE id = ?', [id]);
        res.status(200).json({
            message: lang === 'en' ? 'Member deleted successfully.' : 'تم حذف العضو بنجاح.'
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

// =============================================
// VERIFY the OWNER's password
// Used to confirm sensitive actions taken by a non-owner
// team member (adding/editing members, updating their own
// profile, etc.). Never returns any password/hash data —
// only whether the supplied password matched.
// Route suggestion: POST /team/verify-owner-password
// =============================================
export const verifyOwnerPassword = async (req, res) => {
    const lang = req.lang;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            valid: false,
            message: lang === 'en' ? 'Password is required.' : 'كلمة المرور مطلوبة.'
        });
    }

    try {
        const [owners] = await db.query(
            "SELECT password_hash FROM team_members WHERE job_title = 'Owner' LIMIT 1"
        );
        if (owners.length === 0) {
            return res.status(404).json({
                valid: false,
                message: lang === 'en' ? 'Owner account not found.' : 'حساب المالك غير موجود.'
            });
        }

        const matches = await bcrypt.compare(password, owners[0].password_hash);
        if (!matches) {
            return res.status(401).json({
                valid: false,
                message: lang === 'en' ? 'Incorrect password.' : 'كلمة المرور غير صحيحة.'
            });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        res.status(500).json({
            valid: false,
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};

// =============================================
// TOGGLE team member status
// =============================================
export const toggleTeamMemberStatus = async (req, res) => {
    const lang = req.lang;
    const { id } = req.params;

    try {
        const [existing] = await db.query('SELECT is_active FROM team_members WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                message: lang === 'en' ? 'Member not found.' : 'العضو غير موجود.'
            });
        }

        const newStatus = existing[0].is_active ? 0 : 1;
        await db.query('UPDATE team_members SET is_active = ? WHERE id = ?', [newStatus, id]);

        res.status(200).json({
            message: lang === 'en' ? 'Status updated.' : 'تم تحديث الحالة.',
            is_active: newStatus,
            status: newStatus ? "Active" : "Disabled"
        });
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};