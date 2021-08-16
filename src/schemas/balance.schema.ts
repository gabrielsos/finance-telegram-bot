import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BalanceDocument = Balance & Document;

@Schema({ timestamps: true })
export class Balance {
  @Prop()
  value: number;

  @Prop()
  type: string;

  @Prop()
  customerId: number;

  @Prop()
  month: number;

  @Prop()
  year: number;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BalanceSchema = SchemaFactory.createForClass(Balance);
