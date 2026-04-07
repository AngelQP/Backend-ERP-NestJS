import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { DetalleVenta } from './detalleVenta.entity';
import { User } from 'src/auth/entities/user.entity';
import { EstadoVenta } from '../interfaces/estadoVenta.interface';

@Entity('ventas')
export class Venta {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EstadoVenta,
    default: EstadoVenta.PAGADA,
  })
  estado: EstadoVenta;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  total: number;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  fechaVenta: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  /** RELACIONES */

  @OneToOne(() => DetalleVenta, (detalle) => detalle.venta, {
    cascade: true,
  })
  detalle: DetalleVenta;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}