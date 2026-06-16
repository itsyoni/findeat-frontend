import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.usersService.me(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateMe(
    @Req() req: Request,
    @Body() body: { username?: string; bio?: string; avatarUrl?: string },
  ) {
    const user = req.user as { userId: string; email: string };

    return this.usersService.updateMe(user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  search(@Query('q') query: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.usersService.search(query || '', user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/follow')
  follow(@Param('id') targetUserId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.usersService.follow(user.userId, targetUserId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/follow')
  unfollow(@Param('id') targetUserId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.usersService.unfollow(user.userId, targetUserId);
  }

  @Get(':id/followers')
  followers(@Param('id') userId: string) {
    return this.usersService.followers(userId);
  }

  @Get(':id/following')
  following(@Param('id') userId: string) {
    return this.usersService.following(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') userId: string, @Req() req: Request) {
    const user = req.user as { userId: string; email: string };

    return this.usersService.findOne(userId, user.userId);
  }
}
