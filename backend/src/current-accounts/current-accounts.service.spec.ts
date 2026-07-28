import { Test, TestingModule } from '@nestjs/testing';
import { CurrentAccountsService } from './current-accounts.service';

describe('CurrentAccountsService', () => {
  let service: CurrentAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurrentAccountsService],
    }).compile();

    service = module.get<CurrentAccountsService>(CurrentAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
