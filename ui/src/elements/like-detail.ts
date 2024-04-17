import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, sharedStyles, hashProperty, wrapPathInSvg, notifyError } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiPencil, mdiDelete } from '@mdi/js';


import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';

import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Like } from '../types.js';

/**
 * @element like-detail
 * @fires like-deleted: detail will contain { likeHash }
 */
@localized()
@customElement('like-detail')
export class LikeDetail extends LitElement {

  // REQUIRED. The hash of the Like to show
  @property(hashProperty('like-hash'))
  likeHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;


  async deleteLike() {
    try {
      await this.postsStore.client.deleteLike(this.likeHash);
 
      this.dispatchEvent(new CustomEvent('like-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          likeHash: this.likeHash
        }
      }));
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error deleting the like"));
    }
  }

  renderDetail(entryRecord: EntryRecord<Like>) {
    return html`
      <sl-card>
      	<div slot="header" class="row" style="gap: 8px">
          <span style="font-size: 18px; flex: 1;">${msg("Like")}</span>

          <sl-icon-button .src=${wrapPathInSvg(mdiDelete)} @click=${() => this.deleteLike()}></sl-icon-button>
        </div>

        <div class="column" style="gap: 16px;">
  
          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Agent")}</strong></span>
 	        <span style="white-space: pre-line"><agent-avatar .agentPubKey=${ entryRecord.entry.agent }></agent-avatar></span>
	  </div>

      </div>
      </sl-card>
    `;
  }
  
  render() {
    return html`${subscribe(this.postsStore.likes.get(this.likeHash).entry,
      renderAsyncStatus({
        complete: like => {
          return this.renderDetail(like);
        },
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the like")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  static styles = [sharedStyles];
}
