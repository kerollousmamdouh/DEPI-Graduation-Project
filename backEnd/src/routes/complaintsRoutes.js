import express from 'express';
import { 
    getAllComplaints,
    getMyTickets,
    replyToComplaint, 
    sendDirectMessage, 
    updateComplaintStatus, 
    deleteComplaint, 
    submitComplaint,
    getChatMessages,
    sendChatMessage,
    editChatMessage,
    deleteChatMessage
} from '../controllers/complaintsController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public endpoints
router.post('/', submitComplaint);

// Customer endpoints (public, filtered by email)
router.get('/my-tickets', getMyTickets);

// Message edit/delete (admin only) — MUST be before :id routes to avoid conflicts
router.put('/messages/:messageId', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), editChatMessage);
router.delete('/messages/:messageId', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), deleteChatMessage);

// Admin endpoints
router.get('/', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), getAllComplaints);
router.post('/direct-message', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), sendDirectMessage);
router.post('/:id/reply', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), replyToComplaint);
router.patch('/:id/status', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), updateComplaintStatus);
router.delete('/:id', protect, authorizeRoles('super_admin', 'store_manager', 'team_member'), deleteComplaint);

// Ticket message endpoints (must be last to avoid route conflicts)
router.get('/:ticketId/messages', getChatMessages);
router.post('/:ticketId/messages', sendChatMessage);

export default router;
