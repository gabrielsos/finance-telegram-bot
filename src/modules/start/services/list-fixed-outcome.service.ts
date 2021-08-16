import {
  FixedOutcome,
  FixedOutcomeDocument,
} from './../../../schemas/fix.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ListFixedOutcomeService {
  constructor(
    @InjectModel(FixedOutcome.name)
    private fixedOutcomeRepository: Model<FixedOutcomeDocument>,
  ) {}
  async execute({ customerId }) {
    const newFixedOutcome = await this.fixedOutcomeRepository.find({
      customerId,
    });

    return newFixedOutcome;
  }
}
