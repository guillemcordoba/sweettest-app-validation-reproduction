import { Certificate } from './types.js';

import { Like } from './types.js';

import { Comment } from './types.js';

import { Post } from './types.js';

import {
  AgentPubKeyMap,
  decodeEntry,
  fakeEntry,
  fakeCreateAction,
  fakeUpdateEntry,
  fakeDeleteEntry,
  fakeRecord,
  pickBy,
  ZomeMock,
  RecordBag,
  entryState,
  HoloHashMap,
  HashType,
  hash
} from "@holochain-open-dev/utils";
import {
  decodeHashFromBase64,
  NewEntryAction,
  AgentPubKey,
  ActionHash,
  EntryHash,
  Delete,
  AppAgentClient,
  fakeAgentPubKey,
  fakeDnaHash,
  Link,
  fakeActionHash,
  SignedActionHashed,
  fakeEntryHash,
  Record,
} from "@holochain/client";
import { PostsClient } from './posts-client.js'

export class PostsZomeMock extends ZomeMock implements AppAgentClient {
  constructor(
    myPubKey?: AgentPubKey
  ) {
    super("posts_test", "posts", myPubKey);
  }
  /** Post */
  posts = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();

  async create_post(post: Post): Promise<Record> {
    const entryHash = hash(post, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(post));
    
    this.posts.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record]
    });
  

    return record;
  }
  
  async get_latest_post(postHash: ActionHash): Promise<Record | undefined> {
    const post = this.posts.get(postHash);
    return post ? post.revisions[post.revisions.length - 1] : undefined;
  }
  
  async get_all_revisions_for_post(postHash: ActionHash): Promise<Record[] | undefined> {
    const post = this.posts.get(postHash);
    return post ? post.revisions : undefined;
  }
  
  async get_original_post(postHash: ActionHash): Promise<Record | undefined> {
    const post = this.posts.get(postHash);
    return post ? post.revisions[0] : undefined;
  }
  
  async get_all_deletes_for_post(postHash: ActionHash): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const post = this.posts.get(postHash);
    return post ? post.deletes : undefined;
  }

  async get_oldest_delete_for_post(postHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    const post = this.posts.get(postHash);
    return post ? post.deletes[0] : undefined;
  }
  async delete_post(original_post_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(await fakeDeleteEntry(original_post_hash));
    
    this.posts.get(original_post_hash).deletes.push(record.signed_action as SignedActionHashed<Delete>);
    
    return record.signed_action.hashed.hash;
  }

  async update_post(input: { original_post_hash: ActionHash; previous_post_hash: ActionHash; updated_post: Post; }): Promise<Record> {
    const record = await fakeRecord(await fakeUpdateEntry(input.previous_post_hash, undefined, undefined, fakeEntry(input.updated_post)), fakeEntry(input.updated_post));

  this.posts.get(input.original_post_hash).revisions.push(record);
     
    const post = input.updated_post;
    
    
    return record;
  }
  /** Comment */
  comments = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();
  commentsForPost = new HoloHashMap<ActionHash, Link[]>();

  async create_comment(comment: Comment): Promise<Record> {
    const entryHash = hash(comment, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(comment));
    
    this.comments.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record]
    });
  
    const existingPostHash = this.commentsForPost.get(comment.post_hash) || [];
    this.commentsForPost.set(comment.post_hash, [...existingPostHash, { 
      target: record.signed_action.hashed.hash, 
      author: this.myPubKey,
      timestamp: Date.now() * 1000,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    }]);

    return record;
  }
  
  async get_latest_comment(commentHash: ActionHash): Promise<Record | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.revisions[comment.revisions.length - 1] : undefined;
  }
  
  async get_all_revisions_for_comment(commentHash: ActionHash): Promise<Record[] | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.revisions : undefined;
  }
  
  async get_original_comment(commentHash: ActionHash): Promise<Record | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.revisions[0] : undefined;
  }
  
  async get_all_deletes_for_comment(commentHash: ActionHash): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.deletes : undefined;
  }

  async get_oldest_delete_for_comment(commentHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    const comment = this.comments.get(commentHash);
    return comment ? comment.deletes[0] : undefined;
  }
  async delete_comment(original_comment_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(await fakeDeleteEntry(original_comment_hash));
    
    this.comments.get(original_comment_hash).deletes.push(record.signed_action as SignedActionHashed<Delete>);
    
    return record.signed_action.hashed.hash;
  }

  async update_comment(input: { previous_comment_hash: ActionHash; updated_comment: Comment; }): Promise<Record> {
    const record = await fakeRecord(await fakeUpdateEntry(input.previous_comment_hash, undefined, undefined, fakeEntry(input.updated_comment)), fakeEntry(input.updated_comment));

    for (const [originalHash, comment] of Array.from(this.comments.entries())) {
      if (comment.revisions.find(r => r.signed_action.hashed.hash.toString() === input.previous_comment_hash.toString())) {
        comment.revisions.push(record);
      }
    }
     
    const comment = input.updated_comment;
    
    const existingPostHash = this.commentsForPost.get(comment.post_hash) || [];
    this.commentsForPost.set(comment.post_hash, [...existingPostHash, {
      target: record.signed_action.hashed.hash, 
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    }]);
    
    return record;
  }
  
  async get_comments_for_post(postHash: ActionHash): Promise<Array<Link>> {
    return this.commentsForPost.get(postHash) || [];
  }
  /** Like */
  likes = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();
  likesForLike = new HoloHashMap<ActionHash, Link[]>();

  async create_like(like: Like): Promise<Record> {
    const entryHash = hash(like, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(like));
    
    this.likes.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record]
    });
  
    if (like.like_hash) {
      const existingLikeHash = this.likesForLike.get(like.like_hash) || [];
      this.likesForLike.set(like.like_hash, [...existingLikeHash, { 
        target: record.signed_action.hashed.hash, 
        author: this.myPubKey,
        timestamp: Date.now() * 1000,
        zome_index: 0,
        link_type: 0,
        tag: new Uint8Array(),
        create_link_hash: await fakeActionHash()
      }]);
    }

    return record;
  }
  
  async get_like(likeHash: ActionHash): Promise<Record | undefined> {
    const like = this.likes.get(likeHash);
    return like ? like.revisions[0] : undefined;
  }
  
  async get_all_deletes_for_like(likeHash: ActionHash): Promise<Array<SignedActionHashed<Delete>> | undefined> {
    const like = this.likes.get(likeHash);
    return like ? like.deletes : undefined;
  }

  async get_oldest_delete_for_like(likeHash: ActionHash): Promise<SignedActionHashed<Delete> | undefined> {
    const like = this.likes.get(likeHash);
    return like ? like.deletes[0] : undefined;
  }
  async delete_like(original_like_hash: ActionHash): Promise<ActionHash> {
    const record = await fakeRecord(await fakeDeleteEntry(original_like_hash));
    
    this.likes.get(original_like_hash).deletes.push(record.signed_action as SignedActionHashed<Delete>);
    
    return record.signed_action.hashed.hash;
  }

  
  async get_likes_for_like(likeHash: ActionHash): Promise<Array<Link>> {
    return this.likesForLike.get(likeHash) || [];
  }
  /** Certificate */
  certificates = new HoloHashMap<ActionHash, {
    deletes: Array<SignedActionHashed<Delete>>;
    revisions: Array<Record>;
  }>();
  certificatesForPost = new HoloHashMap<ActionHash, Link[]>();
  certificatesForCertified = new HoloHashMap<ActionHash, Link[]>();
  certificatesForCertificate = new HoloHashMap<ActionHash, Link[]>();

  async create_certificate(certificate: Certificate): Promise<Record> {
    const entryHash = hash(certificate, HashType.ENTRY);
    const record = await fakeRecord(await fakeCreateAction(entryHash), fakeEntry(certificate));
    
    this.certificates.set(record.signed_action.hashed.hash, {
      deletes: [],
      revisions: [record]
    });
  
    const existingPostHash = this.certificatesForPost.get(certificate.post_hash) || [];
    this.certificatesForPost.set(certificate.post_hash, [...existingPostHash, { 
      target: record.signed_action.hashed.hash, 
      author: this.myPubKey,
      timestamp: Date.now() * 1000,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    }]);
    const existingAgent = this.certificatesForCertified.get(certificate.agent) || [];
    this.certificatesForCertified.set(certificate.agent, [...existingAgent, { 
      target: record.signed_action.hashed.hash, 
      author: this.myPubKey,
      timestamp: Date.now() * 1000,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    }]);
    await Promise.all(certificate.certifications_hashes.map(async certifications_hashes => {
      const existingCertificationsHashes = this.certificatesForCertificate.get(certifications_hashes) || [];
      this.certificatesForCertificate.set(certifications_hashes, [...existingCertificationsHashes, { 
        target: record.signed_action.hashed.hash, 
        author: this.myPubKey,
        timestamp: Date.now() * 1000,
        zome_index: 0,
        link_type: 0,
        tag: new Uint8Array(),
        create_link_hash: await fakeActionHash()
      }]);
    }));

    return record;
  }
  
  async get_certificate(certificateHash: ActionHash): Promise<Record | undefined> {
    const certificate = this.certificates.get(certificateHash);
    return certificate ? certificate.revisions[0] : undefined;
  }
  

  
  async get_certificates_for_post(postHash: ActionHash): Promise<Array<Link>> {
    return this.certificatesForPost.get(postHash) || [];
  }

  async get_certificates_for_certified(certified: AgentPubKey): Promise<Array<Link>> {
    return this.certificatesForCertified.get(certified) || [];
  }

  async get_certificates_for_certificate(certificateHash: EntryHash): Promise<Array<Link>> {
    return this.certificatesForCertificate.get(certificateHash) || [];
  }
  
  async get_all_posts(): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.posts.values()).map(r => r.revisions[r.revisions.length - 1]);
    return Promise.all(records.map(async record => ({ 
      target: record.signed_action.hashed.hash, 
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    })));
  }
  
  async get_posts_by_author(author: AgentPubKey): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.posts.values()).map(r => r.revisions[r.revisions.length - 1]).filter(r => r.signed_action.hashed.content.author.toString() === author.toString());
    return Promise.all(records.map(async record => ({ 
      target: record.signed_action.hashed.hash, 
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    })));
  }
  
  async get_all_posts_entry_hash(): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.posts.values()).map(r => r.revisions[r.revisions.length - 1]);
    return Promise.all(records.map(async record => ({ 
      target: (record.signed_action.hashed.content as NewEntryAction).entry_hash, 
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    })));
  }
  
  async get_posts_by_author_entry_hash(author: AgentPubKey): Promise<Array<Link>> {
    const records: Record[] = Array.from(this.posts.values()).map(r => r.revisions[r.revisions.length - 1]).filter(r => r.signed_action.hashed.content.author.toString() === author.toString());
    return Promise.all(records.map(async record => ({ 
      target: (record.signed_action.hashed.content as NewEntryAction).entry_hash, 
      author: record.signed_action.hashed.content.author,
      timestamp: record.signed_action.hashed.content.timestamp,
      zome_index: 0,
      link_type: 0,
      tag: new Uint8Array(),
      create_link_hash: await fakeActionHash()
    })));
  }


}

export async function samplePost(client: PostsClient, partialPost: Partial<Post> = {}): Promise<Post> {
    return {
        ...{
          title: "Lorem ipsum 2",
          needs: ["Lorem ipsum 2"],
        },
        ...partialPost
    };
}

export async function sampleComment(client: PostsClient, partialComment: Partial<Comment> = {}): Promise<Comment> {
    return {
        ...{
          post_hash: partialComment.post_hash || (await client.createPost(await samplePost(client))).actionHash,
        },
        ...partialComment
    };
}

export async function sampleLike(client: PostsClient, partialLike: Partial<Like> = {}): Promise<Like> {
    return {
        ...{
          like_hash: undefined,
          agent: (await fakeAgentPubKey()),
        },
        ...partialLike
    };
}

export async function sampleCertificate(client: PostsClient, partialCertificate: Partial<Certificate> = {}): Promise<Certificate> {
    return {
        ...{
          post_hash: partialCertificate.post_hash || (await client.createPost(await samplePost(client))).actionHash,
          agent: client.client.myPubKey,
          certifications_hashes: [],
          certificate_type: { type: 'TypeOne' },
          dna_hash: (await fakeDnaHash()),
        },
        ...partialCertificate
    };
}




