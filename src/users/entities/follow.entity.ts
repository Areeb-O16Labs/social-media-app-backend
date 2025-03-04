import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Follow {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => User)
    follower: string

    @ManyToOne(() => User)
    following: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}