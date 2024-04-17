import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, sharedStyles, hashProperty, wrapPathInSvg, notifyError } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiPencil, mdiDelete } from '@mdi/js';

import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import './edit-comment.js';

import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Comment } from '../types.js';

/**
 * @element comment-detail
 * @fires comment-deleted: detail will contain { commentHash }
 */
@localized()
@customElement('comment-detail')
export class CommentDetail extends LitElement {

  // REQUIRED. The hash of the Comment to show
  @property(hashProperty('comment-hash'))
  commentHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  /**
   * @internal
   */
  @state()
  _editing = false;

  async deleteComment() {
    try {
      await this.postsStore.client.deleteComment(this.commentHash);
 
      this.dispatchEvent(new CustomEvent('comment-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          commentHash: this.commentHash
        }
      }));
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error deleting the comment"));
    }
  }

  renderDetail(entryRecord: EntryRecord<Comment>) {
    return html`
      <sl-card>
      	<div slot="header" class="row" style="gap: 8px">
          <span style="font-size: 18px; flex: 1;">${msg("Comment")}</span>

          <sl-icon-button .src=${wrapPathInSvg(mdiPencil)} @click=${() => { this._editing = true; } }></sl-icon-button>
          <sl-icon-button .src=${wrapPathInSvg(mdiDelete)} @click=${() => this.deleteComment()}></sl-icon-button>
        </div>

        <div class="column" style="gap: 16px;">
  
      </div>
      </sl-card>
    `;
  }
  
  render() {
    return html`${subscribe(this.postsStore.comments.get(this.commentHash).latestVersion,
      renderAsyncStatus({
        complete: comment => {
          if (this._editing) {
      	  return html`<edit-comment
      	    .currentRecord=${ comment }
              @comment-updated=${async () => { this._editing = false; } }
        	    @edit-canceled=${() => { this._editing = false; } }
      	    style="display: flex; flex: 1;"
      	  ></edit-comment>`;
        }

          return this.renderDetail(comment);
        },
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
  
  static styles = [sharedStyles];
}
