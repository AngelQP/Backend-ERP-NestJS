import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Insumo } from './insumo.entity';
import { TipoMovimiento } from "../enums/tipo-movimiento-insumo.enum";
import { User } from "src/auth/entities/user.entity";


@Entity('movimientos_insumos')
export class MovimientoInsumo {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Insumo, { nullable: false })
    @JoinColumn({ name: 'insumo_id'})    
    insumo: Insumo;

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

    @Column('integer', {
        nullable: false
    })
    cantidad: number;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        nullable: false
    })
    costoUnitario: number;

    @Column('timestamp with time zone', {
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
}