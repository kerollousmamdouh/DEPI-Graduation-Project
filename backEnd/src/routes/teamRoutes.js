import express from 'express';
import {
    getTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    toggleTeamMemberStatus,
    verifyOwnerPassword
} from '../controllers/teamController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Any logged-in dashboard user (owner or team member) can view the list —
// they just can't act on it unless they're the super_admin (or, later,
// have the relevant per-member permission).
router.get('/', authorizeRoles('super_admin', 'team_member'), getTeamMembers);

// Non-owner team members hit this to confirm the owner's password before an
// add/edit goes through — so it has to be reachable by 'team_member' too,
// not just super_admin.
router.post('/verify-owner-password', authorizeRoles('super_admin', 'team_member'), verifyOwnerPassword);

router.post('/', authorizeRoles('super_admin'), createTeamMember);
router.put('/:id', authorizeRoles('super_admin'), updateTeamMember);
router.delete('/:id', authorizeRoles('super_admin'), deleteTeamMember);
router.patch('/:id/toggle-status', authorizeRoles('super_admin'), toggleTeamMemberStatus);

export default router;