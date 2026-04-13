import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerificationToken } from 'src/verification-token/entities/verification-token.entity';
import { VerificationTokenModule } from 'src/verification-token/verification-token.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],

  imports: [

    ConfigModule,

    VerificationTokenModule,

    TypeOrmModule.forFeature([User]),

    // Evitas escribir @UseGuards(AuthGuard('jwt')) y escribes @UseGuards(AuthGuard())
    PassportModule.register({defaultStrategy: 'jwt'}),

    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => {
        return {
          // secret: process.env.JWT_SECRET, // sin usar configModule ni configService
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1d'
          }
        }
      }
    })

  ],

  exports: [
    TypeOrmModule,
    PassportModule,
    JwtModule
  ]
})
export class AuthModule {}