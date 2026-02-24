import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';
import { Repository } from 'typeorm';
import { InsumoResponseDto } from './dto/insumo-response.dto';

@Injectable()
export class InsumosService {

  constructor(
    
    @InjectRepository(Insumo)
    private readonly insumoRepository: Repository<Insumo>,

  ) {}

  // * SERVICIO DE INSUMOS - OK * //
  async create(createInsumoDto: CreateInsumoDto, user_id: string): Promise<InsumoResponseDto> {

    try {
      
      const insumo = this.insumoRepository.create(
        {
          ...createInsumoDto, 
          user: {id: user_id}
        });

      const saved = await this.insumoRepository.save(insumo);

      return {
        id: saved.id,
        nombre: saved.nombre,
        unidad: saved.unidad
      }

    } catch (error) {

      this.handleDBErrors(error);
    }
  }

  // ? No se sabe si se usa este endpoint o no
  async findAll(userId: string): Promise<Insumo[]> {
    return await this.insumoRepository.find({
      where: { 
        activo: true,
        user: { id: userId }
      },
    });
  }

  // * Servicio para buscar un insumo por ID - OK * //
  async findOne(id: string): Promise<Insumo> {
    const insumo = await this.insumoRepository.findOne({
      where: { id },
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo no encontrado`);
    } 
    
    return insumo;
  }

  // * Servicio para actualizar un insumo - OK * //
  async update(id: string, updateInsumoDto: UpdateInsumoDto): Promise<Insumo> {
    const insumo = await this.findOne(id);
    Object.assign(insumo, updateInsumoDto);
    return this.insumoRepository.save(insumo);  
  }

  // * Servicio para eliminar un insumo - OK * //
  async remove(id: string): Promise<void> {
    const insumo = await this.findOne(id);
    insumo.activo = false;
    await this.insumoRepository.save(insumo);
  }

  // Manejo de errores de base de datos
  private handleDBErrors( error: any ): never {

    // console.log({error})

    if( error.code === '23505' ) 
    {
      if( error.table === 'insumos' ) {
        throw new BadRequestException({
          title: 'INSUMO YA EXISTE',
          message: 'El insumo ya está registrado.'
        });
      }

      throw new BadRequestException({
        title: 'UNIQUE_CONSTRAINT_VIOLATION',
        message: 'El registro ya existe.'
      });
    }

    console.log(error);

    throw new InternalServerErrorException('Checa los server logs.')
  }


}
