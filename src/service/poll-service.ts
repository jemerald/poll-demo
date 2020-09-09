import { v4 as uuidv4 } from 'uuid';
import {
  Poll,
  PollChoice,
  PollResult,
  PollUser,
  PollService,
  NewPollQuestion,
  PollId,
  PollUserId,
  PollResultId,
  PollStatus,
  MAX_NUMBER_OF_OPTIONS,
} from './poll-model';

interface PollState {
  polls: Record<PollId, Poll>;
  users: Record<PollUserId, PollUser>;
  results: Record<PollResultId, PollResult>;
}

// clone objects before returning so any modification by the consumer would not impact the state
function clonePoll(poll: Poll): Poll {
  return {
    ...poll,
    questions: poll.questions.map((q) => ({
      ...q,
      options: q.options.map((o) => o),
    })),
  };
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
    return clonePoll(poll);
  }

  addPollQuestions(id: string, questions: NewPollQuestion[]): Poll {
    // validate questions
    questions.forEach((q) => {
      if (q.options.length === 0) {
        throw new Error('No option specified for question');
      }
      if (q.options.length > MAX_NUMBER_OF_OPTIONS) {
        throw new Error('Too many options specified for question');
      }
    });
    const poll = this.state.polls[id];
    if (poll) {
      poll.questions = [
        ...poll.questions,
        ...questions.map((q) => ({
          ...q,
          id: uuidv4(),
        })),
      ];
      return clonePoll(poll);
    } else {
      throw new Error('Poll not found');
    }
  }

  publishPoll(id: string): Poll {
    const poll = this.state.polls[id];
    if (!poll) {
      throw new Error('Poll not found');
    }
    if (poll.status !== PollStatus.Draft) {
      throw new Error('Poll is not in draft status, cannot be published');
    }
    if (poll.questions.length === 0) {
      throw new Error('Poll has no questions, cannot be published');
    }
    this.state.polls = {
      ...this.state.polls,
      [id]: {
        ...poll,
        status: PollStatus.Published,
      },
    };
    return clonePoll(this.state.polls[id]);
  }

  closePoll(id: string): Poll {
    throw new Error('Method not implemented.');
  }

  getPoll(id: string): Poll {
    const poll = this.state.polls[id];
    if (poll) {
      return clonePoll(poll);
    } else {
      throw new Error('Poll not found');
    }
  }

  listPolls(): Poll[] {
    return Object.values(this.state.polls).map(clonePoll);
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
