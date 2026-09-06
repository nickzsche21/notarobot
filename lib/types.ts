import type { Signal } from "./humanity";

export type ChallengeResult = {
  signals: Signal[];
  /** shown in the terminal log after the level resolves */
  remark: string;
};

export type ChallengeProps = {
  onDone: (result: ChallengeResult) => void;
};

export type Challenge = {
  id: string;
  /** the fake-official instruction line at the top of the card */
  prompt: string;
  /** the quiet subtitle where the joke usually lives */
  hint: string;
};
