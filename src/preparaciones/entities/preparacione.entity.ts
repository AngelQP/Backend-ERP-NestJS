import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Postre } from 'src/postres/entities/postre.entity';
import { User } from 'src/auth/entities/user.entity';
import { EstadoPreparacion } from '../interfaces/preparaciones.type';
import { DetallePreparacion } from './detallePreparacion.entity';

@Entity('preparaciones')
export class Preparacion {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Postre, { eager: true })
  @JoinColumn({ name: 'postre_id' })
  postre: Postre;

  
  /** Las que viene de postres si son el doble o factor mayor a 1.0 toma como referencia para consumo de insumos */
  @Column({ type: 'int' })
  porcionesPlanificadas: number;

  /** Son las que salen de verdad ya que puede en el proceso perderse 1 la cual se toma como merma */
  @Column({ type: 'int' })
  porcionesReales: number;

  /** Son las reales - venta */
  @Column({ type: 'int' })
  porcionesDisponibles: number;

  /** Son las planificadas menos las reales */
  @Column({ type: 'int', default: 0 })
  merma: number;

  @Column({
    type: 'enum',
    enum: EstadoPreparacion,
    default: EstadoPreparacion.ACTIVA,
  })
  estado: EstadoPreparacion;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP'
  })
  fechaPreparacion: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DetallePreparacion, (detalle) => detalle.preparacion)
  detalles: DetallePreparacion[];
}