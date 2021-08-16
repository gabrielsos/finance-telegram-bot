import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FixedOutcomeDocument = FixedOutcome & Document;

@Schema({ timestamps: true })
export class FixedOutcome {
  @Prop()
  value: number;

  @Prop()
  customerId: number;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const FixedOutcomeSchema = SchemaFactory.createForClass(FixedOutcome);
