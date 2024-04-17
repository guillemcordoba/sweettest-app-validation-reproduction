import { 
  AgentPubKey,
  EntryHash,
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  fakeDnaHash,
  AppAgentCallZomeRequest,
  AppAgentWebsocket,
  encodeHashToBase64 
} from '@holochain/client';
import { encode } from '@msgpack/msgpack';
import { Scenario } from '@holochain/tryorama';
import { EntryRecord } from '@holochain-open-dev/utils';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { PostsClient } from '../../ui/src/posts-client.js';
import { PostsStore } from '../../ui/src/posts-store.js';

export async function setup(scenario: Scenario) {
  const testHappUrl =
    dirname(fileURLToPath(import.meta.url)) + '/../../workdir/posts_test-debug.happ';

  // Add 2 players with the test hApp to the Scenario. The returned players
  // can be destructured.
  const [alice, bob] = await scenario.addPlayersWithApps([
    { appBundleSource: { path: testHappUrl } },
    { appBundleSource: { path: testHappUrl } },
  ]);

  // Shortcut peer discovery through gossip and register all agents in every
  // conductor of the scenario.
  await scenario.shareAllAgents();

  const aliceStore = new PostsStore(
    new PostsClient(alice.appAgentWs as any, 'posts_test', 'posts')
  );

  const bobStore = new PostsStore(
    new PostsClient(bob.appAgentWs as any, 'posts_test', 'posts')
  );

  // Shortcut peer discovery through gossip and register all agents in every
  // conductor of the scenario.
  await scenario.shareAllAgents();

  return {
    alice: {
      player: alice,
      store: aliceStore,
    },
    bob: {
      player: bob,
      store: bobStore,
    },
  };
}

