import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, sharedStyles, hashProperty, wrapPathInSvg, notifyError } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiPencil, mdiDelete } from '@mdi/js';

import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';


import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Certificate, CertificateType } from '../types.js';

/**
 * @element certificate-detail
 * @fires certificate-deleted: detail will contain { certificateHash }
 */
@localized()
@customElement('certificate-detail')
export class CertificateDetail extends LitElement {

  // REQUIRED. The hash of the Certificate to show
  @property(hashProperty('certificate-hash'))
  certificateHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;



  renderDetail(entryRecord: EntryRecord<Certificate>) {
    return html`
      <sl-card>
      	<div slot="header" class="row" style="gap: 8px">
          <span style="font-size: 18px; flex: 1;">${msg("Certificate")}</span>

        </div>

        <div class="column" style="gap: 16px;">
  
      </div>
      </sl-card>
    `;
  }
  
  render() {
    return html`${subscribe(this.postsStore.certificates.get(this.certificateHash).entry,
      renderAsyncStatus({
        complete: certificate => {
          return this.renderDetail(certificate);
        },
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
  
  static styles = [sharedStyles];
}
