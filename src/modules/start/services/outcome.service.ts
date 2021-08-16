import { CalculateBalanceService } from './calculate-balance.service';
import { Balance, BalanceDocument } from './../../../schemas/balance.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { subMonths, addMonths } from 'date-fns';
import { Model } from 'mongoose';

@Injectable()
export class OutcomeService {
  constructor(
    @InjectModel(Balance.name)
    private balanceRepository: Model<BalanceDocument>,
    private calculateBalanceService: CalculateBalanceService,
  ) {}
  async execute({ month, customerId, value, description }) {
    let outcomeDate: Date;

    const today = new Date();
    if (!month) {
      outcomeDate = new Date();
    }

    if (month >= 0) {
      outcomeDate = addMonths(today, month);
    }

    if (month < 0) {
      outcomeDate = subMonths(today, Math.abs(month));
    }

    const newOutcome = await this.balanceRepository.create({
      customerId,
      value,
      type: 'outcome',
      month: outcomeDate.getMonth() + 1,
      year: outcomeDate.getFullYear(),
      description,
    });

    const balanceResponse = await this.calculateBalanceService.execute({
      customerId,
      month,
    });

    return { balanceResponse, newOutcome, date: outcomeDate };
  }
}
