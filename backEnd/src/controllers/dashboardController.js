import db from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    const lang = req.lang;
    try {
        const [userCount] = await db.query('SELECT COUNT(*) AS total FROM users WHERE role = ?', ['customer']);
        const [orderCount] = await db.query('SELECT COUNT(*) AS total FROM orders');
        const [revenue] = await db.query('SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status != ?', ['canceled']);
        const [pendingCount] = await db.query('SELECT COUNT(*) AS total FROM orders WHERE order_status = ?', ['pending']);

        const stats = [
            {
                title: "totalUser",
                value: userCount[0].total.toLocaleString(),
                percent: "",
                trend: "up",
                label: "upFromYesterday"
            },
            {
                title: "totalOrder",
                value: orderCount[0].total.toLocaleString(),
                percent: "",
                trend: "up",
                label: "upFromPastWeek"
            },
            {
                title: "totalSales",
                value: `EGP ${Number(revenue[0].total).toLocaleString()}`,
                percent: "",
                trend: "up",
                label: "upFromYesterday"
            },
            {
                title: "totalPending",
                value: pendingCount[0].total.toLocaleString(),
                percent: "",
                trend: pendingCount[0].total > 0 ? "down" : "up",
                label: "upFromYesterday"
            }
        ];

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({
            message: lang === 'en' ? 'Server error.' : 'حدث خطأ في السيرفر',
            error: error.message
        });
    }
};
