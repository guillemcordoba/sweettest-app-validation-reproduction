import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, Record, EntryHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { toPromise } from '@holochain-open-dev/stores';

import { Post } from '../../ui/src/types.js';
import { samplePost } from '../../ui/src/mocks.js';
import { setup } from './setup.js';

test('create a Post and get posts by author', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Bob gets posts by author
    let collectionOutput = await toPromise(bob.store.postsByAuthor.get(alice.player.agentPubKey));
    assert.equal(collectionOutput.size, 0);

    // Alice creates a Post
    const post: EntryRecord<Post> = await alice.store.client.createPost(await samplePost(alice.store.client));
    assert.ok(post);
    
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
    
    // Bob gets posts by author again
    collectionOutput = await toPromise(bob.store.postsByAuthor.get(alice.player.agentPubKey));
    assert.equal(collectionOutput.size, 1);
    assert.deepEqual(post.actionHash, Array.from(collectionOutput.keys())[0]);    
  });
});

