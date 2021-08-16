import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SavedMonthDocument = SavedMonth & Document;

@Schema({ timestamps: true })
export class SavedMonth {
  @Prop()
  wage: number;

  @Prop()
  fixedOutcome: [];

  @Prop()
  balance: [];

  @Prop()
  year: number;

  @Prop()
  month: number;

  @Prop()
  customerId: number;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SavedMonthSchema = SchemaFactory.createForClass(SavedMonth);
