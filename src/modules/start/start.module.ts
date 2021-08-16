import { DeleteFixedOutcomeService } from './services/delete-fixed-outcome.service';
import { ListFixedOutcomeService } from './services/list-fixed-outcome.service';
import { InsertFixedOutcomeService } from './services/insert-fixed-outcome.service';
import { FixedOutcome, FixedOutcomeSchema } from './../../schemas/fix.schema';
import { CreditCardService } from './services/credit-card.service';
import { SalaryService } from './services/salary.service';
import { OutcomeService } from './services/outcome.service';
import { IncomeService } from './services/income.service';
import { CalculateBalanceService } from './services/calculate-balance.service';
import { Balance, BalanceSchema } from './../../schemas/balance.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Salario, SalarioSchema } from './../../schemas/salario.schema';
import { Module } from '@nestjs/common';
import { StartUpdate } from './start.update';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Salario.name,
        schema: SalarioSchema,
      },
      {
        name: Balance.name,
        schema: BalanceSchema,
      },
      {
        name: FixedOutcome.name,
        schema: FixedOutcomeSchema,
      },
    ]),
  ],
  providers: [
    StartUpdate,
    CalculateBalanceService,
    IncomeService,
    OutcomeService,
    SalaryService,
    CreditCardService,
    InsertFixedOutcomeService,
    ListFixedOutcomeService,
    DeleteFixedOutcomeService,
  ],
})
export class StartModule {}
