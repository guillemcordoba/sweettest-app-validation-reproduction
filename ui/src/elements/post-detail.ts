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
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import './edit-post.js';

import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Post } from '../types.js';

/**
 * @element post-detail
 * @fires post-deleted: detail will contain { postHash }
 */
@localized()
@customElement('post-detail')
export class PostDetail extends LitElement {

  // REQUIRED. The hash of the Post to show
  @property(hashProperty('post-hash'))
  postHash!: ActionHash;

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

  async deletePost() {
    try {
      await this.postsStore.client.deletePost(this.postHash);
 
      this.dispatchEvent(new CustomEvent('post-deleted', {
        bubbles: true,
        composed: true,
        detail: {
          postHash: this.postHash
        }
      }));
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error deleting the post"));
    }
  }

  renderDetail(entryRecord: EntryRecord<Post>) {
    return html`
      <sl-card>
      	<div slot="header" class="row" style="gap: 8px">
          <span style="font-size: 18px; flex: 1;">${msg("Post")}</span>

          <sl-icon-button .src=${wrapPathInSvg(mdiPencil)} @click=${() => { this._editing = true; } }></sl-icon-button>
          <sl-icon-button .src=${wrapPathInSvg(mdiDelete)} @click=${() => this.deletePost()}></sl-icon-button>
        </div>

        <div class="column" style="gap: 16px;">
  
          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Title")}</strong></span>
 	        <span style="white-space: pre-line">${ entryRecord.entry.title }</span>
	  </div>

          <div class="column" style="gap: 8px;">
	        <span><strong>${msg("Needs")}</strong></span>
              ${ entryRecord.entry.needs.map(el => html`<span style="white-space: pre-line">${ el }</span>`)}	  </div>

      </div>
      </sl-card>
    `;
  }
  
  render() {
    return html`${subscribe(this.postsStore.posts.get(this.postHash).latestVersion,
      renderAsyncStatus({
        complete: post => {
          if (this._editing) {
      	  return html`<edit-post
      	    .originalPostHash=${this.postHash}
      	    .currentRecord=${ post }
              @post-updated=${async () => { this._editing = false; } }
        	    @edit-canceled=${() => { this._editing = false; } }
      	    style="display: flex; flex: 1;"
      	  ></edit-post>`;
        }

          return this.renderDetail(post);
        },
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the post")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  static styles = [sharedStyles];
}
