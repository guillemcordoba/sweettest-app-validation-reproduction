import { LitElement, html } from 'lit';
import { state, property, customElement } from 'lit/decorators.js';
import { EntryHash, Record, ActionHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { subscribe } from '@holochain-open-dev/stores';
import { renderAsyncStatus, hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';

import { localized, msg } from '@lit/localize';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';

import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Post } from '../types.js';

/**
 * @element post-summary
 * @fires post-selected: detail will contain { postHash }
 */
@localized()
@customElement('post-summary')
export class PostSummary extends LitElement {

  // REQUIRED. The hash of the Post to show
  @property(hashProperty('post-hash'))
  postHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  renderSummary(entryRecord: EntryRecord<Post>) {
    return html`
      <div class="column" style="gap: 16px;">

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Title")}</strong></span>
 	        <span style="white-space: pre-line">${ entryRecord.entry.title }</span>
	  </div>

          <div class="column" style="gap: 8px">
	        <span><strong>${msg("Needs")}</strong></span>
              ${ entryRecord.entry.needs.map(el => html`<span style="white-space: pre-line">${ el }</span>`)}	  </div>

      </div>
    `;
  }
  
  renderPost() {
    return html`${subscribe(this.postsStore.posts.get(this.postHash).latestVersion,
      renderAsyncStatus({
        complete: post => this.renderSummary(post),
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
  
  render() {
    return html`<sl-card style="flex: 1; cursor: grab;" @click=${() => this.dispatchEvent(new CustomEvent('post-selected', {
          composed: true,
          bubbles: true,
          detail: {
            postHash: this.postHash
          }
        }))}>
        ${this.renderPost()}
    </sl-card>`;
  }

  
  static styles = [sharedStyles];
}
