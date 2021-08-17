import { SaveMonthService } from './services/save-month.service';
import { ResetService } from './services/reset.service';
import { DeleteFixedOutcomeService } from './services/delete-fixed-outcome.service';
import { ListFixedOutcomeService } from './services/list-fixed-outcome.service';
import { InsertFixedOutcomeService } from './services/insert-fixed-outcome.service';
import { CreditCardService } from './services/credit-card.service';
import { SalaryService } from './services/salary.service';
import { OutcomeService } from './services/outcome.service';
import { IncomeService } from './services/income.service';
import { CalculateBalanceService } from './services/calculate-balance.service';
import { Update, Start, Help, Command } from 'nestjs-telegraf';
import { Context } from '../../interfaces/context.interface';

@Update()
export class StartUpdate {
  constructor(
    private calculateBalanceService: CalculateBalanceService,
    private incomeService: IncomeService,
    private outcomeService: OutcomeService,
    private salaryService: SalaryService,
    private creditCardService: CreditCardService,
    private insertFixedOutcomeService: InsertFixedOutcomeService,
    private listFixedOutcomeService: ListFixedOutcomeService,
    private deleteFixedOutcomeService: DeleteFixedOutcomeService,
    private resetService: ResetService,
    private saveMonthService: SaveMonthService,
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
Comece cadastrando seu Wage, ele será usado como padrão em todos os meses.
    
Comandos disponiveis: 
  * Registrar Wage: /salario [valor]
  * Registrar compra parcelada no cartão de crédito: /cc [valor] [parcelas]
  * Registrar entrada de valor: /income [valor] [*mes]
  * Registrar saída de valor: /outcome [valor] [*mes]
  * Registrar valor fixo: /fixed [valor] [*mes]
  * Listas Balance: /balance [*mes]
      
  [*] = Parametro opcional
  [mes] = Número para acrescentar ou subtrair do mês atual, se não enviado mês atual é o padrão
    `);
  }

  @Command('commands')
  async commands(ctx) {
    await ctx.reply(`
      Lista de comandos disponíveis:
      * reset: Reseta todos os dados, exceto dados de mês salvos pelo comando 'save'
      * save: Finaliza os dados do mês e salva os valores
      * detailed: Lista o balanço atualizado do mês
      * fixed: Adiciona um valor como gasto fixo mensal
      * listfixed: Lista todos os gastos fixos cadastrados
      * unfixoutcome: Remove um valor da lista de gastos fixos
      * balance: Mostra o balanço resumido do mês
      * income: Registra um novo valor de entrada
      * outcome: Registra um novo valor de saída
      * salario: Cadastra o salário para ser usado no balanço mensal
      * cc: Cadastra uma compra no cartão de crédito com o valor das parcelas a partir do próximo mês
    `);
  }

  @Command('reset')
  async reset(ctx) {
    const customerId = ctx.message.from.id;
    await this.resetService.execute({ customerId });

    await ctx.reply('Dados resetados');
  }

  @Command('save')
  async commandSave(ctx) {
    const customerId = ctx.message.from.id;
    const month = ctx.message.text.split('save')[1];

    await this.saveMonthService.execute({ customerId, month });

    await ctx.reply(`Dados do mês ${month} finalizados`);
  }

  @Command('detailed')
  async commandDetailedBalance(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const month = message.split('detailed')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const {
      date,
      salary,
      totalIncome,
      totalOutcome,
      totalAvailable,
      balance,
      fixedOutcomeArray,
    } = await this.calculateBalanceService.execute({
      customerId,
      month: Number(month),
    });

    let response = 'Balance list';

    for (const eachBalance of balance) {
      response += `
        Type: ${eachBalance.type}
        Value: ${eachBalance.value}
        Description: ${eachBalance.description ?? ''}
        Date: ${new Date(eachBalance.createdAt)}
      `;
    }

    for (const eachfixedOutcome of fixedOutcomeArray) {
      response += `
        Type: fixed outcome
        Value: ${eachfixedOutcome.value}
        Description: ${eachfixedOutcome.description ?? ''}
        Date: ${new Date(eachfixedOutcome.createdAt)}
      `;
    }

    await ctx.reply(`
      Balance regarding to ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${salary}
      Total income: ${totalIncome}
      Total outcome: ${totalOutcome}
      Available: ${totalAvailable}
      `);

    await ctx.reply(response);
  }

  @Command('listfixed')
  async commandListFixedOutcome(ctx) {
    const customerId = ctx.message.from.id;

    const list = await this.listFixedOutcomeService.execute({
      customerId,
    });

    let response = 'Fixed outcome list:';

    for (const eachList of list) {
      response += `
        ID: ${eachList.id}
        Type: outcome
        Value: ${eachList.value}
        Description: ${eachList.description ?? ''}
        Date: ${new Date(eachList.createdAt)}
      `;
    }

    await ctx.reply(response);
  }

  @Command('fixed')
  async commandFixedOutcome(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const description = message.split('*')[1];
    const withoutCommand = message.split('fixed')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    const array = withoutCommand.split(' ');

    const { date, balanceResponse } =
      await this.insertFixedOutcomeService.execute({
        customerId,
        description,
        value: array[0],
      });

    await ctx.reply(`
      Balance regarding to ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
      `);
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
      Balance regarding to ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${salary}
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
      Balance regarding to: ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${balanceResponse.salary}
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
    Balance regarding to: ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
      `);
  }

  @Command('unfixoutcome')
  async commandUnfixOutcome(ctx) {
    const message = ctx.message.text.replace(',', '.');
    const id = message.split('unfixoutcome')[1].replace(/^./, '');
    const customerId = ctx.message.from.id;

    if (!id) {
      await ctx.reply(
        `Envie o id do fixed outcome. Ex: /unfixoutcome dasda1sd51a5d1`,
      );
      return;
    }

    const { balanceResponse, date } =
      await this.deleteFixedOutcomeService.execute({
        customerId,
        id,
      });

    await ctx.reply(`Fixed outcome deleted`);

    await ctx.reply(`
      Balance regarding to ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${balanceResponse.salary}
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
      await ctx.reply(`Envie o valor do Wage. Ex: /salario 1000`);
      return;
    }

    const { balanceResponse, newSalario } = await this.salaryService.execute({
      customerId,
      salario,
    });

    await ctx.reply(`Novo Wage registrado: ${newSalario.value}`);
    await ctx.reply(`
      Balance atualizado:
      Wage: ${balanceResponse.salary}
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
    Balance regarding to: ${date.getMonth() + 1}/${date.getFullYear()}:
      Wage: ${balanceResponse.salary}
      Total income: ${balanceResponse.totalIncome}
      Total outcome: ${balanceResponse.totalOutcome}
      Available: ${balanceResponse.totalAvailable}
    `);
  }
}
