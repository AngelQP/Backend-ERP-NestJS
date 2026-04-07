import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostreDto } from './dto/create-postre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Postre } from './entities/postre.entity';
import { DataSource, Filter, In, Repository } from 'typeorm';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { RecetaDetalle } from './entities/recetaDetalle.entity';
import { UpdatePostreDto } from './dto/update-postre.dto';
import { FilterPostresDto } from './dto/filter-postre.dto';

@Injectable()
export class PostresService {

  constructor(
    @InjectRepository(Postre)
    private readonly postreRepo: Repository<Postre>,

    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,

    private dataSource: DataSource,
  ){}

  // Crear postre con su receta
  async create(dto: CreatePostreDto, userId: string) {

    try {
      
      return await this.dataSource.transaction(async (manager) => {
  
        // 1 Validar que la receta exista
        if (!dto.receta || dto.receta.length === 0) {
          throw new BadRequestException('La receta no puede estar vacía');
        }
  
        // 2 Extraer ids únicos (evita duplicados)
        const insumoIds = [
          ...new Set(dto.receta.map(r => r.insumo_id))
        ];
  
        // 3 Traer todos los insumos en UNA sola query
        const insumos = await manager.find(Insumo, {
          where: {
            id: In(insumoIds),
            user: { id: userId },
          },
        });
  
        // 4 Validar que todos los insumos existan
        if (insumos.length !== insumoIds.length) {
          throw new NotFoundException(
            'Uno o más insumos no existen o no pertenecen al usuario',
          );
        }
  
        // 5 Crear mapa para acceso rápido (O(1))
        const insumoMap = new Map(
          insumos.map(insumo => [insumo.id, insumo]),
        );
  
        // 6 Crear postre
        const postre = manager.create(Postre, {
          nombrePostre: dto.nombrePostre,
          descripcion: dto.descripcion ?? '',
          precioVentaReferencia: dto.precioVentaReferencia,
          rendimientoBase: dto.rendimientoBase,
          user: { id: userId },
        });
  
        const postreSaved = await manager.save(Postre, postre);
  
        // 7 Crear detalles receta
        const detalles: RecetaDetalle[] = [];
  
        for (const item of dto.receta) {
  
          const insumo = insumoMap.get(item.insumo_id);
  
          if (!insumo) {
            // Seguridad extra (aunque ya validamos arriba)
            throw new NotFoundException(
              `Insumo ${item.insumo_id} no encontrado`,
            );
          }
  
          const detalle = manager.create(RecetaDetalle, {
            postre: postreSaved,
            insumo,
            cantidad: item.cantidad,
          });
  
          detalles.push(detalle);
        }
  
        await manager.save(RecetaDetalle, detalles);
  
        const postreCompleto = await manager.findOne(Postre, {
          where: { id: postreSaved.id },
          relations: {
            receta: {
              insumo: true,
            },
          },
        });
  
        if (!postreCompleto) {
          throw new NotFoundException('Postre no encontrado después de crear');
        }
  
        return this.mapResponse(postreCompleto);
  
      });

    } catch (error) {
      this.handleDBErrors(error);
    }


  }

  // Listar postres con su receta
  async findAll(userId: string, filtro: FilterPostresDto) {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;

    const skip = (page - 1) * limit;

    const qb = this.postreRepo
    .createQueryBuilder('postre')
    .leftJoinAndSelect('postre.receta', 'receta')
    .leftJoinAndSelect('receta.insumo', 'insumo')
    .where('postre.user_id = :userId', { userId })
    .andWhere('postre.activo = true');

    qb.orderBy('postre.nombrePostre', 'ASC');

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const dataTransformada = data.map(postre => 
      this.mapResponse(postre)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: dataTransformada,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // Actualizar postre y su receta
  async update(id: string, dto: UpdatePostreDto, userId: string) {

    try {

      return await this.dataSource.transaction(async (manager) => {

        // 1 Buscar postre
        const postre = await manager.findOne(Postre, {
          where: {
            id,
            user: { id: userId },
            activo: true,
          },
          relations: {
            receta: true,
          },
        });

        if (!postre) {
          throw new NotFoundException('Postre no encontrado');
        }

        // 2 Validar receta
        if (!dto.receta || dto.receta.length === 0) {
          throw new BadRequestException('La receta no puede estar vacía');
        }

        // 3 Extraer ids únicos
        const insumoIds = [
          ...new Set(dto.receta.map(r => r.insumo_id))
        ];

        // 4 Traer insumos en UNA sola query
        const insumos = await manager.find(Insumo, {
          where: {
            id: In(insumoIds),
            user: { id: userId },
          },
        });

        if (insumos.length !== insumoIds.length) {
          throw new NotFoundException(
            'Uno o más insumos no existen o no pertenecen al usuario',
          );
        }

        // 5 Crear mapa O(1)
        const insumoMap = new Map(
          insumos.map(insumo => [insumo.id, insumo]),
        );

        // 6 Actualizar datos base
        postre.nombrePostre = dto.nombrePostre;
        postre.descripcion = dto.descripcion ?? '';
        postre.precioVentaReferencia = dto.precioVentaReferencia;
        postre.rendimientoBase = dto.rendimientoBase;

        await manager.save(Postre, postre);

        // 7 Eliminar receta anterior
        if (postre.receta.length > 0) {
          await manager.remove(RecetaDetalle, postre.receta);
        }

        // 8 Crear nueva receta
        const nuevosDetalles: RecetaDetalle[] = [];

        for (const item of dto.receta) {

          const insumo = insumoMap.get(item.insumo_id);

          if (!insumo) {
            throw new NotFoundException(
              `Insumo ${item.insumo_id} no encontrado`,
            );
          }

          const detalle = manager.create(RecetaDetalle, {
            postre,
            insumo,
            cantidad: item.cantidad,
          });

          nuevosDetalles.push(detalle);
        }

        await manager.save(RecetaDetalle, nuevosDetalles);

        // 9 Traer postre completo actualizado
        const postreActualizado = await manager.findOne(Postre, {
          where: { id: postre.id },
          relations: {
            receta: {
              insumo: true,
            },
          },
        });

        if (!postreActualizado) {
          throw new NotFoundException(
            'Postre no encontrado después de actualizar',
          );
        }

        return this.mapResponse(postreActualizado);

      });

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // Eliminar postre (cascade borra receta)
  async remove(id: string, userId: string) {
    const postre = await this.postreRepo.findOne({
      where: {
        id,
        user: { id: userId },
        activo: true,
      },
    });

    if (!postre) {
      throw new NotFoundException('Postre no encontrado');
    }

    postre.activo = false;

    await this.postreRepo.save(postre);

    return { message: 'Postre eliminado correctamente' };
  }

  //* Metodos privados*

  private handleDBErrors( error: any ): never {

    // 🔥 Si ya es una excepción HTTP, la dejamos pasar
    if (error instanceof HttpException) {
      throw error;
    }
  
    // console.log({error})

    if( error.code === '23505' ) 
    {
      if( error.detail.includes('nombrePostre') ) {
        throw new ConflictException({
          title: 'NOMBRE DE POSTRE YA EXISTE',
          message: 'El nombre de postre ya está registrado.'
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


  private mapResponse(postre: Postre) {
    return {
      id: postre.id,
      nombrePostre: postre.nombrePostre,
      descripcion: postre.descripcion,
      precioVentaReferencia: postre.precioVentaReferencia,
      rendimientoBase: postre.rendimientoBase,
      receta: postre.receta.map(r => ({
        id: r.insumo.id,
        nombre: r.insumo.nombre,
        cantidad: r.cantidad,
      })),
    };
  }
}
