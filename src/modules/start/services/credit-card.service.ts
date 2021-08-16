import { CalculateBalanceService } from './calculate-balance.service';
import { Balance, BalanceDocument } from './../../../schemas/balance.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { addMonths } from 'date-fns';
import { Model } from 'mongoose';

@Injectable()
export class CreditCardService {
  constructor(
    @InjectModel(Balance.name)
    private balanceRepository: Model<BalanceDocument>,
    private calculateBalanceService: CalculateBalanceService,
  ) {}
  async execute({ installments, customerId, value, description }) {
    let today = new Date();
    today = addMonths(today, 1);
    const installmentValue = value / installments;

    for (let i = 0; i < installments; i++) {
      const date = addMonths(today, i);

      await this.balanceRepository.create({
        customerId,
        value: installmentValue,
        type: 'outcome',
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        description,
      });
    }

    const balanceResponse = await this.calculateBalanceService.execute({
      customerId,
      month: 0,
    });

    return { balanceResponse, date: today };
  }
}
