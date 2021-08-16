import { addMonths, subMonths } from 'date-fns';
import { SavedMonthDocument } from './../../../schemas/saved-month.schema';
import { Balance, BalanceDocument } from './../../../schemas/balance.schema';
import {
  FixedOutcome,
  FixedOutcomeDocument,
} from './../../../schemas/fix.schema';
import { Salario, SalarioDocument } from './../../../schemas/salario.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SavedMonth } from 'src/schemas/saved-month.schema';

@Injectable()
export class SaveMonthService {
  constructor(
    @InjectModel(Salario.name)
    private salarioRepository: Model<SalarioDocument>,
    @InjectModel(FixedOutcome.name)
    private fixedOutcomeRepository: Model<FixedOutcomeDocument>,
    @InjectModel(Balance.name)
    private balanceRepository: Model<BalanceDocument>,
    @InjectModel(SavedMonth.name)
    private savedMonthRepository: Model<SavedMonthDocument>,
  ) {}
  async execute({ customerId, month }) {
    let dateToMonths: Date;
    const today = new Date();

    if (!month) {
      dateToMonths = new Date();
    }

    if (month >= 0) {
      dateToMonths = addMonths(today, month);
    }

    if (month < 0) {
      dateToMonths = subMonths(today, Math.abs(month));
    }

    const wage = await this.salarioRepository.findOne({
      customerId,
    });

    const fixedOutcome = await this.fixedOutcomeRepository.find({
      customerId,
    });

    const balance = await this.balanceRepository.find({
      customerId,
      month: dateToMonths.getMonth() + 1,
      year: dateToMonths.getFullYear(),
    });

    const insertedSavedValue = await this.savedMonthRepository.create({
      balance,
      fixedOutcome,
      wage: wage.value,
      month: dateToMonths.getMonth() + 1,
      year: dateToMonths.getFullYear(),
      customerId,
    });

    return insertedSavedValue;
  }
}
