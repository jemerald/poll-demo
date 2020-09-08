import { v4 as uuidv4 } from 'uuid';
import { InMemoryPollService } from './poll-service';
import { PollId, PollStatus } from './poll-model';

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
});
