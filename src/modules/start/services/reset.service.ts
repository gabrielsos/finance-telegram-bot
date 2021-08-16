import { Balance, BalanceDocument } from './../../../schemas/balance.schema';
import {
  FixedOutcome,
  FixedOutcomeDocument,
} from './../../../schemas/fix.schema';
import { Salario, SalarioDocument } from './../../../schemas/salario.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class ResetService {
  constructor(
    @InjectModel(Salario.name)
    private salarioRepository: Model<SalarioDocument>,
    @InjectModel(FixedOutcome.name)
    private fixedOutcomeRepository: Model<FixedOutcomeDocument>,
    @InjectModel(Balance.name)
    private balanceRepository: Model<BalanceDocument>,
  ) {}
  async execute({ customerId }) {
    await this.salarioRepository.deleteOne({
      customerId,
    });

    await this.fixedOutcomeRepository.deleteMany({
      customerId,
    });

    await this.balanceRepository.deleteMany({
      customerId,
    });
  }
}
