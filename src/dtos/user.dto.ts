export class UserDto {
  public id: string;
  public username: string;
  public email?: string;
  public publicKey: string;
  public keyFingerprint: string;

  constructor(user: any) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email; // May be omitted for public profiles
    this.publicKey = user.publicKey;
    this.keyFingerprint = user.keyFingerprint;
  }

  public static toResponse(user: any) {
    return new UserDto(user);
  }

  public static toResponseList(users: any[]) {
    return users.map(user => new UserDto(user));
  }
}
