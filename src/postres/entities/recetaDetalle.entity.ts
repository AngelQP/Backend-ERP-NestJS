import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Postre } from './postre.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';

@Entity('receta_detalle')
export class RecetaDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Postre, (postre) => postre.receta, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postre_id' })
  postre: Postre;

  @ManyToOne(() => Insumo, { eager: true })
  @JoinColumn({ name: 'insumo_id' })
  insumo: Insumo;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  cantidad: number;
}