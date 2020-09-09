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
  PollQuestionId,
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

function cloneUser(user: PollUser): PollUser {
  return {
    ...user,
  };
}

function clonePollResult(result: PollResult): PollResult {
  return {
    ...result,
    answers: Object.keys(result.answers).reduce(
      (acc, questionId) => ({
        ...acc,
        [questionId]: new Set<PollChoice>(result.answers[questionId].values()),
      }),
      {}
    ),
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

  addPollQuestions(id: PollId, questions: NewPollQuestion[]): Poll {
    const poll = this.state.polls[id];
    // validate poll
    if (!poll) {
      throw new Error('Poll not found');
    }
    if (poll.status !== PollStatus.Draft) {
      throw new Error('Poll not in draft status');
    }
    // validate questions
    questions.forEach((q) => {
      if (q.options.length === 0) {
        throw new Error('No option specified for question');
      }
      if (q.options.length > MAX_NUMBER_OF_OPTIONS) {
        throw new Error('Too many options specified for question');
      }
    });
    poll.questions = [
      ...poll.questions,
      ...questions.map((q) => ({
        ...q,
        id: uuidv4(),
      })),
    ];
    return clonePoll(poll);
  }

  publishPoll(id: PollId): Poll {
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

  closePoll(id: PollId): Poll {
    const poll = this.state.polls[id];
    if (!poll) {
      throw new Error('Poll not found');
    }
    if (poll.status === PollStatus.Closed) {
      throw new Error('Poll is already closed');
    }
    this.state.polls = {
      ...this.state.polls,
      [id]: {
        ...poll,
        status: PollStatus.Closed,
      },
    };
    return clonePoll(this.state.polls[id]);
  }

  getPoll(id: PollId): Poll {
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
    const user: PollUser = {
      id: uuidv4(),
      firstName,
      lastName,
    };
    this.state.users = {
      ...this.state.users,
      [user.id]: user,
    };
    return cloneUser(user);
  }
  listUsers(): PollUser[] {
    return Object.values(this.state.users).map(cloneUser);
  }

  takePoll(
    pollId: PollId,
    userId: PollUserId,
    answers: Record<PollQuestionId, Set<PollChoice>>
  ): PollResult {
    if (!this.state.polls[pollId]) {
      throw new Error('Poll not found');
    }
    const poll = this.state.polls[pollId];
    if (poll.status !== PollStatus.Published) {
      throw new Error('Poll is not currently published and cannot be taken');
    }
    if (
      Object.values(this.state.results).filter(
        (r) => r.pollId === pollId && r.userId === userId
      ).length !== 0
    ) {
      throw new Error('User has already taken the poll');
    }
    Object.keys(answers).forEach((questionId) => {
      const question = poll.questions.find((q) => q.id === questionId);
      if (!question) {
        throw new Error('Question not in the poll');
      }
      if (!question.multiChoice && answers[questionId].size > 1) {
        throw new Error('Question is not multi-choice');
      }
      answers[questionId].forEach((choice) => {
        if (choice >= question.options.length) {
          throw new Error('Choice outside options range');
        }
      });
    });
    const result: PollResult = {
      id: uuidv4(),
      pollId,
      userId,
      answers: {
        ...answers,
      },
    };
    this.state.results = {
      ...this.state.results,
      [result.id]: result,
    };
    return clonePollResult(result);
  }
  listPollResults(id: PollId): PollResult[] {
    if (!this.state.polls[id]) {
      throw new Error('Poll not found');
    }
    return Object.values(this.state.results)
      .filter((r) => r.pollId === id)
      .map(clonePollResult);
  }
}
