import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { CurrentAccountsModule } from './current-accounts/current-accounts.module';
import { QuotesModule } from './quotes/quotes.module';
import { PurchasesModule } from './purchases/purchases.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReturnsModule } from './returns/returns.module';
import { CategoriesModule } from './categories/categories.module';
import { PartBrandsModule } from './part-brands/part-brands.module';
import { VehicleVariantsModule } from './vehicle-variants/vehicle-variants.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, ProductsModule, SalesModule, CurrentAccountsModule, QuotesModule, PurchasesModule, DashboardModule, ReturnsModule, CategoriesModule, PartBrandsModule, VehicleVariantsModule, StockMovementsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
