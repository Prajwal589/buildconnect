import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ProjectRepository } from '../repositories/projectRepository';
import { createApiResponse } from '../utils/apiResponse';
import {
  createProjectSchema,
  updateProjectSchema,
  updateProjectStatusSchema
} from '../validators/projectValidator';

export class ProjectController {
  // Create project along with packages atomically
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const validatedData = createProjectSchema.parse(req.body);
      const { packages, site_images, ...projectDetails } = validatedData;

      const createdProject = await ProjectRepository.createProject(
        builderId,
        projectDetails as any,
        packages as any[],
        site_images as any[]
      );

      res.status(201).json(
        createApiResponse(true, 'Project posted successfully.', createdProject)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all projects posted by the logged-in builder
  static async getBuilderProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      const projects = await ProjectRepository.getBuilderProjects(builderId);
      res.status(200).json(
        createApiResponse(true, 'Builder projects retrieved successfully.', projects)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get project detailed page (with packages)
  static async getDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const projectId = req.params.id;

      const project = await ProjectRepository.getProjectDetails(projectId);
      if (!project) {
        res.status(404).json(createApiResponse(false, 'Project not found.'));
        return;
      }

      // Security Check: If project is in 'draft' or 'pending_approval', restrict access to the builder owner or admins only
      if (['draft', 'pending_approval'].includes(project.status) && project.builder_id !== userId && req.user?.role !== 'admin') {
        res.status(403).json(createApiResponse(false, 'Access denied. Project visibility is restricted until it is published.'));
        return;
      }

      res.status(200).json(
        createApiResponse(true, 'Project details retrieved successfully.', project)
      );
    } catch (error) {
      next(error);
    }
  }

  // Edit project details
  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      const projectId = req.params.id;

      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      // Verify owner
      const project = await ProjectRepository.getProjectDetails(projectId);
      if (!project) {
        res.status(404).json(createApiResponse(false, 'Project not found.'));
        return;
      }

      if (project.builder_id !== builderId) {
        res.status(403).json(createApiResponse(false, 'Access denied. You do not own this project.'));
        return;
      }

      const validatedData = updateProjectSchema.parse(req.body);
      const updatedProject = await ProjectRepository.updateProject(projectId, validatedData);

      res.status(200).json(
        createApiResponse(true, 'Project updated successfully.', updatedProject)
      );
    } catch (error) {
      next(error);
    }
  }

  // Transition status (archive, publish draft, etc.)
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const builderId = req.user?.userId;
      const projectId = req.params.id;

      if (!builderId) {
        res.status(401).json(createApiResponse(false, 'Unauthorized.'));
        return;
      }

      // Verify owner
      const project = await ProjectRepository.getProjectDetails(projectId);
      if (!project) {
        res.status(404).json(createApiResponse(false, 'Project not found.'));
        return;
      }

      if (project.builder_id !== builderId) {
        res.status(403).json(createApiResponse(false, 'Access denied. You do not own this project.'));
        return;
      }

      const validatedData = updateProjectStatusSchema.parse(req.body);
      
      // Update status
      const updatedProject = await ProjectRepository.updateProjectStatus(projectId, validatedData.status);

      res.status(200).json(
        createApiResponse(true, `Project status transitioned to ${validatedData.status} successfully.`, updatedProject)
      );
    } catch (error) {
      next(error);
    }
  }
}
export default ProjectController;
