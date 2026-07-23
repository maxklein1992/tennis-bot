import { ClubsService } from './clubs.service';

describe('ClubsService', () => {
  function build() {
    const knltb = {
      searchClubs: jest
        .fn()
        .mockResolvedValue([{ id: 'club-1', name: 'TV De Fake Smash' }]),
      login: jest.fn(),
      logout: jest.fn(),
      getAvailability: jest.fn(),
      validateReservation: jest.fn(),
      createReservation: jest.fn(),
      searchMembers: jest.fn(),
    };
    return {
      service: new ClubsService(knltb),
      knltb,
    };
  }

  it('geeft lege lijst terug bij een te korte zoekterm', async () => {
    const { service, knltb } = build();
    expect(await service.search('t')).toEqual([]);
    expect(knltb.searchClubs).not.toHaveBeenCalled();
  });

  it('delegeert de zoekopdracht naar de KNLTB-service', async () => {
    const { service, knltb } = build();
    const results = await service.search('Fake');
    expect(knltb.searchClubs).toHaveBeenCalledWith('Fake');
    expect(results).toEqual([{ id: 'club-1', name: 'TV De Fake Smash' }]);
  });
});
