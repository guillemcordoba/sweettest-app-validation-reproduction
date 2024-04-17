import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, property, query, customElement } from 'lit/decorators.js';
import { ActionHash, Record, DnaHash, AgentPubKey, EntryHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashProperty, notifyError, hashState, sharedStyles, onSubmit, wrapPathInSvg } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";


import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Certificate, CertificateType } from '../types.js';

/**
 * @element create-certificate
 * @fires certificate-created: detail will contain { certificateHash }
 */
@localized()
@customElement('create-certificate')
export class CreateCertificate extends LitElement {
  // REQUIRED. The post hash for this Certificate
  @property(hashProperty('post-hash'))
  postHash!: ActionHash;

  // REQUIRED. The agent for this Certificate
  @property(hashProperty('agent'))
  agent!: AgentPubKey;

  // REQUIRED. The certifications hashes for this Certificate
  @property()
  certificationsHashes!: Array<EntryHash>;

  // REQUIRED. The certificate type for this Certificate
  @property()
  certificateType!: CertificateType;

  // REQUIRED. The dna hash for this Certificate
  @property()
  dnaHash!: DnaHash;


  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  /**
   * @internal
   */
  @query('#create-form')
  form!: HTMLFormElement;


  async createCertificate(fields: Partial<Certificate>) {
    if (this.postHash === undefined) throw new Error('Cannot create a new Certificate without its post_hash field');
    if (this.agent === undefined) throw new Error('Cannot create a new Certificate without its agent field');
    if (this.certificationsHashes === undefined) throw new Error('Cannot create a new Certificate without its certifications_hashes field');
    if (this.certificateType === undefined) throw new Error('Cannot create a new Certificate without its certificate_type field');
    if (this.dnaHash === undefined) throw new Error('Cannot create a new Certificate without its dna_hash field');
  
    const certificate: Certificate = {
      post_hash: this.postHash!,
      agent: this.agent!,
      certifications_hashes: this.certificationsHashes!,
      certificate_type: this.certificateType!,
      dna_hash: this.dnaHash!,
    };

    try {
      this.committing = true;
      const record: EntryRecord<Certificate> = await this.postsStore.client.createCertificate(certificate);

      this.dispatchEvent(new CustomEvent('certificate-created', {
        composed: true,
        bubbles: true,
        detail: {
          certificateHash: record.actionHash
        }
      }));
      
      this.form.reset();
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error creating the certificate"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">
        <span slot="header">${msg("Create Certificate")}</span>

        <form 
          id="create-form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.createCertificate(fields))}
        >  

          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Certificate")}</sl-button>
        </form> 
      </sl-card>`;
  }
  
  static styles = [sharedStyles];
}
