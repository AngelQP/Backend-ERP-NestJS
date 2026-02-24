import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InventarioInsumo } from './inventario-insumo.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('inventario_lotes')
export class InventarioLote {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventarioInsumo, { nullable: false })
  @JoinColumn({ name: 'inventario_insumo_id' })
  inventario: InventarioInsumo;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  cantidadInicial: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  cantidadDisponible: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  costoUnitario: number;

  @Column('timestamp with time zone', {
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaIngreso: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
