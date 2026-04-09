import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Patch,
  Body,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get("search")
  searchUsers(@Req() req: AuthenticatedRequest, @Query("q") q: string) {
    return this.usersService.searchUsers(req.user.id, q ?? "");
  }

  @Patch("me")
  updateMe(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserDto) {
    return this.usersService.updateUser(req.user.id, body);
  }
}
