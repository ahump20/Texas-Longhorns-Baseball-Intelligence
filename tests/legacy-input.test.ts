import { CollegeBaseballSabermetricsClient } from '../src/live-data';
import type { MCPServerTools } from '../src/live-data';
const tools = (value: unknown): MCPServerTools => ({cbb_player_stats: async () => value as never, cbb_team_analytics: async () => value as never});
test.each([null, {}, {season: '2026'}, {teamId: 'texas', record: null}])('legacy adapter rejects malformed responses instead of marking success: %j', async value => {
  const client = new CollegeBaseballSabermetricsClient(tools(value));
  expect((await client.fetchTeamAnalytics({teamId: 'texas'})).success).toBe(false);
  expect((await client.fetchPlayerStats({playerId: 'fixture'})).success).toBe(false);
});
