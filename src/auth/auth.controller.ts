import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticationDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerData: AuthenticationDto) {
    const registered = await this.authService.register(registerData);
    return registered;
  }

  @Post('/login')
  async login(@Body() loginData: AuthenticationDto) {
    const loginResponse = await this.authService.login(loginData);
    return loginResponse;
  }
}
