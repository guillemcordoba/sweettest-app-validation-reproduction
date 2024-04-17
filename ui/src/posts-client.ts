import { Certificate } from './types.js';

import { Like } from './types.js';

import { Comment } from './types.js';

import { Post } from './types.js';

import { 
  SignedActionHashed,
  CreateLink,
  Link,
  DeleteLink,
  Delete,
  AppAgentClient, 
  Record, 
  ActionHash, 
  EntryHash, 
  AgentPubKey,
} from '@holochain/client';
import { isSignalFromCellWithRole, EntryRecord, ZomeClient } from '@holochain-open-dev/utils';

import { PostsSignal } from './types.js';

export class PostsClient extends ZomeClient<PostsSignal> {
  constructor(public client: AppAgentClient, public roleName: string, public zomeName = 'posts') {
    super(client, roleName, zomeName);
  }
  /** Post */

  async createPost(post: Post): Promise<EntryRecord<Post>> {
    const record: Record = await this.callZome('create_post', post);
    return new EntryRecord(record);
  }
  
  async getLatestPost(postHash: ActionHash): Promise<EntryRecord<Post> | undefined> {
    const record: Record = await this.callZome('get_latest_post', postHash);
    return record ? new EntryRecord(record) : undefined;
  }

  async getOriginalPost(postHash: ActionHash): Promise<EntryRecord<Post> | undefined> {
    const record: Record = await this.callZome('get_original_post', postHash);
    return record ? new EntryRecord(record) : undefined;
  }

  async getAllRevisionsForPost(postHash: ActionHash): Promise<Array<EntryRecord<Post>>> {
    const records: Record[] = await this.callZome('get_all_revisions_for_post', postHash);
    return records.map(r => new EntryRecord(r));
  }

  async updatePost(originalPostHash: ActionHash, previousPostHash: ActionHash, updatedPost: Post): Promise<EntryRecord<Post>> {
    const record: Record = await this.callZome('update_post', {
      original_post_hash: originalPostHash,
      previous_post_hash: previousPostHash,
      updated_post: updatedPost
    });
    return new EntryRecord(record);
  }

  deletePost(originalPostHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_post', originalPostHash);
  }

  getAllDeletesForPost(originalPostHash: ActionHash): Promise<Array<SignedActionHashed<Delete>>> {
    return this.callZome('get_all_deletes_for_post', originalPostHash);
  }

  getOldestDeleteForPost(originalPostHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    return this.callZome('get_oldest_delete_for_post', originalPostHash);
  }
  /** Comment */

  async createComment(comment: Comment): Promise<EntryRecord<Comment>> {
    const record: Record = await this.callZome('create_comment', comment);
    return new EntryRecord(record);
  }
  
  async getLatestComment(commentHash: ActionHash): Promise<EntryRecord<Comment> | undefined> {
    const record: Record = await this.callZome('get_latest_comment', commentHash);
    return record ? new EntryRecord(record) : undefined;
  }

  async getOriginalComment(commentHash: ActionHash): Promise<EntryRecord<Comment> | undefined> {
    const record: Record = await this.callZome('get_original_comment', commentHash);
    return record ? new EntryRecord(record) : undefined;
  }

  async getAllRevisionsForComment(commentHash: ActionHash): Promise<Array<EntryRecord<Comment>>> {
    const records: Record[] = await this.callZome('get_all_revisions_for_comment', commentHash);
    return records.map(r => new EntryRecord(r));
  }

  async updateComment(previousCommentHash: ActionHash, updatedComment: Comment): Promise<EntryRecord<Comment>> {
    const record: Record = await this.callZome('update_comment', {
      previous_comment_hash: previousCommentHash,
      updated_comment: updatedComment
    });
    return new EntryRecord(record);
  }

  deleteComment(originalCommentHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_comment', originalCommentHash);
  }

  getAllDeletesForComment(originalCommentHash: ActionHash): Promise<Array<SignedActionHashed<Delete>>> {
    return this.callZome('get_all_deletes_for_comment', originalCommentHash);
  }

  getOldestDeleteForComment(originalCommentHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    return this.callZome('get_oldest_delete_for_comment', originalCommentHash);
  }
  
  async getCommentsForPost(postHash: ActionHash): Promise<Array<Link>> {
    return this.callZome('get_comments_for_post', postHash);
  }

  async getDeletedCommentsForPost(postHash: ActionHash): Promise<Array<[SignedActionHashed<CreateLink>, SignedActionHashed<DeleteLink>[]]>> {
    return this.callZome('get_deleted_comments_for_post', postHash);
  }
  /** Like */

  async createLike(like: Like): Promise<EntryRecord<Like>> {
    const record: Record = await this.callZome('create_like', like);
    return new EntryRecord(record);
  }
  
  async getLike(likeHash: ActionHash): Promise<EntryRecord<Like> | undefined> {
    const record: Record = await this.callZome('get_like', likeHash);
    return record ? new EntryRecord(record) : undefined;
  }

  deleteLike(originalLikeHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_like', originalLikeHash);
  }

  getAllDeletesForLike(originalLikeHash: ActionHash): Promise<Array<SignedActionHashed<Delete>>> {
    return this.callZome('get_all_deletes_for_like', originalLikeHash);
  }

  getOldestDeleteForLike(originalLikeHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    return this.callZome('get_oldest_delete_for_like', originalLikeHash);
  }
  
  async getLikesForLike(likeHash: ActionHash): Promise<Array<Link>> {
    return this.callZome('get_likes_for_like', likeHash);
  }

  async getDeletedLikesForLike(likeHash: ActionHash): Promise<Array<[SignedActionHashed<CreateLink>, SignedActionHashed<DeleteLink>[]]>> {
    return this.callZome('get_deleted_likes_for_like', likeHash);
  }
  /** Certificate */

  async createCertificate(certificate: Certificate): Promise<EntryRecord<Certificate>> {
    const record: Record = await this.callZome('create_certificate', certificate);
    return new EntryRecord(record);
  }
  
  async getCertificate(certificateHash: ActionHash): Promise<EntryRecord<Certificate> | undefined> {
    const record: Record = await this.callZome('get_certificate', certificateHash);
    return record ? new EntryRecord(record) : undefined;
  }

  
  async getCertificatesForPost(postHash: ActionHash): Promise<Array<Link>> {
    return this.callZome('get_certificates_for_post', postHash);
  }

  async getCertificatesForCertified(certified: AgentPubKey): Promise<Array<Link>> {
    return this.callZome('get_certificates_for_certified', certified);
  }

  async getCertificatesForCertificate(certificateHash: EntryHash): Promise<Array<Link>> {
    return this.callZome('get_certificates_for_certificate', certificateHash);
  }

  /** All Posts */

  async getAllPosts(): Promise<Array<Link>> {
    return this.callZome('get_all_posts', undefined);
  }

  /** Posts By Author */

  async getPostsByAuthor(author: AgentPubKey): Promise<Array<Link>> {
    return this.callZome('get_posts_by_author', author);
  }

  /** All Posts Entry Hash */

  async getAllPostsEntryHash(): Promise<Array<Link>> {
    return this.callZome('get_all_posts_entry_hash', undefined);
  }

  /** Posts By Author Entry Hash */

  async getPostsByAuthorEntryHash(author: AgentPubKey): Promise<Array<Link>> {
    return this.callZome('get_posts_by_author_entry_hash', author);
  }

}
