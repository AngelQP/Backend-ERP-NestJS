import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/auth/entities/user.entity";
import { Insumo } from "src/insumos/entities/insumo.entity";
import { TipoMovimiento } from "src/insumos/enums/tipo-movimiento-insumo.enum";
import { InventarioInsumo } from "src/inventario-insumo/entities/inventario-insumo.entity";


@Entity('movimientos_insumos')
export class MovimientoInsumo {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    /** Entrada -> Positivo
     * Salida -> Negativo   
     * Ajuste -> Positivo o Negativo
     */
    @Column({
        type: 'enum',
        enum: TipoMovimiento,
        nullable: false
    })
    tipo: TipoMovimiento

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: false
    })
    cantidad: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        // nullable: false
    })
    costoUnitario?: number;

    @Column({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP'
    })
    fecha: Date;

    @Column('text', {
        nullable: true
    })
    motivo?: string | null;

    // Relación con User
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Insumo, { nullable: false })
    @JoinColumn({ name: 'insumo_id'})    
    insumo: Insumo;

    @ManyToOne(() => InventarioInsumo, { nullable: false })
    @JoinColumn({ name: 'inventario_id' })
    inventario: InventarioInsumo;
}
