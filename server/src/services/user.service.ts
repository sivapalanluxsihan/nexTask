import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiError.util';
import { prisma } from '../lib/prisma';

// Define the interfaces needed by the service
export interface UserProfile {
  id: string;
  name: string | null; // <-- Changed to support null from the database
  email: string;
  avatarUrl: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export class UserService {
  /**
   * Returns a user profile by ID
   */
  public async getProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    if (!user) throw new ApiError(404, 'User not found.');
    return user;
  }

  /**
   * Updates a user profile
   */
  public async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    return user;
  }

  /**
   * Changes a user password
   */
  public async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    return;
  }

  /**
   * Returns a list of projects a user belongs to
   */
  public async getUserProjects(userId: string): Promise<any[]> {
    return prisma.projectMember.findMany({
      where: { userId },
      include: { project: true },
    });
  }

  /**
   * USER AUTOCOMPLETE SEARCH (Task 3.4)
   */
  public async searchUsersAutocomplete(search: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      take: 10,
    });
  }
}