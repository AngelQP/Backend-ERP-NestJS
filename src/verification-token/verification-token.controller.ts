import { Controller, Post, Body } from '@nestjs/common';
import { VerificationTokenService } from './verification-token.service';

@Controller('verification-token')
export class VerificationTokenController {

  constructor(
    private readonly verificationTokenService: VerificationTokenService
  ) {}

  // @Post("send-verification")
  // async sendCode(
  //   @Body("email") email: string
  // ) {
  //   await this.verificationTokenService.createVerificationToken(email);

  //   return {
  //     message: "Código de verificación generado"
  //   };
  // }

  @Post("verify-email")
  async verifyEmail(
    @Body("token") token: string,
  ) {
    return await this.verificationTokenService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resend(@Body('email') email: string) {
    return await this.verificationTokenService.resendVerificationToken(email, 'verify');
  }

}
