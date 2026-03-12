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

  @Column({ type: 'int' })
  porcionesPlanificadas: number;

  @Column({ type: 'int' })
  porcionesReales: number;

  @Column({ type: 'int' })
  porcionesDisponibles: number;

  @Column({ type: 'int', default: 0 })
  merma: number;

  @Column({
    type: 'enum',
    enum: EstadoPreparacion,
    default: EstadoPreparacion.ACTIVA,
  })
  estado: EstadoPreparacion;

  @CreateDateColumn()
  fechaPreparacion: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => DetallePreparacion, (detalle) => detalle.preparacion)
  detalles: DetallePreparacion[];
}