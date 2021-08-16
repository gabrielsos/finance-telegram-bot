import { Balance, BalanceDocument } from './../../../schemas/balance.schema';
import { Salario, SalarioDocument } from './../../../schemas/salario.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { subMonths, addMonths } from 'date-fns';

@Injectable()
export class CalculateBalanceService {
  constructor(
    @InjectModel(Salario.name)
    private salarioRepository: Model<SalarioDocument>,
    @InjectModel(Balance.name)
    private balanceRepository: Model<BalanceDocument>,
  ) {}
  async execute({ customerId, month }) {
    const salario = await this.salarioRepository.findOne({
      customerId,
    });

    const today = new Date();
    let dateToMonths: Date;

    if (!month) {
      dateToMonths = new Date();
    }

    if (month >= 0) {
      dateToMonths = addMonths(today, month);
    }

    if (month < 0) {
      dateToMonths = subMonths(today, Math.abs(month));
    }

    const balance = await this.balanceRepository.find({
      customerId,
      month: dateToMonths.getMonth() + 1,
      year: dateToMonths.getFullYear(),
    });

    let totalIncome = salario.value;
    let totalOutcome = 0;
    const outcome = [];
    const income = [];

    for (const eachBalance of balance) {
      if (eachBalance.type === 'income') {
        totalIncome += eachBalance.value;
        income.push(eachBalance);
      }

      if (eachBalance.type === 'outcome') {
        totalOutcome += eachBalance.value;
        outcome.push(eachBalance);
      }
    }

    return {
      salary: salario.value,
      totalIncome,
      totalOutcome,
      totalAvailable: totalIncome - totalOutcome,
      date: dateToMonths,
      income,
      outcome,
      balance,
    };
  }
}
