import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, property, query, customElement } from 'lit/decorators.js';
import { ActionHash, Record, DnaHash, AgentPubKey, EntryHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashProperty, notifyError, hashState, sharedStyles, onSubmit, wrapPathInSvg } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";


import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@holochain-open-dev/profiles/dist/elements/search-agent.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Like } from '../types.js';

/**
 * @element create-like
 * @fires like-created: detail will contain { likeHash }
 */
@localized()
@customElement('create-like')
export class CreateLike extends LitElement {
  // REQUIRED. The like hash for this Like
  @property(hashProperty('like-hash'))
  likeHash!: ActionHash;


  /**
   * @internal
   */
  @consume({ context: postsStoreContext, subscribe: true })
  postsStore!: PostsStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  /**
   * @internal
   */
  @query('#create-form')
  form!: HTMLFormElement;


  async createLike(fields: Partial<Like>) {
  
    const like: Like = {
      like_hash: this.likeHash!,
      agent: fields.agent!,
    };

    try {
      this.committing = true;
      const record: EntryRecord<Like> = await this.postsStore.client.createLike(like);

      this.dispatchEvent(new CustomEvent('like-created', {
        composed: true,
        bubbles: true,
        detail: {
          likeHash: record.actionHash
        }
      }));
      
      this.form.reset();
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error creating the like"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">
        <span slot="header">${msg("Create Like")}</span>

        <form 
          id="create-form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.createLike(fields))}
        >  
          <div>
          <search-agent name="agent" .fieldLabel=${msg("Agent")} required></search-agent>          </div>


          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Like")}</sl-button>
        </form> 
      </sl-card>`;
  }
  
  static styles = [sharedStyles];
}
