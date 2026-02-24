import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostreDto } from './dto/create-postre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Postre } from './entities/postre.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import { RecetaDetalle } from './entities/recetaDetalle.entity';

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
  async findAll(userId: string) {
    const postres = await this.postreRepo.find({
      where: { user: { id: userId }, activo: true },
      order: { nombrePostre: 'ASC' },
    });

    return postres.map(postre => this.mapResponse(postre) );
  }

  // Actualizar postre y su receta
  async update(id: string, dto: CreatePostreDto, userId: string) {
    const postre = await this.postreRepo.findOne({
      where: {
        id,
        user: { id: userId },
      },
      relations: ['receta'],
    });

    if (!postre) {
      throw new NotFoundException('Postre no encontrado');
    }

    postre.nombrePostre = dto.nombrePostre;
    postre.descripcion = dto.descripcion ? dto.descripcion : null;
    postre.precioVentaReferencia = dto.precioVentaReferencia;
    postre.rendimientoBase = dto.rendimientoBase;

    postre.receta = [];

    postre.receta = await Promise.all(
      dto.receta.map(async (item) => {
        const insumo = await this.insumoRepo.findOne({
          where: {
            id: item.insumo_id,
            user: { id: userId },
          },
        });

        if (!insumo) {
          throw new NotFoundException('Insumo no válido');
        }

        const detalle = new RecetaDetalle();
        detalle.insumo = insumo;
        detalle.cantidad = item.cantidad;

        return detalle;
      }),
    );

    const postreSaved = await this.postreRepo.save(postre);

    return this.mapResponse(postreSaved);
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
