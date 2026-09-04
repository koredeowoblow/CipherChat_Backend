export class KeyExchangeDto {
  public id: string;
  public conversationId: string;
  public initiatorId: string;
  public responderId: string;
  public initiatorEphemeralKey: string;
  public responderEphemeralKey?: string;
  public status: 'pending' | 'completed';

  constructor(keyExchange: any) {
    this.id = keyExchange.id;
    this.conversationId = keyExchange.conversationId;
    this.initiatorId = keyExchange.initiatorId;
    this.responderId = keyExchange.responderId;
    this.initiatorEphemeralKey = keyExchange.initiatorEphemeralKey;
    this.responderEphemeralKey = keyExchange.responderEphemeralKey;
    this.status = keyExchange.status;
  }

  public static toResponse(keyExchange: any) {
    return new KeyExchangeDto(keyExchange);
  }

  public static toResponseList(keyExchanges: any[]) {
    return keyExchanges.map(k => new KeyExchangeDto(k));
  }
}
