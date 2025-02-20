export type ExchangeTypeHuman = {
  query: string;
  user_context: any;
  project_labels: string[];
  repo_ref: any;
};

export type ExchangeTypeAgent = {
  plan_steps: string[];
  plan_discarded: boolean;
  parent_exchange_id: string;
};
export type ExchangeType = ExchangeTypeHuman | ExchangeTypeAgent;

export type ExchangeState =
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Running'
  | 'UserMessage';
