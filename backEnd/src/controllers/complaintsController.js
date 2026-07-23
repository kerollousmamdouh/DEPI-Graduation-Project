import db from '../config/db.js';

const generateTicketId = () => {
    return `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
};

// Auto-create required tables/columns if missing
const ensureSchema = async () => {
    await db.query("ALTER TABLE contacts ADD COLUMN phone VARCHAR(20) NULL AFTER email").catch(() => {});
    await db.query("ALTER TABLE contacts ADD COLUMN type VARCHAR(50) DEFAULT 'inquiry' AFTER message").catch(() => {});
    await db.query("ALTER TABLE contacts ADD COLUMN ticket_id VARCHAR(50) NULL AFTER type").catch(() => {});
    await db.query("ALTER TABLE contacts ADD COLUMN admin_reply TEXT NULL AFTER is_read").catch(() => {});
    await db.query("ALTER TABLE contacts ADD COLUMN status VARCHAR(20) DEFAULT 'OPEN' AFTER admin_reply").catch(() => {});
    await db.query(`CREATE TABLE IF NOT EXISTS chat_messages (
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
    )`).catch(() => {});
};
ensureSchema();

// 1. Get all tickets (admin) — one thread per client email
export const getAllComplaints = async (req, res) => {
    const lang = req.lang;
    try {
        // Group by email: only show the latest OPEN/REPLIED ticket per client.
        // Also show all CLOSED tickets.
        const [complaints] = await db.query(
            `SELECT c.id, c.name, c.email, c.phone, c.subject, c.message, c.type, 
                    c.ticket_id, c.status, c.is_read, c.created_at,
                    (SELECT COUNT(*) FROM chat_messages cm 
                     WHERE cm.ticket_id = c.ticket_id AND cm.sender_type = 'user' AND cm.is_read = FALSE
                    ) AS unread_count,
                    (SELECT cm2.created_at FROM chat_messages cm2 
                     WHERE cm2.ticket_id = c.ticket_id 
                     ORDER BY cm2.created_at DESC LIMIT 1
                    ) AS last_msg_time
             FROM contacts c
             WHERE c.ticket_id IS NOT NULL
             ORDER BY 
                CASE WHEN c.status IN ('OPEN','REPLIED') THEN 0 ELSE 1 END,
                COALESCE(
                    (SELECT cm3.created_at FROM chat_messages cm3 
                     WHERE cm3.ticket_id = c.ticket_id ORDER BY cm3.created_at DESC LIMIT 1),
                    c.created_at
                ) DESC`
        );

        const normalized = await Promise.all(complaints.map(async (c) => {
            const [chatMsgs] = await db.query(
                `SELECT id, ticket_id, sender_type, sender_name, message_text, file_url, is_read, created_at
                 FROM chat_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
                [c.ticket_id]
            );

            const messages = [];

            // Always include the original complaint as the first message
            messages.push({
                id: `MSG-${c.id}-user`,
                sender: 'user',
                text: c.message,
                time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: c.created_at,
            });

            // Include all chat messages (no notification type anymore)
            chatMsgs.forEach(m => {
                messages.push({
                    id: `CHAT-${m.id}`,
                    sender: m.sender_type,
                    senderName: m.sender_name || undefined,
                    text: m.message_text,
                    file: m.file_url || undefined,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    createdAt: m.created_at,
                    isRead: !!m.is_read,
                });
            });

            return {
                id: c.id,
                ticketId: c.ticket_id,
                customerName: c.name,
                clientName: c.name,
                email: c.email,
                clientEmail: c.email,
                phone: c.phone,
                subject: c.subject,
                type: c.type,
                status: c.status || 'OPEN',
                date: new Date(c.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
                createdAt: c.created_at,
                unreadCount: c.unread_count || 0,
                hasNotification: (c.unread_count || 0) > 0,
                messages,
            };
        }));

        res.status(200).json(normalized);
    } catch (error) {
        console.error('getAllComplaints error:', error.message);
        res.status(200).json([]);
    }
};

