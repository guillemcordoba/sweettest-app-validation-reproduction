import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, customElement, property } from 'lit/decorators.js';
import { ActionHash, Record, EntryHash, AgentPubKey } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashState, notifyError, sharedStyles, hashProperty, wrapPathInSvg, onSubmit } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from '@mdi/js';

import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Comment } from '../types.js';

/**
 * @element edit-comment
 * @fires comment-updated: detail will contain { previousCommentHash, updatedCommentHash }
 */
@localized()
@customElement('edit-comment')
export class EditComment extends LitElement {

  
  // REQUIRED. The current Comment record that should be updated
  @property()
  currentRecord!: EntryRecord<Comment>;
  
  /**
   * @internal
   */
  @consume({ context: postsStoreContext })
  postsStore!: PostsStore;

  /**
   * @internal
   */
  @state()
  committing = false;
   

  firstUpdated() {
    this.shadowRoot?.querySelector('form')!.reset();
  }

  async updateComment(fields: Partial<Comment>) {  
    const comment: Comment = { 
      post_hash: this.currentRecord.entry.post_hash!,
    };

    try {
      this.committing = true;
      const updateRecord = await this.postsStore.client.updateComment(
        this.currentRecord.actionHash,
        comment
      );
  
      this.dispatchEvent(new CustomEvent('comment-updated', {
        composed: true,
        bubbles: true,
        detail: {
          previousCommentHash: this.currentRecord.actionHash,
          updatedCommentHash: updateRecord.actionHash
        }
      }));
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error updating the comment"));
    }
    
    this.committing = false;
  }

  render() {
    return html`
      <sl-card>
        <span slot="header">${msg("Edit Comment")}</span>

        <form 
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.updateComment(fields))}
        >  


          <div class="row" style="gap: 8px;">
            <sl-button
              @click=${() => this.dispatchEvent(new CustomEvent('edit-canceled', {
                bubbles: true,
                composed: true
              }))}
              style="flex: 1;"
            >${msg("Cancel")}</sl-button>
            <sl-button
              type="submit"
              variant="primary"
              style="flex: 1;"
              .loading=${this.committing}
            >${msg("Save")}</sl-button>

          </div>
        </form>
      </sl-card>`;
  }

  static styles = [sharedStyles];
}
