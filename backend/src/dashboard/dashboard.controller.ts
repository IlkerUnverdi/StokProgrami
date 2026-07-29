import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Roles('Admin', 'Mudur')
@UseGuards(JwtGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('sales-daily')
  getSalesDaily(@Query('date') date?: string) {
  return this.dashboardService.getSalesDaily(date);
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: string) {
    return this.dashboardService.getLowStockProducts(
      threshold ? Number(threshold) : 5,
    );
  }

  @Get('recent-sales')
  getRecentSales() {
    return this.dashboardService.findRecentSales();
  }

  @Get('recent-purchases')
  getRecentPurchases() {
    return this.dashboardService.findRecentPurchases();
  }

  @Get('recent-payments')
  getRecentPayments() {
    return this.dashboardService.findRecentPayments();
  }
}