// 1b. Get tickets for current customer
export const getMyTickets = async (req, res) => {
    const lang = req.lang;
    const email = req.query.email || req.user?.email;

    if (!email) {
        return res.status(400).json({
            message: lang === 'en' ? 'Email is required.' : 'البريد الإلكتروني مطلوب.'
        });
    }

    try {
        const [complaints] = await db.query(
            `SELECT id, name, email, phone, subject, message, type, ticket_id, status, is_read, created_at 
             FROM contacts 
             WHERE ticket_id IS NOT NULL AND email = ?
             ORDER BY 
                CASE WHEN status IN ('OPEN','REPLIED') THEN 0 ELSE 1 END,
                created_at DESC`,
            [email]
        );

        const normalized = await Promise.all(complaints.map(async (c) => {
            const [chatMsgs] = await db.query(
                `SELECT id, ticket_id, sender_type, sender_name, message_text, file_url, is_read, created_at
                 FROM chat_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
                [c.ticket_id]
            );

            const messages = [];

            messages.push({
                id: `MSG-${c.id}-user`,
                sender: 'user',
                text: c.message,
                time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: c.created_at,
            });

            chatMsgs.forEach(m => {
                messages.push({
                    id: `CHAT-${m.id}`,
                    sender: m.sender_type,
                    senderName: m.sender_name || undefined,
                    text: m.message_text,
                    file: m.file_url || undefined,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    createdAt: m.created_at,
                });
            });

            return {
                id: c.id,
                ticketId: c.ticket_id,
                customerName: c.name,
                clientName: c.name,
                email: c.email,
                clientEmail: c.email,
                phone: c.phone,
                subject: c.subject,
                type: c.type,
                status: c.status || 'OPEN',
                date: new Date(c.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
                createdAt: c.created_at,
                messages,
            };
        }));

        res.status(200).json(normalized);
    } catch (error) {
        console.error('getMyTickets error:', error.message);
        res.status(200).json([]);
    }
};

// 2. Reply to ticket (admin) — adds to existing thread, stores admin name
export const replyToComplaint = async (req, res) => {
    const { id } = req.params;
    const { text, fileUrl } = req.body;
    const lang = req.lang;
    const adminName = req.user?.fullName || req.user?.name || req.user?.email || 'Admin';

    if (!text && !fileUrl) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Reply text or file is required.' : 'نص الرد أو ملف مطلوب.' 
        });
    }

    try {
        const [existing] = await db.query('SELECT ticket_id, email, name FROM contacts WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Ticket not found.' : 'التذكرة غير موجودة.' 
            });
        }

        const ticketId = existing[0].ticket_id;

        await db.query(
            `INSERT INTO chat_messages (ticket_id, sender_type, sender_name, message_text, file_url)
             VALUES (?, 'admin', ?, ?, ?)`,
            [ticketId, adminName, text || null, fileUrl || null]
        );

        await db.query(
            'UPDATE contacts SET is_read = TRUE, status = ? WHERE id = ?',
            ['REPLIED', id]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'Reply sent successfully.' : 'تم إرسال الرد بنجاح.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 3. Send direct message to a customer (admin) — finds existing thread or creates new
export const sendDirectMessage = async (req, res) => {
    const { email, name, message: messageText } = req.body;
    const lang = req.lang;
    const adminName = req.user?.fullName || req.user?.name || req.user?.email || 'Admin';

    if (!email || !messageText) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Email and message are required.' : 'البريد الإلكتروني والرسالة مطلوبان.' 
        });
    }

    try {
        // Check if this email already has an OPEN or REPLIED ticket
        const [existing] = await db.query(
            `SELECT ticket_id FROM contacts 
             WHERE email = ? AND ticket_id IS NOT NULL AND status IN ('OPEN','REPLIED')
             ORDER BY created_at DESC LIMIT 1`,
            [email]
        );

        let ticketId;

        if (existing.length > 0) {
            // Use existing thread
            ticketId = existing[0].ticket_id;
            await db.query(
                `INSERT INTO chat_messages (ticket_id, sender_type, sender_name, message_text)
                 VALUES (?, 'admin', ?, ?)`,
                [ticketId, adminName, messageText]
            );
        } else {
            // Create new thread
            ticketId = generateTicketId();
            await db.query(
                `INSERT INTO contacts (name, email, subject, message, type, ticket_id, status, is_read) 
                 VALUES (?, ?, ?, ?, 'support', ?, 'OPEN', TRUE)`,
                [name || 'Customer', email, `Direct message to ${name || 'Customer'}`, messageText, ticketId]
            );
            await db.query(
                `INSERT INTO chat_messages (ticket_id, sender_type, sender_name, message_text)
                 VALUES (?, 'admin', ?, ?)`,
                [ticketId, adminName, messageText]
            );
        }

        res.status(201).json({ 
            message: lang === 'en' ? 'Message sent successfully.' : 'تم إرسال الرسالة بنجاح.',
            ticket_id: ticketId
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 4. Update ticket status (admin)
export const updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const lang = req.lang;

    const validStatuses = ['OPEN', 'REPLIED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Invalid status.' : 'حالة غير صالحة.' 
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM contacts WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Ticket not found.' : 'التذكرة غير موجودة.' 
            });
        }

        await db.query('UPDATE contacts SET status = ? WHERE id = ?', [status, id]);

        res.status(200).json({ 
            message: lang === 'en' ? 'Status updated.' : 'تم تحديث الحالة.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 5. Close ticket (admin) — WhatsApp-style: preserve history
export const deleteComplaint = async (req, res) => {
    const { id } = req.params;
    const lang = req.lang;

    try {
        const [existing] = await db.query('SELECT ticket_id FROM contacts WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Ticket not found.' : 'التذكرة غير موجودة.' 
            });
        }

        await db.query('UPDATE contacts SET status = ? WHERE id = ?', ['CLOSED', id]);

        res.status(200).json({ 
            message: lang === 'en' ? 'Ticket closed. Chat history preserved.' : 'تم إغلاق التذكرة. تم الاحتفاظ بسجل المحادثة.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 6. Submit complaint from customer — unified thread per email
export const submitComplaint = async (req, res) => {
    const { name, email, phone, subject, message, type } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    try {
        // Check if this email already has an OPEN or REPLIED ticket → add message to it
        const [existing] = await db.query(
            `SELECT ticket_id FROM contacts 
             WHERE email = ? AND ticket_id IS NOT NULL AND status IN ('OPEN','REPLIED')
             ORDER BY created_at DESC LIMIT 1`,
            [email]
        );

        if (existing.length > 0) {
            const ticketId = existing[0].ticket_id;

            // Add the new message to the existing thread
            await db.query(
                `INSERT INTO chat_messages (ticket_id, sender_type, sender_name, message_text)
                 VALUES (?, 'user', ?, ?)`,
                [ticketId, name, message]
            );

            // Reopen the ticket if it was replied
            await db.query(
                `UPDATE contacts SET status = 'OPEN', is_read = FALSE WHERE ticket_id = ?`,
                [ticketId]
            );

            return res.status(201).json({ 
                message: 'تم إضافة رسالتك إلى محادثتك الحالية!',
                ticket_id: ticketId
            });
        }

        // No existing thread → create a new one
        const ticketId = generateTicketId();
        await db.query(
            `INSERT INTO contacts (name, email, phone, subject, message, type, ticket_id, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
            [name, email, phone || null, subject, message, type || 'support', ticketId]
        );
        res.status(201).json({ 
            message: 'تم إرسال رسالتك بنجاح!',
            ticket_id: ticketId
        });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إرسال الرسالة', error: error.message });
    }
};

// 7. Get chat messages for a ticket (customer or admin)
export const getChatMessages = async (req, res) => {
    const { ticketId } = req.params;
    const lang = req.lang;

    try {
        const [ticket] = await db.query('SELECT * FROM contacts WHERE ticket_id = ?', [ticketId]);
        if (ticket.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Ticket not found.' : 'التذكرة غير موجودة.' 
            });
        }

        const t = ticket[0];
        const [chatMsgs] = await db.query(
            `SELECT * FROM chat_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
            [ticketId]
        );

        const messages = [{
            id: `MSG-${t.id}-user`,
            sender: 'user',
            text: t.message,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: t.created_at,
        }];

        chatMsgs.forEach(m => {
            messages.push({
                id: `CHAT-${m.id}`,
                sender: m.sender_type,
                senderName: m.sender_name || undefined,
                text: m.message_text,
                file: m.file_url || undefined,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: m.created_at,
            });
        });

        res.status(200).json({
            ticketId: t.ticket_id,
            status: t.status,
            messages,
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 8. Send message from customer — unified thread
export const sendChatMessage = async (req, res) => {
    const { ticketId } = req.params;
    const { name, email, text, fileUrl } = req.body;
    const lang = req.lang;

    if (!text && !fileUrl) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Message text or file is required.' : 'نص الرسالة أو ملف مطلوب.' 
        });
    }

    try {
        const [ticket] = await db.query('SELECT ticket_id FROM contacts WHERE ticket_id = ?', [ticketId]);
        if (ticket.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Ticket not found.' : 'التذكرة غير موجودة.' 
            });
        }

        await db.query(
            `INSERT INTO chat_messages (ticket_id, sender_type, sender_name, message_text, file_url)
             VALUES (?, 'user', ?, ?, ?)`,
            [ticketId, name || 'Customer', text || null, fileUrl || null]
        );

        await db.query(
            `UPDATE contacts SET status = 'OPEN', is_read = FALSE WHERE ticket_id = ?`,
            [ticketId]
        );

        res.status(201).json({ 
            message: lang === 'en' ? 'Message sent.' : 'تم إرسال الرسالة.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 9. Edit a chat message
// - Customer: can edit own messages ONLY before any admin replies
// - Admin: can edit own messages within 5 minutes of sending
export const editChatMessage = async (req, res) => {
    const { messageId } = req.params;
    const { text, senderType } = req.body; // senderType: 'user' or 'admin' (from frontend)
    const lang = req.lang;

    if (!text) {
        return res.status(400).json({ 
            message: lang === 'en' ? 'Message text is required.' : 'نص الرسالة مطلوب.' 
        });
    }

    try {
        const [existing] = await db.query(
            'SELECT id, sender_type, sender_name, created_at, is_read FROM chat_messages WHERE id = ?', 
            [messageId]
        );
        if (existing.length === 0) {
            return res.status(404).json({ 
                message: lang === 'en' ? 'Message not found.' : 'الرسالة غير موجودة.' 
            });
        }

        const msg = existing[0];

        if (senderType === 'admin' || msg.sender_type === 'admin') {
            // Admin: can edit within 5 minutes only
            const msgAge = Date.now() - new Date(msg.created_at).getTime();
            const fiveMinutes = 5 * 60 * 1000;
            if (msgAge > fiveMinutes) {
                return res.status(400).json({ 
                    message: lang === 'en' 
                        ? 'Cannot edit a message after 5 minutes.' 
                        : 'لا يمكن تعديل رسالة بعد 5 دقائق.' 
                });
            }
        } else {
            // Customer: can edit only before any admin reply exists
            const ticketMsg = await db.query(
                `SELECT id FROM chat_messages WHERE ticket_id = (
                    SELECT ticket_id FROM chat_messages WHERE id = ?
                ) AND sender_type = 'admin' LIMIT 1`,
                [messageId]
            );
            if (ticketMsg[0].length > 0) {
                return res.status(400).json({ 
                    message: lang === 'en' 
                        ? 'Cannot edit a message after the admin has replied.' 
                        : 'لا يمكن تعديل رسالة بعد رد الإدارة.' 
                });
            }
        }

        await db.query(
            'UPDATE chat_messages SET message_text = ? WHERE id = ?',
            [text, messageId]
        );

        res.status(200).json({ 
            message: lang === 'en' ? 'Message updated.' : 'تم تحديث الرسالة.' 
        });
    } catch (error) {
        res.status(500).json({ 
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر', 
            error: error.message 
        });
    }
};

// 10. Delete message (blocked — WhatsApp-style)
export const deleteChatMessage = async (req, res) => {
    const lang = req.lang;
    return res.status(403).json({ 
        message: lang === 'en' 
            ? 'Message deletion is not allowed. Chat history is preserved permanently.' 
            : 'حذف الرسالة غير مسموح. يتم الاحتفاظ بسجل المحادثة بشكل دائم.' 
    });
};
