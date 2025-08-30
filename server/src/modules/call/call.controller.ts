import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CallService } from './call.service';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Controller('calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  // POST /api/calls
  @Post()
  createCall(@Body() createCallDto: CreateCallDto) {
    return this.callService.createCall(createCallDto);
  }

  // GET /api/calls/:id
  @Get(':id')
  getCall(@Param('id') id: string) {
    return this.callService.getCallById(id);
  }

  // GET /api/calls/chat/:chatId
  @Get('chat/:chatId')
  getCallsByChat(@Param('chatId') chatId: string) {
    return this.callService.getCallsByChatId(chatId);
  }

  // PATCH /api/calls/:id
  @Patch(':id')
  updateCall(@Param('id') id: string, @Body() updateCallDto: UpdateCallDto) {
    return this.callService.updateCall(id, updateCallDto);
  }

  // POST /api/calls/:id/join
  @Post(':id/join')
  joinCall(@Param('id') id: string, @Body() participantId: string) {
    return this.callService.joinCall(id, participantId);
  }

  // POST /api/calls/:id/end
  @Post(':id/end')
  endCall(@Param('id') id: string) {
    return this.callService.endCall(id);
  }

  // DELETE /api/calls/:id
  @Delete(':id')
  deleteCall(@Param('id') id: string) {
    return this.callService.deleteCall(id);
  }

  // POST /api/calls/token
  @Post('token')
  getLivekitToken(
    @Body()
    body: {
      roomName: string;
      memberId: string;
      participantName?: string;
    },
  ) {
    const { roomName, memberId, participantName } = body;
    const token = this.callService.generateLivekitToken(
      roomName,
      memberId,
      participantName,
    );
    return { token };
  }
}
