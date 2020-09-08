import { v4 as uuidv4 } from 'uuid';
import {
  Poll,
  PollChoice,
  PollResult,
  PollUser,
  PollService,
  PollQuestion,
  PollId,
  PollUserId,
  PollResultId,
  PollStatus,
} from './poll-model';

interface PollState {
  polls: Record<PollId, Poll>;
  users: Record<PollUserId, PollUser>;
  results: Record<PollResultId, PollResult>;
}

export class InMemoryPollService implements PollService {
  private state: PollState = { polls: {}, users: {}, results: {} };

  newPoll(name: string): Poll {
    const poll = {
      id: uuidv4(),
      name,
      status: PollStatus.Draft,
      questions: [],
    };
    this.state.polls = {
      ...this.state.polls,
      [poll.id]: poll,
    };
    return poll;
  }

  addPollQuestion(id: string, questions: PollQuestion[]): Poll {
    throw new Error('Method not implemented.');
  }
  publishPoll(id: string): Poll {
    throw new Error('Method not implemented.');
  }
  closePoll(id: string): Poll {
    throw new Error('Method not implemented.');
  }

  getPoll(id: string): Poll {
    const poll = this.state.polls[id];
    if (poll) {
      return poll;
    } else {
      throw new Error('Poll not found');
    }
  }

  listPolls(): Poll[] {
    return Object.values(this.state.polls);
  }

  addUser(firstName: string, lastName: string): PollUser {
    throw new Error('Method not implemented.');
  }
  listUsers(): PollUser[] {
    throw new Error('Method not implemented.');
  }
  takePoll(
    pollId: string,
    userId: string,
    answers: Record<string, PollChoice>
  ): PollResult {
    throw new Error('Method not implemented.');
  }
  listPollResults(id: string): PollResult[] {
    throw new Error('Method not implemented.');
  }
}
