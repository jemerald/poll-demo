import { v4 as uuidv4 } from 'uuid';
import { InMemoryPollService } from './poll-service';
import { PollId, PollStatus, NewPollQuestion } from './poll-model';

describe('poll service', () => {
  const pollService = new InMemoryPollService();
  const firstPollName = 'poll 1';
  const secondPollName = 'my second poll';
  let firstPollId: PollId;
  let secondPollId: PollId;

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
});
