import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, property, query, customElement } from 'lit/decorators.js';
import { ActionHash, Record, DnaHash, AgentPubKey, EntryHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashProperty, notifyError, hashState, sharedStyles, onSubmit, wrapPathInSvg } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";

import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Comment } from '../types.js';

/**
 * @element create-comment
 * @fires comment-created: detail will contain { commentHash }
 */
@localized()
@customElement('create-comment')
export class CreateComment extends LitElement {
  // REQUIRED. The post hash for this Comment
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
  committing = false;

  /**
   * @internal
   */
  @query('#create-form')
  form!: HTMLFormElement;


  async createComment(fields: Partial<Comment>) {
    if (this.postHash === undefined) throw new Error('Cannot create a new Comment without its post_hash field');
  
    const comment: Comment = {
      post_hash: this.postHash!,
    };

    try {
      this.committing = true;
      const record: EntryRecord<Comment> = await this.postsStore.client.createComment(comment);

      this.dispatchEvent(new CustomEvent('comment-created', {
        composed: true,
        bubbles: true,
        detail: {
          commentHash: record.actionHash
        }
      }));
      
      this.form.reset();
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error creating the comment"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">
        <span slot="header">${msg("Create Comment")}</span>

        <form 
          id="create-form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.createComment(fields))}
        >  

          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Comment")}</sl-button>
        </form> 
      </sl-card>`;
  }
  
  static styles = [sharedStyles];
}
