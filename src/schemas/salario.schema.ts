import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalarioDocument = Salario & Document;

@Schema({ timestamps: true })
export class Salario {
  @Prop()
  value: number;

  @Prop()
  customerId: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SalarioSchema = SchemaFactory.createForClass(Salario);
