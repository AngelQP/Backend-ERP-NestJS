import { User } from 'src/auth/entities/user.entity';
import { Insumo } from 'src/insumos/entities/insumo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inventario_insumo')
export class InventarioInsumo {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Insumo, { eager: true })
  @JoinColumn({ name: 'insumo_id' })
  insumo: Insumo;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stockActual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costoPromedio?: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actualizadoEn: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
