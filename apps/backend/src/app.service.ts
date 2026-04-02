import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return `'DATABASE_URL:·'` + process.env.DATABASE_URL;
  }
}
