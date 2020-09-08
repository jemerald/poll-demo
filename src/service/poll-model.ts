export type PollId = string;
export type PollQuestionId = string;
export type PollUserId = string;
export type PollResultId = string;
export type PollChoice = 0 | 1 | 2 | 3;

export interface Poll {
  id: PollId;
  name: string;
  status: PollStatus;
  questions: PollQuestion[];
}

export enum PollStatus {
  Draft = 'draft',
  Published = 'published',
  Closed = 'closed',
}

export interface PollQuestion {
  id: PollQuestionId;
  text: string;
  multiChoice: boolean;
  options: string[];
}

export interface PollResult {
  id: PollResultId;
  pollId: PollId;
  userId: PollUserId;
  answers: Record<PollQuestionId, PollChoice>;
}

export interface PollUser {
  id: PollUserId;
  firstName: string;
  lastName: string;
}

export interface PollService {
  newPoll(name: string): Poll;
  addPollQuestion(id: PollId, questions: PollQuestion[]): Poll;
  publishPoll(id: PollId): Poll;
  closePoll(id: PollId): Poll;
  getPoll(id: PollId): Poll;
  listPolls(): Poll[];

  addUser(firstName: string, lastName: string): PollUser;
  listUsers(): PollUser[];

  takePoll(
    pollId: PollId,
    userId: PollUserId,
    answers: Record<PollQuestionId, PollChoice>
  ): PollResult;
  listPollResults(id: PollId): PollResult[];
}
