import { CalculateBalanceService } from './calculate-balance.service';
import { Balance, BalanceDocument } from './../../../schemas/balance.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { subMonths, addMonths } from 'date-fns';
import { Model } from 'mongoose';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Balance.name)
    private balanceRepository: Model<BalanceDocument>,
    private calculateBalanceService: CalculateBalanceService,
  ) {}
  async execute({ month, customerId, value, description }) {
    let incomeDate: Date;

    const today = new Date();

    if (!month) {
      incomeDate = new Date();
    }

    if (month >= 0) {
      incomeDate = addMonths(today, month);
    }

    if (month < 0) {
      incomeDate = subMonths(today, Math.abs(month));
    }

    const newIncome = await this.balanceRepository.create({
      customerId,
      value,
      type: 'income',
      month: incomeDate.getMonth() + 1,
      year: incomeDate.getFullYear(),
      description,
    });

    const balanceResponse = await this.calculateBalanceService.execute({
      customerId,
      month,
    });

    return { balanceResponse, newIncome, date: incomeDate };
  }
}
