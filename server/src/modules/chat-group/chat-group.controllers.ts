import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ChatGroupService } from './chat-group.service';
import { ChatGroupDto } from 'src/modules/chat-group/dto/chat-group.dto';
import { ChatGroup } from 'src/modules/chat-group/entities/chat-group.entity';
import { ResponseData } from 'src/common/response-data';

@Controller('chat-group')
export class ChatGroupController {
  constructor(private readonly chatGroupService: ChatGroupService) {}

  @Get()
  async findAll(): Promise<ResponseData<ChatGroup[]>> {
    try {
      const groups = await this.chatGroupService.getAllGroups();
      return new ResponseData<ChatGroup[]>(
        groups,
        HttpStatus.OK,
        'Chat groups retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve chat groups',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async findAllByUserId(
    @Param('userId') userId: string,
  ): Promise<ResponseData<ChatGroup[]>> {
    try {
      const groups = await this.chatGroupService.getGroupsByUserId(userId);
      return new ResponseData<ChatGroup[]>(
        groups,
        HttpStatus.OK,
        'User chat groups retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve user chat groups',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<ChatGroup>> {
    try {
      const group = await this.chatGroupService.getGroupById(id);
      if (!group) {
        throw new HttpException('Chat group not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<ChatGroup>(
        group,
        HttpStatus.OK,
        'Chat group retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve chat group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Body() chatGroupDto: ChatGroupDto,
  ): Promise<ResponseData<ChatGroup>> {
    try {
      const group = await this.chatGroupService.createGroup(chatGroupDto);
      return new ResponseData<ChatGroup>(
        group,
        HttpStatus.CREATED,
        'Chat group created successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to create chat group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() chatGroupDto: ChatGroupDto,
  ): Promise<ResponseData<ChatGroup>> {
    try {
      const updatedGroup = await this.chatGroupService.updateGroup(
        id,
        chatGroupDto,
      );
      if (!updatedGroup) {
        throw new HttpException('Chat group not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<ChatGroup>(
        updatedGroup,
        HttpStatus.OK,
        'Chat group updated successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to update chat group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<string>> {
    try {
      const deletedGroup = await this.chatGroupService.deleteGroup(id);
      if (!deletedGroup) {
        throw new HttpException('Chat group not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<string>(
        deletedGroup.id,
        HttpStatus.OK,
        'Chat group deleted successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to delete chat group',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
