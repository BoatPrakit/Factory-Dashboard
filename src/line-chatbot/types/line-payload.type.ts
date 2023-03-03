export type LinePayload = {
  destination: string;
  events: LineEvent[];
};

export type LineEvent = {
  type: string;
  message: any[];
  webhookEventId: string;
  deliveryContext: any[];
  timestamp: number;
  source: any[];
  replyToken: string;
  mode: string;
};
