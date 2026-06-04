import type { Request as ExRequest } from 'express';
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa';

import { getCommentsByTaskId, postComment } from '../services/comment.service';
import { ApiResponse, successResponse } from '../utils/response.util';
import { CreateCommentRequest, Comment } from '@nextask/types';

@Route('tasks')
@Tags('Comments')
@Security('jwt')
export class CommentController extends Controller {
  /**
   * Retrieves all comments for a specific task.
   */
  @Get('{taskId}/comments')
  public async getComments(@Path() taskId: string): Promise<ApiResponse<Comment[]>> {
    const comments = await getCommentsByTaskId(taskId);
    return successResponse('Comments retrieved successfully.', comments as any[]);
  }

  /**
   * Posts a new comment to a specific task.
   */
  @Post('{taskId}/comments')
  public async createComment(
    @Path() taskId: string,
    @Body() body: CreateCommentRequest,
    @Request() request: ExRequest,
  ): Promise<ApiResponse<Comment>> {
    const { userId } = (request as any).user;
    const comment = await postComment(userId, taskId, body.content, body.attachments);
    return successResponse('Comment posted successfully.', comment as any);
  }
}
