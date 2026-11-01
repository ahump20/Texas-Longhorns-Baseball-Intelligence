#!/usr/bin/env node
/** Command-line source collection. No deployment or local credentials required. */
import { writeFileSync } from 'fs';
import { parseArgs } from 'util';
import { BlazeMcpClient } from './live-data/http-client';
import { collectTeamEvidence, renderEvidencePacket } from './analytics/evidence-packet';
export async function main(args = process.argv.slice(2)): Promise<number> {
  const {values} = parseArgs({args, options: {
    team: {type: 'string', default: 'texas'}, conference: {type: 'string', default: 'SEC'},
    format: {type: 'string', default: 'markdown'}, output: {type: 'string'}, endpoint: {type: 'string'},
    'timeout-ms': {type: 'string', default: '15000'}, help: {type: 'boolean', short: 'h'},
  }, strict: true, allowPositionals: false});
  if (values.help) {
    console.log('Usage: texas-baseball-intel [--team texas] [--conference SEC] [--format json|markdown] [--output file] [--timeout-ms 15000] [--endpoint https://.../mcp]\nExit: 0 collection resolved; 1 partial collection; 2 invalid arguments or local file error. A collected response does not certify season coverage.'); return 0;
  }
  if (!['json', 'markdown'].includes(values.format!)) throw new Error('--format must be json or markdown');
  if (!values.team?.trim() || !values.conference?.trim()) throw new Error('Team and conference must not be blank.');
  const client = new BlazeMcpClient({endpoint: values.endpoint, timeoutMs: Number(values['timeout-ms'])});
  const packet = await collectTeamEvidence(client, values.team, values.conference);
  const output = values.format === 'json' ? JSON.stringify(packet, null, 2) + '\n' : renderEvidencePacket(packet);
  if (values.output) writeFileSync(values.output, output, 'utf8'); else process.stdout.write(output);
  return packet.status === 'partial' ? 1 : 0;
}
if (require.main === module) main().then(code => {process.exitCode = code;}).catch(error => {console.error('texas-baseball-intel: ' + (error instanceof Error ? error.message : String(error))); process.exitCode = 2;});
