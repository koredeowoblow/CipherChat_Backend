import { UserDto } from './user.dto';

export class AuthResponseDto {
  public token: string;
  public user: UserDto;

  constructor(token: string, user: any) {
    this.token = token;
    this.user = UserDto.toResponse(user);
  }

  public static toResponse(token: string, user: any) {
    return new AuthResponseDto(token, user);
  }
}
