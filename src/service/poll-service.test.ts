import { v4 as uuidv4 } from 'uuid';
import { InMemoryPollService } from './poll-service';
import {
  PollId,
  PollStatus,
  NewPollQuestion,
  PollUserId,
  PollChoice,
} from './poll-model';

describe('poll service', () => {
  const pollService = new InMemoryPollService();
  const firstPollName = 'poll 1';
  const secondPollName = 'my second poll';
  let firstPollId: PollId;
  let secondPollId: PollId;
  const firstUserName = ['John', 'Doe'];
  let firstUserId: PollUserId;
  const secondUserName = ['Jane', 'Smith'];
  let secondUserId: PollUserId;

  it('should start with empty poll list', () => {
    expect(pollService.listPolls().length).toBe(0);
  });

  it('should be able to create new poll', () => {
    const poll = pollService.newPoll(firstPollName);
    expect(poll.name).toBe(firstPollName);
    firstPollId = poll.id;
  });

  it('should be able to create a second poll', () => {
    const poll = pollService.newPoll(secondPollName);
    expect(poll.name).toBe(secondPollName);
    secondPollId = poll.id;
  });

  it('should be able to retrieve the 2 polls by id', () => {
    const first = pollService.getPoll(firstPollId);
    expect(first.id).toBe(firstPollId);
    expect(first.name).toBe(firstPollName);
    expect(first.status).toBe(PollStatus.Draft);
    expect(first.questions.length).toBe(0);

    const second = pollService.getPoll(secondPollId);
    expect(second.id).toBe(secondPollId);
    expect(second.name).toBe(secondPollName);
    expect(second.status).toBe(PollStatus.Draft);
    expect(second.questions.length).toBe(0);
  });

  it('should throw error when retrieving non-existent poll', () => {
    expect(() => pollService.getPoll(uuidv4())).toThrow();
  });

  it('should be able to list the 2 polls added', () => {
    const list = pollService.listPolls();
    expect(list.length).toBe(2);
  });

  it('should be able to add single question to poll', () => {
    const question1: NewPollQuestion = {
      text: 'question 1',
      multiChoice: false,
      options: ['q1 - option 1', 'q1 - option 2', 'q1 - option 3'],
    };
    const poll = pollService.addPollQuestions(firstPollId, [question1]);
    expect(poll.questions.length).toBe(1);
    const { id, ...q1 } = poll.questions[0];
    expect(q1).toStrictEqual(question1);
  });

  it('should be able to add multiple questions to poll', () => {
    const question2: NewPollQuestion = {
      text: 'question 2',
      multiChoice: true,
      options: [
        'q2 - option 1',
        'q2 - option 2',
        'q2 - option 3',
        'q2 - option 4',
      ],
    };
    const question3: NewPollQuestion = {
      text: 'question 3',
      multiChoice: false,
      options: ['q3 - option 1', 'q3 - option 2'],
    };
    const poll = pollService.addPollQuestions(firstPollId, [
      question2,
      question3,
    ]);
    expect(poll.questions.length).toBe(3);
    const q2 = poll.questions[1];
    expect(q2).toStrictEqual({
      ...question2,
      id: q2.id,
    });
    const q3 = poll.questions[2];
    expect(q3).toStrictEqual({
      ...question3,
      id: q3.id,
    });
  });

  it('should throw error when adding question without option', () => {
    expect(() =>
      pollService.addPollQuestions(firstPollId, [
        {
          text: 'q3',
          multiChoice: true,
          options: [],
        },
      ])
    ).toThrow();
  });

  it('should throw error when adding question with more than 4 options', () => {
    expect(() =>
      pollService.addPollQuestions(firstPollId, [
        {
          text: 'q3',
          multiChoice: true,
          options: ['o1', 'o2', 'o3', 'o4', 'o5'],
        },
      ])
    ).toThrow();
  });

  it('should only allow data change by service API', () => {
    const pollDirty = pollService.getPoll(firstPollId);
    pollDirty.name = 'new name';
    pollDirty.status = PollStatus.Closed;
    pollDirty.questions[0].text = 'new question';
    pollDirty.questions[0].multiChoice = true;
    pollDirty.questions[0].options[0] = 'new option';

    const pollClean = pollService.getPoll(firstPollId);
    expect(pollClean.name).toBe(firstPollName);
    expect(pollClean.status).toBe(PollStatus.Draft);
    expect(pollClean.questions[0].text).toBe('question 1');
    expect(pollClean.questions[0].multiChoice).toBe(false);
    expect(pollClean.questions[0].options[0]).toBe('q1 - option 1');
  });

  it('should be able to publish a draft poll', () => {
    const poll = pollService.publishPoll(firstPollId);
    expect(poll.status).toBe(PollStatus.Published);
  });

  it('should not be able to publish a non-existent poll', () => {
    expect(() => pollService.publishPoll(uuidv4())).toThrow();
  });

  it('should not be able to re-publish a published poll', () => {
    expect(() => pollService.publishPoll(firstPollId)).toThrow();
  });

  it('should not be able to publish a draft poll without any questions', () => {
    expect(() => pollService.publishPoll(secondPollId)).toThrow();
  });

  it('should not be able to add question to a published poll', () => {
    expect(() =>
      pollService.addPollQuestions(firstPollId, [
        {
          text: 'question 4',
          multiChoice: false,
          options: ['q4 - option 1', 'q4 - option 2'],
        },
      ])
    ).toThrow(new RegExp('not in draft'));
  });

  it('should be able to add a user', () => {
    const user = pollService.addUser(firstUserName[0], firstUserName[1]);
    expect(user.firstName).toBe(firstUserName[0]);
    expect(user.lastName).toBe(firstUserName[1]);
    firstUserId = user.id;
  });

  it('should be able to add a second user', () => {
    const user = pollService.addUser(secondUserName[0], secondUserName[1]);
    expect(user.firstName).toBe(secondUserName[0]);
    expect(user.lastName).toBe(secondUserName[1]);
    secondUserId = user.id;
  });

  it('should be able to retrieve all users', () => {
    const users = pollService.listUsers();
    expect(users.length).toBe(2);

    const firstUser = users.find((x) => x.id === firstUserId);
    expect(firstUser).toBeDefined();
    expect(firstUser?.firstName).toBe(firstUserName[0]);
    expect(firstUser?.lastName).toBe(firstUserName[1]);

    const secondUser = users.find((x) => x.id === secondUserId);
    expect(secondUser).toBeDefined();
    expect(secondUser?.firstName).toBe(secondUserName[0]);
    expect(secondUser?.lastName).toBe(secondUserName[1]);
  });

  it('should not allow user data change outside service API', () => {
    const usersDirty = pollService.listUsers();
    usersDirty[0].firstName = 'new firstname';
    usersDirty[0].lastName = 'new lastname';
    usersDirty.push({
      id: '123',
      firstName: 'foo',
      lastName: 'bar',
    });

    const users = pollService.listUsers();
    expect(users.length).toBe(2);

    const firstUser = users.find((x) => x.id === firstUserId);
    expect(firstUser).toBeDefined();
    expect(firstUser?.firstName).toBe(firstUserName[0]);
    expect(firstUser?.lastName).toBe(firstUserName[1]);

    const secondUser = users.find((x) => x.id === secondUserId);
    expect(secondUser).toBeDefined();
    expect(secondUser?.firstName).toBe(secondUserName[0]);
    expect(secondUser?.lastName).toBe(secondUserName[1]);
  });

  it('should be able to take a published poll', () => {
    const poll = pollService.getPoll(firstPollId);
    const result = pollService.takePoll(firstPollId, firstUserId, {
      [poll.questions[0].id]: new Set<PollChoice>([0]),
      [poll.questions[1].id]: new Set<PollChoice>([1, 3]),
      [poll.questions[2].id]: new Set<PollChoice>([1]),
    });
    expect(result.pollId).toBe(firstPollId);
    expect(result.userId).toBe(firstUserId);
    expect(Object.keys(result.answers).length).toBe(3);
    expect(result.answers[poll.questions[0].id]).toStrictEqual(new Set([0]));
    expect(result.answers[poll.questions[1].id]).toStrictEqual(new Set([1, 3]));
    expect(result.answers[poll.questions[2].id]).toStrictEqual(new Set([1]));

    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not be able to take a draft poll', () => {
    expect(() => pollService.takePoll(secondPollId, firstUserId, {})).toThrow(
      new RegExp('not currently published')
    );
    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not be able to take a non-existent poll', () => {
    expect(() => pollService.takePoll(uuidv4(), firstUserId, {})).toThrow(
      new RegExp('not found')
    );
    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not allow the same user to take the same poll again', () => {
    const poll = pollService.getPoll(firstPollId);
    expect(() =>
      pollService.takePoll(firstPollId, firstUserId, {
        [poll.questions[0].id]: new Set<PollChoice>([0]),
        [poll.questions[1].id]: new Set<PollChoice>([1, 3]),
        [poll.questions[2].id]: new Set<PollChoice>([1]),
      })
    ).toThrow(new RegExp('already taken'));
    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not allow the answers to non-existent question', () => {
    const poll = pollService.getPoll(firstPollId);
    expect(() =>
      pollService.takePoll(firstPollId, secondUserId, {
        [poll.questions[0].id]: new Set<PollChoice>([0]),
        [poll.questions[1].id]: new Set<PollChoice>([1, 3]),
        [poll.questions[2].id]: new Set<PollChoice>([1]),
        doNotExist: new Set<PollChoice>([0]),
      })
    ).toThrow(new RegExp('not in the poll'));
    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not allow the more than one choice for a single choice question', () => {
    const poll = pollService.getPoll(firstPollId);
    expect(() =>
      pollService.takePoll(firstPollId, secondUserId, {
        [poll.questions[0].id]: new Set<PollChoice>([0, 1]),
        [poll.questions[1].id]: new Set<PollChoice>([1, 3]),
        [poll.questions[2].id]: new Set<PollChoice>([1]),
      })
    ).toThrow(new RegExp('not multi-choice'));
    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not allow the answers outside the options range of the question', () => {
    const poll = pollService.getPoll(firstPollId);
    expect(() =>
      pollService.takePoll(firstPollId, secondUserId, {
        [poll.questions[0].id]: new Set<PollChoice>([3]),
        [poll.questions[1].id]: new Set<PollChoice>([1, 3]),
        [poll.questions[2].id]: new Set<PollChoice>([1]),
      })
    ).toThrow(new RegExp('outside options range'));
    expect(pollService.listPollResults(firstPollId).length).toBe(1);
  });

  it('should not allow the result to be modified', () => {
    const poll = pollService.getPoll(firstPollId);
    const resultsDirty = pollService.listPollResults(firstPollId);
    // changing existing result
    resultsDirty[0].userId = secondUserId;
    resultsDirty[0].answers[poll.questions[0].id] = new Set<PollChoice>([1]);
    resultsDirty[0].answers[poll.questions[1].id].add(2);
    resultsDirty[0].answers['badquestion'] = new Set<PollChoice>([0]);
    // adding new result
    resultsDirty.push({
      id: '123',
      pollId: firstPollId,
      userId: secondUserId,
      answers: {
        [poll.questions[0].id]: new Set<PollChoice>([3]),
        [poll.questions[1].id]: new Set<PollChoice>([1, 3]),
        [poll.questions[2].id]: new Set<PollChoice>([1]),
      },
    });

    const results = pollService.listPollResults(firstPollId);
    expect(results.length).toBe(1);
    const result = results[0];
    expect(result.pollId).toBe(firstPollId);
    expect(result.userId).toBe(firstUserId);
    expect(Object.keys(result.answers).length).toBe(3);
    expect(result.answers[poll.questions[0].id]).toStrictEqual(new Set([0]));
    expect(result.answers[poll.questions[1].id]).toStrictEqual(new Set([1, 3]));
    expect(result.answers[poll.questions[2].id]).toStrictEqual(new Set([1]));
  });

  it('should be able to close a draft poll', () => {
    const poll = pollService.closePoll(secondPollId);
    expect(poll.status).toBe(PollStatus.Closed);
  });

  it('should be able to close a published poll', () => {
    const poll = pollService.closePoll(firstPollId);
    expect(poll.status).toBe(PollStatus.Closed);
  });

  it('should not be able to close a closed poll', () => {
    expect(() => pollService.closePoll(firstPollId)).toThrow(
      new RegExp('already closed')
    );
  });

  it('should not be able to add question to a closed poll', () => {
    expect(() =>
      pollService.addPollQuestions(firstPollId, [
        {
          text: 'question 4',
          multiChoice: false,
          options: ['q4 - option 1', 'q4 - option 2'],
        },
      ])
    ).toThrow(new RegExp('not in draft'));
  });
});
