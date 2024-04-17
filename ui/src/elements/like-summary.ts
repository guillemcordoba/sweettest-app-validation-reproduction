import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';

import { localized, msg } from '@lit/localize';

import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';

import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Like } from '../types.js';

/**
 * @element like-summary
 * @fires like-selected: detail will contain { likeHash }
 */
@localized()
@customElement('like-summary')
export class LikeSummary extends LitElement {

  // REQUIRED. The hash of the Like to show
  @property(hashProperty('like-hash'))
  likeHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  renderSummary(entryRecord: EntryRecord<Like>) {
    return html`
      <div class="column" style="gap: 16px;">

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Agent")}</strong></span>
 	        <span style="white-space: pre-line"><agent-avatar .agentPubKey=${ entryRecord.entry.agent }></agent-avatar></span>
	  </div>

      </div>
    `;
  }
  
  renderLike() {
    return html`${subscribe(this.postsStore.likes.get(this.likeHash).entry,
      renderAsyncStatus({
        complete: like => this.renderSummary(like),
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
  
  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() => this.dispatchEvent(new CustomEvent('like-selected', {
          composed: true,
          bubbles: true,
          detail: {
            likeHash: this.likeHash
          }
        }))}>
        ${this.renderLike()}
    </sl-card>`;
  }

  
  static styles = [sharedStyles];
}
