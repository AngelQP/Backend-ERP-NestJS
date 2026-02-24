import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
  Unique,
  BeforeInsert,
  DeleteDateColumn,
} from 'typeorm';
import { RecetaDetalle } from './recetaDetalle.entity';
import { User } from 'src/auth/entities/user.entity';

@Unique(['nombrePostre','user'])
@Entity('postres')
export class Postre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombrePostre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioVentaReferencia: number;

  @Column({ type: 'int' })
  rendimientoBase: number; // Ej: 10 porciones

  @Column({
    default: true,
  })
  activo: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => RecetaDetalle,
    (detalle) => detalle.postre,
    {
      cascade: true,
      eager: true, // trae receta automáticamente
    },
  )
  receta: RecetaDetalle[];


  @BeforeInsert()
  beforeInsert() {
      this.nombrePostre = this.nombrePostre.toLocaleLowerCase();
  }
}