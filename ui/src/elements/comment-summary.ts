import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';

import { localized, msg } from '@lit/localize';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Comment } from '../types.js';

/**
 * @element comment-summary
 * @fires comment-selected: detail will contain { commentHash }
 */
@localized()
@customElement('comment-summary')
export class CommentSummary extends LitElement {

  // REQUIRED. The hash of the Comment to show
  @property(hashProperty('comment-hash'))
  commentHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  renderSummary(entryRecord: EntryRecord<Comment>) {
    return html`
      <div class="column" style="gap: 16px;">

      </div>
    `;
  }
  
  renderComment() {
    return html`${subscribe(this.postsStore.comments.get(this.commentHash).latestVersion,
      renderAsyncStatus({
        complete: comment => this.renderSummary(comment),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the comment")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() => this.dispatchEvent(new CustomEvent('comment-selected', {
          composed: true,
          bubbles: true,
          detail: {
            commentHash: this.commentHash
          }
        }))}>
        ${this.renderComment()}
    </sl-card>`;
  }

  
  static styles = [sharedStyles];
}
