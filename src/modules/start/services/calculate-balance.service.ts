import {
  SavedMonth,
  SavedMonthDocument,
} from './../../../schemas/saved-month.schema';
import {
  FixedOutcome,
  FixedOutcomeDocument,
} from './../../../schemas/fix.schema';
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
    @InjectModel(FixedOutcome.name)
    private fixedOutcomeRepository: Model<FixedOutcomeDocument>,
    @InjectModel(SavedMonth.name)
    private savedMonthRepository: Model<SavedMonthDocument>,
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

    const savedValue = await this.savedMonthRepository.findOne({
      customerId,
      month: dateToMonths.getMonth() + 1,
      year: dateToMonths.getFullYear(),
    });

    let balance: BalanceDocument[];
    let fixedOutcome;
    let wage;

    if (savedValue) {
      balance = savedValue.balance;
      fixedOutcome = savedValue.fixedOutcome;
      wage = savedValue.wage;
    } else {
      balance = await this.balanceRepository.find({
        customerId,
        month: dateToMonths.getMonth() + 1,
        year: dateToMonths.getFullYear(),
      });

      fixedOutcome = await this.fixedOutcomeRepository.find({
        customerId,
      });

      console.log('salario.value');
      console.log(salario.value);
      wage = salario.value;
    }

    let totalIncome = wage;
    let totalOutcome = 0;
    const fixedOutcomeArray = [];
    const income = [];

    for (const eachBalance of balance) {
      if (eachBalance.type === 'income') {
        totalIncome += eachBalance.value;
        income.push(eachBalance);
      }

      if (eachBalance.type === 'outcome') {
        totalOutcome += eachBalance.value;
      }
    }

    for (const eachFixedOutcome of fixedOutcome) {
      totalOutcome += eachFixedOutcome.value;
      fixedOutcomeArray.push(eachFixedOutcome);
    }

    return {
      salary: wage,
      totalIncome,
      totalOutcome,
      totalAvailable: totalIncome - totalOutcome,
      date: dateToMonths,
      income,
      fixedOutcomeArray,
      balance,
    };
  }
}
