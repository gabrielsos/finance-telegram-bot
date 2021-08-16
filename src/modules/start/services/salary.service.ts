import { Salario, SalarioDocument } from './../../../schemas/salario.schema';
import { CalculateBalanceService } from './calculate-balance.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class SalaryService {
  constructor(
    @InjectModel(Salario.name)
    private salarioRepository: Model<SalarioDocument>,
    private calculateBalanceService: CalculateBalanceService,
  ) {}
  async execute({ salario, customerId }) {
    const findOldSalario = await this.salarioRepository.findOne({
      customerId,
    });

    if (findOldSalario) {
      await this.salarioRepository.deleteOne({
        customerId,
      });
    }

    const newSalario = await this.salarioRepository.create({
      customerId,
      value: salario,
    });

    const balanceResponse = await this.calculateBalanceService.execute({
      customerId,
      month: 0,
    });

    return { balanceResponse, newSalario };
  }
}
