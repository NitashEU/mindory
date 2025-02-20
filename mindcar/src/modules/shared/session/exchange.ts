import { ExchangeState, ExchangeType } from '../interfaces/exchange';

export class Exchange {
  constructor(
    public exchange_id: string,
    public exchange_type: ExchangeType,
    public exchange_state: ExchangeState,
    public is_compressed: boolean,
    public is_hidden: boolean,
  ) {}
}
