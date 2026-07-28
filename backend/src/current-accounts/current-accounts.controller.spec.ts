import { Test, TestingModule } from '@nestjs/testing';
import { CurrentAccountsController } from './current-accounts.controller';

describe('CurrentAccountsController', () => {
  let controller: CurrentAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentAccountsController],
    }).compile();

    controller = module.get<CurrentAccountsController>(CurrentAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
