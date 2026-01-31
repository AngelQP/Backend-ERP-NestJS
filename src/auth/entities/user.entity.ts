import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn, 
    UpdateDateColumn,
    Entity, 
    PrimaryGeneratedColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany, 
} from "typeorm";
import { ValidRoles } from "../interfaces";
import { Insumo } from "src/insumos/entities/insumo.entity";
import { MovimientoInsumo } from "src/insumos/entities/movimientoInsumo.entity";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
        nullable: false
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text', {
        nullable: false
    })
    name: string;

    @Column('text', {
        nullable: false
    })
    lastName: string;

    @Column('text', {
        unique: true
    })
    phone: string;

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @Column({
        type: 'enum',
        enum: ValidRoles,
        array: true,
        default: [ValidRoles.admin]
    })
    roles: ValidRoles[];

    @CreateDateColumn({
        select: false
    })
    createdAt: Date;

    @UpdateDateColumn({
        select: false
    })
    updatedAt: Date;

    @DeleteDateColumn({
        select: false
    })
    deletedAt: Date;

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLocaleLowerCase().trim();
        this.phone = this.phone.trim();
    }

    @BeforeUpdate()
    checkFieldBeforeUpdate() {
        this.checkFieldsBeforeInsert();
    }

}     