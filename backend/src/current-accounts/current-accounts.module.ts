import { Module } from '@nestjs/common';
import { CurrentAccountsService } from './current-accounts.service';
import { CurrentAccountsController } from './current-accounts.controller';

@Module({
  controllers: [CurrentAccountsController],
  providers: [CurrentAccountsService],
})
export class CurrentAccountsModule {}
