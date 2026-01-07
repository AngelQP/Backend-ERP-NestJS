import { PartialType } from '@nestjs/mapped-types';
import { CreatePostreDto } from './create-postre.dto';

export class UpdatePostreDto extends PartialType(CreatePostreDto) {}
