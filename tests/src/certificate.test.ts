import { assert, test } from "vitest";

import { runScenario, dhtSync } from '@holochain/tryorama';
import { ActionHash, SignedActionHashed, Delete, Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { EntryRecord } from '@holochain-open-dev/utils';
import { cleanNodeDecoding } from '@holochain-open-dev/utils/dist/clean-node-decoding.js';
import { toPromise } from '@holochain-open-dev/stores';

import { Certificate } from '../../ui/src/types.js';
import { sampleCertificate } from '../../ui/src/mocks.js';
import { setup } from './setup.js';

test('create Certificate', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    // Alice creates a Certificate
    const certificate: EntryRecord<Certificate> = await alice.store.client.createCertificate(await sampleCertificate(alice.store.client));
    assert.ok(certificate);
  });
});

test('create and read Certificate', async () => {
  await runScenario(async scenario => {
    const { alice, bob } = await setup(scenario);

    const sample = await sampleCertificate(alice.store.client);

    // Alice creates a Certificate
    const certificate: EntryRecord<Certificate> = await alice.store.client.createCertificate(sample);
    assert.ok(certificate);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync(
      [alice.player, bob.player],
      alice.player.cells[0].cell_id[0]
    );

    // Bob gets the created Certificate
    const createReadOutput: EntryRecord<Certificate> = await toPromise(bob.store.certificates.get(certificate.actionHash).entry);
    assert.deepEqual(sample, cleanNodeDecoding(createReadOutput.entry));
  });
});


