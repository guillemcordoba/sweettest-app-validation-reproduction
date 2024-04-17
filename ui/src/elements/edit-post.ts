import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, customElement, property } from 'lit/decorators.js';
import { ActionHash, Record, EntryHash, AgentPubKey } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashState, notifyError, sharedStyles, hashProperty, wrapPathInSvg, onSubmit } from '@holochain-open-dev/elements';
import { consume } from '@lit/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from '@mdi/js';

import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Post } from '../types.js';

/**
 * @element edit-post
 * @fires post-updated: detail will contain { originalPostHash, previousPostHash, updatedPostHash }
 */
@localized()
@customElement('edit-post')
export class EditPost extends LitElement {

  // REQUIRED. The hash of the original `Create` action for this Post
  @property(hashProperty('original-post-hash'))
  originalPostHash!: ActionHash;
  
  // REQUIRED. The current Post record that should be updated
  @property()
  currentRecord!: EntryRecord<Post>;
  
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
   
  /**
   * @internal
   */
  @state()
  _needsFields = this.currentRecord.entry.needs.map((_, index) => index);

  firstUpdated() {
    this.shadowRoot?.querySelector('form')!.reset();
  }

  async updatePost(fields: Partial<Post>) {  
    const post: Post = { 
      title: fields.title!,
      needs: (Array.isArray(fields.needs!) ? fields.needs! : [fields.needs!]).map((el: any) => el),
    };

    try {
      this.committing = true;
      const updateRecord = await this.postsStore.client.updatePost(
        this.originalPostHash,
        this.currentRecord.actionHash,
        post
      );
  
      this.dispatchEvent(new CustomEvent('post-updated', {
        composed: true,
        bubbles: true,
        detail: {
          originalPostHash: this.originalPostHash,
          previousPostHash: this.currentRecord.actionHash,
          updatedPostHash: updateRecord.actionHash
        }
      }));
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error updating the post"));
    }
    
    this.committing = false;
  }

  render() {
    return html`
      <sl-card>
        <span slot="header">${msg("Edit Post")}</span>

        <form 
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.updatePost(fields))}
        >  
          <div>
        <sl-input name="title" .label=${msg("Title")}  required .defaultValue=${ this.currentRecord.entry.title }></sl-input>          </div>

          <div>
        <div class="column" style="gap: 8px">
          <span>${msg("Needs")}</span>
        
          ${repeat(this._needsFields, i => i, index => html`<div class="row" style="align-items: center;"><sl-input name="needs" .label=${msg("")}  .defaultValue=${ this.currentRecord.entry.needs[index] }></sl-input> <sl-icon-button .src=${wrapPathInSvg(mdiDelete)} @click=${() => { this._needsFields = this._needsFields.filter(i => i !== index) } }></sl-icon-button></div>`)}
          <sl-button @click=${() => { this._needsFields = [...this._needsFields, Math.max(...this._needsFields) + 1]; } }>${msg("Add Needs")}</sl-button>
        </div>          </div>



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
