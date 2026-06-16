import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: Request, @Body() dto: CreatePostDto) {
    const user = req.user as { userId: string; email: string };
    return this.postsService.create(user.userId, dto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMine(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
    };

    return this.postsService.findByUser(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('feed')
  getFeed(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
    };

    return this.postsService.getFeed(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  like(@Param('id') postId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.postsService.like(postId, user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/like')
  unlike(@Param('id') postId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.postsService.unlike(postId, user.userId);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  addComment(
    @Param('id') postId: string,
    @Req() req: Request,
    @Body() body: { content: string },
  ) {
    const user = req.user as { userId: string; email: string };

    return this.postsService.addComment(postId, user.userId, body.content);
  }

  @Get(':id/comments')
  getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }
}
