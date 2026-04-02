import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

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
}
