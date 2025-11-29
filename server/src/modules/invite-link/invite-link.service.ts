import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InviteLink } from './entities/invite-link.entity';
import { Repository } from 'typeorm';
import { Chat } from '../chat/entities/chat.entity';
import { NotFoundError } from '@shared/types/enums/error-message.enum';
import { generateNanoId } from '@/common/utils/generateNanoId';

@Injectable()
export class InviteLinkService {
  constructor(
    @InjectRepository(InviteLink)
    private inviteLinkRepo: Repository<InviteLink>,

    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,
  ) {}

  async createInviteLink(
    chatId: string,
    createdBy: string,
    expiresAt?: string,
    maxUses?: number,
  ): Promise<InviteLink> {
    const chat = await this.chatRepo.findOneBy({ id: chatId });
    if (!chat) throw new NotFoundException(NotFoundError.CHAT_NOT_FOUND);
    const token: string = generateNanoId();

    const invite = this.inviteLinkRepo.create({
      chat,
      token,
      createdBy,
      expiresAt: expiresAt ?? null,
      maxUses: maxUses ?? null,
    });

    return await this.inviteLinkRepo.save(invite);
  }

  async validateAndUse(token: string): Promise<InviteLink> {
    const invite = await this.inviteLinkRepo.findOne({
      where: { token },
      relations: ['chat'],
    });

    if (!invite) throw new NotFoundException('Invite link not found');
    if (invite.isRevoked)
      throw new BadRequestException('Invite link has been revoked');
    if (invite.expiresAt && new Date() > invite.expiresAt)
      throw new BadRequestException('Invite link has expired');
    if (invite.maxUses !== null && invite.useCount >= invite.maxUses)
      throw new BadRequestException('Invite link has reached its usage limit');

    invite.useCount += 1;
    await this.inviteLinkRepo.save(invite);

    return invite;
  }

  async refreshInviteLink(token: string, userId: string): Promise<InviteLink> {
    const old = await this.inviteLinkRepo.findOne({
      where: { token },
      relations: ['chat'],
    });
    if (!old) throw new NotFoundException('Invite link not found');

    await this.inviteLinkRepo.delete({ token }); // Just delete it

    const newInvite = this.inviteLinkRepo.create({
      chat: old.chat,
      token: generateNanoId(),
      createdBy: userId,
      expiresAt: old.expiresAt,
      maxUses: old.maxUses,
    });

    return await this.inviteLinkRepo.save(newInvite);
  }

  async revoke(token: string) {
    const invite = await this.inviteLinkRepo.findOneBy({ token });
    if (!invite) throw new NotFoundException('Invite not found');

    invite.isRevoked = true;
    invite.revokedAt = new Date();
    return await this.inviteLinkRepo.save(invite);
  }
}
