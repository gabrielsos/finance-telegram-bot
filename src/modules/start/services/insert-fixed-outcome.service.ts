import {
  FixedOutcome,
  FixedOutcomeDocument,
} from './../../../schemas/fix.schema';
import { CalculateBalanceService } from './calculate-balance.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class InsertFixedOutcomeService {
  constructor(
    @InjectModel(FixedOutcome.name)
    private fixedOutcomeRepository: Model<FixedOutcomeDocument>,
    private calculateBalanceService: CalculateBalanceService,
  ) {}
  async execute({ customerId, value, description }) {
    const newFixedOutcome = await this.fixedOutcomeRepository.create({
      customerId,
      value,
      description,
    });

    const balanceResponse = await this.calculateBalanceService.execute({
      customerId,
      month: 0,
    });

    return { balanceResponse, newFixedOutcome, date: new Date() };
  }
}
