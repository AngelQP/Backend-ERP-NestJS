import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UnidadesInsumo } from "../enums/unidades-insumos.enum";
import { MovimientoInsumo } from "./movimientoInsumo.entity";
import { User } from "src/auth/entities/user.entity";

@Unique(['nombre','user'])
@Entity('insumos')
export class Insumo {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        nullable: false
    })
    nombre: string;

    @Column({
        type: 'enum',
        enum: UnidadesInsumo,
        nullable: false
    })
    unidad: UnidadesInsumo;

    @Column('boolean', {
        default: true
    })
    activo: boolean;

    @OneToMany(() => MovimientoInsumo, m => m.insumo)
    movimientos: MovimientoInsumo[];

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

}
