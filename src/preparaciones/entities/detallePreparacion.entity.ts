import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Preparacion } from './preparacione.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';


@Entity('detalle_preparacion')
export class DetallePreparacion {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  preparacionId: string;

  @Column('uuid')
  insumoId: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  cantidadUsada: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  costoUnitario: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  subtotal: number;

  @CreateDateColumn()
  createdAt: Date;

  /** RELACIONES */

  @ManyToOne(() => Preparacion, (preparacion) => preparacion.detalles)
  @JoinColumn({ name: 'preparacionId' })
  preparacion: Preparacion;

  @ManyToOne(() => Insumo)
  @JoinColumn({ name: 'insumoId' })
  insumo: Insumo;
}