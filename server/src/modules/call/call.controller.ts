import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';
import { SuccessResponse } from 'src/common/api-response/success';
import { ErrorResponse } from 'src/common/api-response/errors';
import { CallResponseDto } from './dto/call-response.dto';

@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get('pending')
  async getPendingCalls(): Promise<SuccessResponse<CallResponseDto[]>> {
    try {
      const calls = await this.callService.getPendingCalls();
      return new SuccessResponse(
        plainToInstance(CallResponseDto, calls),
        'Pending calls retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve pending calls');
    }
  }

  // POST /api/calls
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCall(
    @Body() createCallDto: CreateCallDto,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const call = await this.callService.createCall(createCallDto);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, call),
        'Call created successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to create call');
    }
  }

  // GET /api/calls/:id
  @Get(':id')
  async getCall(
    @Param('id') id: string,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const call = await this.callService.getCallById(id);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, call),
        'Call retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve call');
    }
  }

  // GET /api/calls/chat/:chatId
  @Get('chat/:chatId')
  async getCallsByChat(
    @Param('chatId') chatId: string,
  ): Promise<SuccessResponse<CallResponseDto[]>> {
    try {
      const calls = await this.callService.getCallsByChatId(chatId);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, calls),
        'Calls retrieved successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to retrieve calls by chat');
    }
  }

  // PATCH /api/calls/:id
  @Patch(':id')
  async updateCall(
    @Param('id') id: string,
    @Body() updateCallDto: UpdateCallDto,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const updated = await this.callService.updateCall(id, updateCallDto);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, updated),
        'Call updated successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to update call');
    }
  }

  // POST /api/calls/:id/join
  @Post(':id/join')
  async joinCall(
    @Param('id') id: string,
    @Body('participantId') participantId: string,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const updated = await this.callService.joinCall(id, participantId);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, updated),
        'Joined call successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to join call');
    }
  }

  // POST /api/calls/:id/end
  @Post(':id/end')
  async endCall(
    @Param('id') id: string,
  ): Promise<SuccessResponse<CallResponseDto>> {
    try {
      const ended = await this.callService.endCall(id);
      return new SuccessResponse(
        plainToInstance(CallResponseDto, ended),
        'Call ended successfully',
      );
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to end call');
    }
  }

  // DELETE /api/calls/:id
  @Delete(':id')
  async deleteCall(@Param('id') id: string): Promise<SuccessResponse<null>> {
    try {
      await this.callService.deleteCall(id);
      return new SuccessResponse(null, 'Call deleted successfully');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to delete call');
    }
  }

  // POST /api/calls/token
  @Post('token')
  async getLivekitToken(
    @Body()
    body: {
      roomName: string;
      memberId: string;
      participantName?: string;
    },
  ): Promise<SuccessResponse<{ token: string }>> {
    try {
      const { roomName, memberId, participantName } = body;
      const token = await this.callService.generateLivekitToken(
        roomName,
        memberId,
        participantName,
      );
      return new SuccessResponse({ token }, 'LiveKit token generated');
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Failed to generate LiveKit token');
    }
  }
}
