import { CreditCardService } from './services/credit-card.service';
import { SalaryService } from './services/salary.service';
import { OutcomeService } from './services/outcome.service';
import { IncomeService } from './services/income.service';
import { CalculateBalanceService } from './services/calculate-balance.service';
import { Balance, BalanceDocument } from './../../schemas/balance.schema';
import { Update, Start, Help, Command } from 'nestjs-telegraf';
import { Context } from '../../interfaces/context.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Update()
export class StartUpdate {
  constructor(
    private calculateBalanceService: CalculateBalanceService,
    private incomeService: IncomeService,
    private outcomeService: OutcomeService,
    private salaryService: SalaryService,
    private creditCardService: CreditCardService,
  ) {}
  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(
      'Para começar envie /help para ver os comandos disponíveis',
    );
  }

  @Help()
  async helpCommand(ctx: Context) {
    await ctx.reply(`
Comece cadastrando seu salário, ele será usado como padrão em todos os meses.
    
Comandos disponiveis: 
  * Registrar salário: /salario [valor]
  * Registrar compra parcelada no cartão de crédito: /cc [valor] [parcelas]
  * Registrar entrada de valor: /income [valor] [*mes]
  * Registrar de valor: /income [valor] [*mes]
  * Listas balanço: /balance [*mes]
      
  [*] = Parametro opcional
  [mes] = Número para acrescentar ou subtrair do mês atual, se não enviado mês atual é o padrão
    `);
  }

  @Command('detailed')
  async commandDetailedBalance(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const month = message.split('detailed')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const { date, salary, totalIncome, totalOutcome, totalAvailable, balance } =
      await this.calculateBalanceService.execute({
        customerId,
        month: Number(month),
      });

    let response = 'Lista de valores';

    for (const eachBalance of balance) {
      console.log(eachBalance);
      response += `
        Tipo: ${eachBalance.type}
        Valor: ${eachBalance.value}
        Descrição: ${eachBalance.description ?? ''}
        Date: ${new Date(eachBalance.createdAt)}
      `;
    }

    console.log(response);

    await ctx.reply(`
      Balance referente a ${date.getMonth() + 1}/${date.getFullYear()}:
      Salário: ${salary}
      Total income: ${totalIncome}
      Total outcome: ${totalOutcome}
      Available: ${totalAvailable}
      `);

    await ctx.reply(response);
  }

  @Command('balance')
  async commandBalance(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const month = message.split('balance')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const { date, salary, totalIncome, totalOutcome, totalAvailable } =
      await this.calculateBalanceService.execute({
        customerId,
        month: Number(month),
      });

    await ctx.reply(`
      Balance referente a ${date.getMonth() + 1}/${date.getFullYear()}:
      Salário: ${salary}
      Total income: ${totalIncome}
      Total outcome: ${totalOutcome}
      Available: ${totalAvailable}
      `);
  }

  @Command('income')
  async commandIncome(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const description = message.split('*')[1];
    const withoutCommand = message.split('income')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const array = withoutCommand.split(' ');

    if (array.length <= 0) {
      await ctx.reply(`Envie o valor do recebimento. Ex: /income 1000`);
      return;
    }

    const { balanceResponse, newIncome, date } =
      await this.incomeService.execute({
        customerId,
        month: array[2] ? array[1] : 0,
        value: array[0],
        description,
      });

    await ctx.reply(`Novo registro de recebimento: ${newIncome.value}`);

    await ctx.reply(`
      Balanço referenta à: ${date.getMonth() + 1}/${date.getFullYear()}:
      Salário: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
      `);
  }

  @Command('outcome')
  async commandOutcome(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const description = message.split('*')[1];
    const withoutCommand = message.split('outcome')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const array = withoutCommand.split(' ');

    if (array.length <= 0) {
      await ctx.reply(`Envie o valor do gasto. Ex: /outcome 1000`);
      return;
    }

    const { balanceResponse, newOutcome, date } =
      await this.outcomeService.execute({
        customerId,
        month: array[2] ? array[1] : 0,
        value: array[0],
        description,
      });

    await ctx.reply(`Novo registro de gasto: ${newOutcome.value}`);

    await ctx.reply(`
    Balanço referenta à: ${date.getMonth() + 1}/${date.getFullYear()}:
      Salário: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
      `);
  }

  @Command('salario')
  async commandSalario(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const salario = Number(message.split('salario')[1]);
    const customerId = ctx.message.from.id;

    if (!salario) {
      await ctx.reply(`Envie o valor do salário. Ex: /salario 1000`);
      return;
    }

    const { balanceResponse, newSalario } = await this.salaryService.execute({
      customerId,
      salario,
    });

    await ctx.reply(`Novo salário registrado: ${newSalario.value}`);
    await ctx.reply(`
      Balance atualizado:
      Salário: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
      `);
  }

  @Command('cc')
  async command(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const description = message.split('*')[1];
    const withoutCommand = message.split('cc')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const [value, installments] = withoutCommand.split(' ');

    if (!value) {
      await ctx.reply(`Envie o valor do gasto. Ex: /cc 1000 1 *Gasto`);
      return;
    }

    if (!installments) {
      await ctx.reply(`Envie o total de parcelas. Ex: /cc 1000 1 *Gasto`);
      return;
    }

    const { balanceResponse, date } = await this.creditCardService.execute({
      customerId,
      installments,
      value,
      description,
    });

    await ctx.reply(`
    Balanço referenta à: ${date.getMonth() + 1}/${date.getFullYear()}:
      Salário: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
    `);
  }
}
