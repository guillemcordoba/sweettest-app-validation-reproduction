import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { AgentPubKey, EntryHash, ActionHash, Record } from '@holochain/client';
import { subscribe } from '@holochain-open-dev/stores';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { hashProperty, sharedStyles, wrapPathInSvg, renderAsyncStatus } from '@holochain-open-dev/elements';
import { mdiInformationOutline } from '@mdi/js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import './post-summary.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';

/**
 * @element posts-by-author
 */
@localized()
@customElement('posts-by-author')
export class PostsByAuthor extends LitElement {

  // REQUIRED. The author for which the Posts should be fetched
  @property(hashProperty('author'))
  author!: AgentPubKey;
  
  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  firstUpdated() {
    if (this.author === undefined) {
      throw new Error(`The author property is required for the PostsByAuthor element`);
    }
  }

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0) 
      return html` <div class="column center-content" style="gap: 16px;">
        <sl-icon
          .src=${wrapPathInSvg(mdiInformationOutline)}
          style="color: grey; height: 64px; width: 64px;"
          ></sl-icon
        >
        <span class="placeholder">${msg("No posts found")}</span>
      </div>`;

    return html`
      <div class="column" style="gap: 16px; flex: 1">
        ${hashes.map(hash => 
          html`<post-summary .postHash=${hash}></post-summary>`
        )}
      </div>
    `;
  }

  render() {
    return html`${subscribe(this.postsStore.postsByAuthor.get(this.author),
      renderAsyncStatus({
        complete: map => this.renderList(Array.from(map.keys())),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the posts")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  static styles = [sharedStyles];
}
