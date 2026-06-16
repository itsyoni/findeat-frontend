import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
}
