
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { Record, EntryHash, ActionHash, AgentPubKey } from '@holochain/client';
import { pipe, subscribe } from '@holochain-open-dev/stores';
import { EntryRecord, slice} from '@holochain-open-dev/utils';
import { renderAsyncStatus, hashProperty, sharedStyles, wrapPathInSvg } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiInformationOutline } from '@mdi/js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';


import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Like } from '../types.js';

import './like-summary.js';

/**
 * @element likes-for-like
 */
@localized()
@customElement('likes-for-like')
export class LikesForLike extends LitElement {

  // REQUIRED. The LikeHash for which the Likes should be fetched
  @property(hashProperty('like-hash'))
  likeHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;
 

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0) 
      return html` <div class="column center-content" style="gap: 16px;">
        <sl-icon
          style="color: grey; height: 64px; width: 64px;"
          .src=${wrapPathInSvg(mdiInformationOutline)}
        ></sl-icon>
        <span class="placeholder">${msg("No likes found for this like")}</span>
      </div>`;

    return html`
      <div style="display: flex; flex-direction: column">
        ${hashes.map(hash =>
          html`<like-summary .likeHash=${hash}></like-summary>`
        )}
      </div>
    `;
  }

  render() {
    return html`${subscribe(pipe(this.postsStore.likes.get(this.likeHash).likes.live, hashes => slice(this.postsStore.likes, hashes)),
      renderAsyncStatus({
        complete: map => this.renderList(Array.from(map.keys())),
        pending: () => html`<div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`,
        error: e => html`<display-error
          .headline=${msg("Error fetching the likes")}
          .error=${e}
        ></display-error>`
      })
    )}`;
  }
  
  static styles = [sharedStyles];
}
