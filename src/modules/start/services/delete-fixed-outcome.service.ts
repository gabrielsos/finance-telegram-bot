import {
  FixedOutcome,
  FixedOutcomeDocument,
} from './../../../schemas/fix.schema';
import { CalculateBalanceService } from './calculate-balance.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class DeleteFixedOutcomeService {
  constructor(
    @InjectModel(FixedOutcome.name)
    private fixedOutcomeRepository: Model<FixedOutcomeDocument>,
    private calculateBalanceService: CalculateBalanceService,
  ) {}
  async execute({ id, customerId }) {
    await this.fixedOutcomeRepository.deleteOne({
      _id: id,
    });

    const balanceResponse = await this.calculateBalanceService.execute({
      customerId,
      month: 0,
    });

    return { balanceResponse, date: new Date() };
  }
}
