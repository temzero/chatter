import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CallService } from './call.service';
import { CreateCallDto } from './dtos/create-call.dto';
import { EndCallDto } from './dtos/end-call.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { User } from '../user/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Calls')
@ApiBearerAuth()
@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post()
  async createCall(
    @Body() createCallDto: CreateCallDto,
    @CurrentUser() user: User,
  ) {
    return this.callService.initiateCall(createCallDto, user.id);
  }

  @Post(':id/end')
  async endCall(
    @Param('id', ParseUUIDPipe) callId: string,
    @Body() endCallDto: EndCallDto,
    @CurrentUser() user: User,
  ) {
    return this.callService.endCall(callId, user.id, endCallDto.duration);
  }

  @Get('chat/:chatId')
  async getCallHistory(
    @Param('chatId', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: User,
  ) {
    return this.callService.getCallHistory(chatId, user.id);
  }

  @Get(':id')
  async getCallDetails(
    @Param('id', ParseUUIDPipe) callId: string,
    @CurrentUser() user: User,
  ) {
    return this.callService.getCallDetails(callId, user.id);
  }

  @Delete(':id')
  async deleteCallRecord(
    @Param('id', ParseUUIDPipe) callId: string,
    @CurrentUser() user: User,
  ) {
    return this.callService.deleteCallRecord(callId, user.id);
  }
}
