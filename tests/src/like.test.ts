import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, SignedActionHashed, Delete, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { cleanNodeDecoding } from '@holochain-open-dev/utils/dist/clean-node-decoding.js';
import { toPromise } from '@holochain-open-dev/stores';

import { Like } from '../../ui/src/types.js';
import { sampleLike } from '../../ui/src/mocks.js';
import { setup } from './setup.js';

test('create Like', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Like
    const like: EntryRecord<Like> = await alice.store.client.createLike(await sampleLike(alice.store.client));
    assert.ok(like);
  });
});

test('create and read Like', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const sample = await sampleLike(alice.store.client);

    // Alice creates a Like
    const like: EntryRecord<Like> = await alice.store.client.createLike(sample);
    assert.ok(like);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );

    // Bob gets the created Like
    const createReadOutput: EntryRecord<Like> = await toPromise(bob.store.likes.get(like.actionHash).entry);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});


test('create and delete Like', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Like
    const like: EntryRecord<Like> = await alice.store.client.createLike(await sampleLike(alice.store.client));
    assert.ok(like);
        
    // Alice deletes the Like
    const deleteActionHash = await alice.store.client.deleteLike(like.actionHash);
    assert.ok(deleteActionHash);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
        
    // Bob tries to get the deleted Like
    const deletes: Array<SignedActionHashed<Delete>> = await toPromise(bob.store.likes.get(like.actionHash).deletes);
    assert.equal(deletes.length, 1);
  });
});
