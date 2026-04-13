import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationToken } from './entities/verification-token.entity';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VerificationTokenService {

  constructor(
    @InjectRepository(VerificationToken)
    private verificationTokenRepository: Repository<VerificationToken>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

     private mailService: MailService,
  ) {}

  // crear token de verificación 
  async createVerificationToken(user: User, type: 'verify' | 'reset'): Promise<void> {

    // ANTI-SPAM 
    const lastToken = await this.verificationTokenRepository.findOne({
      where: { user: { email: user.email }, type },
      order: { createdAt: "DESC" }
    });

    if (lastToken) {
      const now = new Date();

      const diffInSeconds = (now.getTime() - lastToken.createdAt.getTime()) / 1000;

      const secondsLeft = Math.ceil(60 - diffInSeconds);

      if (diffInSeconds < 60) {
        throw new BadRequestException(
          `Espera ${secondsLeft} segundos antes de solicitar otro correo`
        );
      }
    }

    // Invalidar tokens anteriores
    await this.verificationTokenRepository.update(
      { email: user.email, isUsed: false, type },
      { isUsed: true }
    );


    const tokenValue = uuidv4();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const token = this.verificationTokenRepository.create({
      email: user.email,
      token: tokenValue,
      expiresAt,
      user,
      isUsed: false,
      type
    });

    await this.verificationTokenRepository.save(token);

    let url = '';

    // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${tokenValue}`;

    if (type === 'verify') {
      url = `${process.env.FRONTEND_URL}/verify-email/${tokenValue}`;
      await this.mailService.sendVerificationEmail(user.email, url);
    }

    if (type === 'reset') {
      url = `${process.env.FRONTEND_URL}/reset-password/${tokenValue}`;

      await this.mailService.sendResetPasswordEmail(user.email, url);
    }

  }

  // crear token de verificación 
  async resendVerificationToken(email: string, type: 'verify' | 'reset'): Promise<void> {

    // 1. Buscar usuario (ESTO FALTABA)
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new BadRequestException('El usuario no existe');
    }

    // ANTI-SPAM 
    const lastToken = await this.verificationTokenRepository.findOne({
      where: { email, type },
      order: { createdAt: "DESC" }
    });

    if (lastToken) {
      const now = new Date();

      const diffInSeconds = (now.getTime() - lastToken.createdAt.getTime()) / 1000;

      const secondsLeft = Math.ceil(60 - diffInSeconds);

      if (diffInSeconds < 60) {
        throw new BadRequestException(
          `Espera ${secondsLeft} segundos antes de solicitar otro correo`
        );
      }
    }

    // Invalidar tokens anteriores
    await this.verificationTokenRepository.update(
      { email, isUsed: false, type },
      { isUsed: true }
    );


    const tokenValue = uuidv4();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const token = this.verificationTokenRepository.create({
      email,
      token: tokenValue,
      expiresAt,
      user,
      isUsed: false,
      type
    });

    await this.verificationTokenRepository.save(token);

    let url = '';

    // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${tokenValue}`;

    if (type === 'verify') {
      url = `${process.env.FRONTEND_URL}/verify-email/${tokenValue}`;
      await this.mailService.sendVerificationEmail(email, url);
    }

    if (type === 'reset') {
      url = `${process.env.FRONTEND_URL}/reset-password/${tokenValue}`;

      await this.mailService.sendResetPasswordEmail(email, url);
    }

  }

  // validar token
  async validateToken(tokenValue: string): Promise<VerificationToken> {

    const token = await this.verificationTokenRepository.findOne({
      where: {
        token: tokenValue,
        isUsed: false
      },
      relations: ["user"]
    });

    if (!token) {
      throw new BadRequestException("Código inválido");
    }

    if (token.expiresAt < new Date()) {
      throw new BadRequestException({
        title: "TOKEN_EXPIRED",
        message: "El enlace ha expirado"
      });
    }

    return token;
  }

  // marcar token como usado
  async markAsUsed(token: VerificationToken) {

    token.isUsed = true;

    await this.verificationTokenRepository.save(token);
  }

  // verificar email
  async verifyEmail(tokenValue: string) {

    const token = await this.validateToken(tokenValue);

    const user = token.user;

    user.isEmailVerified = true;

    await this.userRepository.save(user);

    await this.markAsUsed(token);

    return {
      message: "Correo verificado correctamente"
    };
  }

  // invalidar todos los tokens de un usuario (ejemplo: al cambiar contraseña)
  async invalidateAllUserTokens(userId: string) {

    await this.verificationTokenRepository.update(
      { user: { id: userId }, isUsed: false },
      { isUsed: true }
    );

  }


}
