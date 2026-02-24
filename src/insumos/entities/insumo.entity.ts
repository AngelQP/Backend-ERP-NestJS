import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UnidadesInsumo } from "../enums/unidades-insumos.enum";
import { User } from "src/auth/entities/user.entity";
import { MovimientoInsumo } from "src/movimiento-insumo/entities/movimiento-insumo.entity";
import { InventarioInsumo } from "src/inventario-insumo/entities/inventario-insumo.entity";

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

    @OneToOne(() => InventarioInsumo, inventario => inventario.insumo)
    inventario: InventarioInsumo;

    @BeforeInsert()
    beforeInsert() {
        this.nombre = this.nombre.toLocaleLowerCase();
    }

}
