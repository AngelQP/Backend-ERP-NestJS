import { PartialType } from '@nestjs/mapped-types';
import { CreateVerificationTokenDto } from './create-verification-token.dto';

export class UpdateVerificationTokenDto extends PartialType(CreateVerificationTokenDto) {}
