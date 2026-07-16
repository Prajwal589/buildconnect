"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminRepository_1 = require("../repositories/adminRepository");
const apiResponse_1 = require("../utils/apiResponse");
const adminValidator_1 = require("../validators/adminValidator");
class AdminController {
    // Get all pending profiles awaiting verification
    static async getPendingList(_req, res, next) {
        try {
            const verifications = await adminRepository_1.AdminRepository.getPendingVerifications();
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Pending verifications retrieved successfully.', verifications));
        }
        catch (error) {
            next(error);
        }
    }
    // Approve or reject builder/contractor verification profile
    static async reviewProfile(req, res, next) {
        try {
            const entityId = req.params.id;
            const validatedData = adminValidator_1.reviewVerificationSchema.parse(req.body);
            const { entityType, action, remarks } = validatedData;
            const result = await adminRepository_1.AdminRepository.reviewVerification(entityType, entityId, action, remarks);
            const message = action === 'approve'
                ? `${entityType} profile has been successfully approved.`
                : `${entityType} profile has been rejected with logged remarks.`;
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, message, result));
        }
        catch (error) {
            next(error);
        }
    }
    // Get all registered users list
    static async getUsersList(_req, res, next) {
        try {
            const users = await adminRepository_1.AdminRepository.getAllUsers();
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Users retrieved successfully.', users));
        }
        catch (error) {
            next(error);
        }
    }
    // Get all builder projects awaiting admin approval
    static async getPendingProjects(_req, res, next) {
        try {
            const pendingProjects = await adminRepository_1.AdminRepository.getPendingProjectApprovals();
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Pending projects retrieved successfully.', pendingProjects));
        }
        catch (error) {
            next(error);
        }
    }
    // Approve or reject a project submission
    static async reviewProject(req, res, next) {
        try {
            const projectId = req.params.id;
            const validatedData = adminValidator_1.reviewProjectSchema.parse(req.body);
            const { action, remarks } = validatedData;
            const result = await adminRepository_1.AdminRepository.reviewProject(projectId, action, remarks);
            const message = action === 'approve'
                ? 'Project has been approved and published successfully.'
                : 'Project has been rejected and reverted to draft state.';
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, message, result));
        }
        catch (error) {
            next(error);
        }
    }
    // Get all posted reviews list
    static async getReviewsList(_req, res, next) {
        try {
            const reviews = await adminRepository_1.AdminRepository.getAllReviews();
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Reviews retrieved successfully.', reviews));
        }
        catch (error) {
            next(error);
        }
    }
    // Suspend or unsuspend user
    static async setUserSuspension(req, res, next) {
        try {
            const userId = req.params.id;
            const validatedData = adminValidator_1.suspendUserSchema.parse(req.body);
            const { suspend } = validatedData;
            const result = await adminRepository_1.AdminRepository.suspendUser(userId, suspend);
            const msg = suspend ? 'User account has been suspended.' : 'User account has been unsuspended.';
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, msg, result));
        }
        catch (error) {
            next(error);
        }
    }
    // Delete review
    static async removeReview(req, res, next) {
        try {
            const reviewId = req.params.id;
            const result = await adminRepository_1.AdminRepository.deleteReview(reviewId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Review has been successfully deleted.', result));
        }
        catch (error) {
            next(error);
        }
    }
    // Force cancel package
    static async forceCancelPackage(req, res, next) {
        try {
            const packageId = req.params.id;
            const result = await adminRepository_1.AdminRepository.cancelPackage(packageId);
            res.status(200).json((0, apiResponse_1.createApiResponse)(true, 'Work package has been cancelled by administrator.', result));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
exports.default = AdminController;
