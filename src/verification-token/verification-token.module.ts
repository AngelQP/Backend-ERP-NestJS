import { Module } from '@nestjs/common';
import { VerificationTokenService } from './verification-token.service';
import { VerificationTokenController } from './verification-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationToken } from './entities/verification-token.entity';
import { User } from 'src/auth/entities/user.entity';
// import { MailModule } from 'src/mail/mail.module';

@Module({

  imports: [
    TypeOrmModule.forFeature([VerificationToken, User]),
    // MailModule, // importamos el módulo de mail para enviar correos
  ], 
  controllers: [VerificationTokenController],
  providers: [VerificationTokenService],
  exports: [
    VerificationTokenService // exportamos el servicio para usarlo en otros módulos
  ],
})
export class VerificationTokenModule {}
