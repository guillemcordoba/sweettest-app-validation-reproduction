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
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';

import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { PostsStore } from '../posts-store.js';
import { postsStoreContext } from '../context.js';
import { Post } from '../types.js';

/**
 * @element create-post
 * @fires post-created: detail will contain { postHash }
 */
@localized()
@customElement('create-post')
export class CreatePost extends LitElement {

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

  /**
   * @internal
   */
  @state()
  _needsFields = [0];

  async createPost(fields: Partial<Post>) {
  
    const post: Post = {
      title: fields.title!,
      needs: (Array.isArray(fields.needs!) ? fields.needs! : [fields.needs!]).map((el: any) => el),
    };

    try {
      this.committing = true;
      const record: EntryRecord<Post> = await this.postsStore.client.createPost(post);

      this.dispatchEvent(new CustomEvent('post-created', {
        composed: true,
        bubbles: true,
        detail: {
          postHash: record.actionHash
        }
      }));
      
      this.form.reset();
    } catch (e: unknown) {
      console.error(e);
      notifyError(msg("Error creating the post"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">
        <span slot="header">${msg("Create Post")}</span>

        <form 
          id="create-form"
          class="column"
          style="flex: 1; gap: 16px;"
          ${onSubmit(fields => this.createPost(fields))}
        >  
          <div>
          <sl-input name="title" .label=${msg("Title")}  required></sl-input>          </div>

          <div>
          <div class="column" style="gap: 8px">
            <span>${msg("Needs")}</span>
          
            ${repeat(this._needsFields, i => i, index => html`<div class="row" style="align-items: center;"><sl-input name="needs" .label=${msg("")} ></sl-input> <sl-icon-button .src=${wrapPathInSvg(mdiDelete)} @click=${() => { this._needsFields = this._needsFields.filter(i => i !== index) } }></sl-icon-button></div>`)}
            <sl-button @click=${() => { this._needsFields = [...this._needsFields, Math.max(...this._needsFields) + 1]; } }>${msg("Add Needs")}</sl-button>
          </div>          </div>


          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Post")}</sl-button>
        </form> 
      </sl-card>`;
  }
  
  static styles = [sharedStyles];
}
