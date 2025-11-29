import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { BootstrapService } from './bootstrap.service';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { SuccessResponse } from '../../common/api-response/success';
import { BootstrapResponse } from '@shared/types/responses/bootstrap.response';

@Controller('bootstrap')
@UseGuards(JwtAuthGuard)
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Get('init')
  async getAppData(
    @CurrentUser('id') currentUserId: string,
  ): Promise<SuccessResponse<BootstrapResponse>> {
    const appData: BootstrapResponse =
      await this.bootstrapService.getAppInitiationData(currentUserId);

    return new SuccessResponse(
      appData,
      'App initialization data retrieved successfully',
    );
  }
}
