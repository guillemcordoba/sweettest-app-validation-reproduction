import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, SignedActionHashed, Delete, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { cleanNodeDecoding } from '@holochain-open-dev/utils/dist/clean-node-decoding.js';
import { toPromise } from '@holochain-open-dev/stores';

import { Post } from '../../ui/src/types.js';
import { samplePost } from '../../ui/src/mocks.js';
import { setup } from './setup.js';

test('create Post', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Post
    const post: EntryRecord<Post> = await alice.store.client.createPost(await samplePost(alice.store.client));
    assert.ok(post);
  });
});

test('create and read Post', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const sample = await samplePost(alice.store.client);

    // Alice creates a Post
    const post: EntryRecord<Post> = await alice.store.client.createPost(sample);
    assert.ok(post);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );

    // Bob gets the created Post
    const createReadOutput: EntryRecord<Post> = await toPromise(bob.store.posts.get(post.actionHash).original);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});

test('create and update Post', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Post
    const post: EntryRecord<Post> = await alice.store.client.createPost(await samplePost(alice.store.client));
    assert.ok(post);
        
    const originalActionHash = post.actionHash;
 
    // Alice updates the Post
    let contentUpdate = await samplePost(alice.store.client);

    let updatedPost: EntryRecord<Post> = await alice.store.client.updatePost(originalActionHash, originalActionHash, contentUpdate);
    assert.ok(updatedPost);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
        
    // Bob gets the updated Post
    const readUpdatedOutput0: EntryRecord<Post> = await toPromise(bob.store.posts.get(post.actionHash).latestVersion);
    assert.deepEqual(contentUpdate, cleanNodeDecoding(readUpdatedOutput0.entry));

    // Alice updates the Post again
    contentUpdate = await samplePost(alice.store.client);

    updatedPost = await alice.store.client.updatePost(originalActionHash, updatedPost.actionHash, contentUpdate);
    assert.ok(updatedPost);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
        
    // Bob gets the updated Post
    const readUpdatedOutput1: EntryRecord<Post> = await toPromise(bob.store.posts.get(originalActionHash).latestVersion);
    assert.deepEqual(contentUpdate, cleanNodeDecoding(readUpdatedOutput1.entry));
  });
});

test('create and delete Post', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Post
    const post: EntryRecord<Post> = await alice.store.client.createPost(await samplePost(alice.store.client));
    assert.ok(post);
        
    // Alice deletes the Post
    const deleteActionHash = await alice.store.client.deletePost(post.actionHash);
    assert.ok(deleteActionHash);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );
        
    // Bob tries to get the deleted Post
    const deletes: Array<SignedActionHashed<Delete>> = await toPromise(bob.store.posts.get(post.actionHash).deletes);
    assert.equal(deletes.length, 1);
  });
});
