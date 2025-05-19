import { UserResponseDto } from '../dto/responses/user-response.dto';
import { User } from '../entities/user.entity';

function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export default toUserResponseDto;
