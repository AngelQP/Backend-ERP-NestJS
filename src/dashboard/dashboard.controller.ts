import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Auth(ValidRoles.admin)
  @Get('/stats')
  getStats(@GetUser() user: User) {
    return this.dashboardService.getStats(user);
  }

  @Auth(ValidRoles.admin)
  @Get('/chart')
  getIncomeVsExpensesChart(@GetUser() user: User) {
    return this.dashboardService.getIncomeVsExpensesChart(user);
  }

  @Auth(ValidRoles.admin)
  @Get('/top-productos')
  getTopProducts(@GetUser() user: User) {
    return this.dashboardService.getTopProducts(user);
  }

  @Auth(ValidRoles.admin)
  @Get('/ventas-recientes')
  getRecentSales(@GetUser() user: User) {
    return this.dashboardService.getRecentSales(user);
  }


  @Auth(ValidRoles.admin)
  @Get('/inventario')
  getInventoryStats(@GetUser() user: User) {
    return this.dashboardService.getInventoryStats(user);
  }
  
}
