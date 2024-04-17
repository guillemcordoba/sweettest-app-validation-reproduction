import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';

import { localized, msg } from '@lit/localize';

import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Certificate, CertificateType } from '../types.js';

/**
 * @element certificate-summary
 * @fires certificate-selected: detail will contain { certificateHash }
 */
@localized()
@customElement('certificate-summary')
export class CertificateSummary extends LitElement {

  // REQUIRED. The hash of the Certificate to show
  @property(hashProperty('certificate-hash'))
  certificateHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  renderSummary(entryRecord: EntryRecord<Certificate>) {
    return html`
      <div class="column" style="gap: 16px;">

      </div>
    `;
  }
  
  renderCertificate() {
    return html`${subscribe(this.postsStore.certificates.get(this.certificateHash).entry,
      renderAsyncStatus({
        complete: certificate => this.renderSummary(certificate),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the certificate")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() => this.dispatchEvent(new CustomEvent('certificate-selected', {
          composed: true,
          bubbles: true,
          detail: {
            certificateHash: this.certificateHash
          }
        }))}>
        ${this.renderCertificate()}
    </sl-card>`;
  }

  
  static styles = [sharedStyles];
}
