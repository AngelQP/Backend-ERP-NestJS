import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Venta } from './venta.entity';
import { Preparacion } from 'src/preparaciones/entities/preparacione.entity';

@Entity('detalle_venta')
export class DetalleVenta {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  cantidad: number; // porciones vendidas

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precioUnitario: number; // histórico

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: number;

  /** RELACIONES */

  @OneToOne(() => Venta, (venta) => venta.detalle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ManyToOne(() => Preparacion)
  @JoinColumn({ name: 'preparacion_id' })
  preparacion: Preparacion;
}