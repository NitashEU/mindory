export class Session {
  constructor(
    private readonly sessionId: string,
    private readonly exchanges: string[],
  ) {}
}
