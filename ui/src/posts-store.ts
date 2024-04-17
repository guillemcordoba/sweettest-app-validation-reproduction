import { Certificate } from './types.js';

import { Like } from './types.js';

import { Comment } from './types.js';

import { Post } from './types.js';

import { 
  collectionStore, 
  liveLinksStore, 
  deletedLinksStore, 
  allRevisionsOfEntryStore,
  latestVersionOfEntryStore, 
  immutableEntryStore, 
  deletesForEntryStore, 
  AsyncReadable,
  pipe
} from "@holochain-open-dev/stores";
import { slice, HashType, retype, EntryRecord, LazyHoloHashMap } from "@holochain-open-dev/utils";
import { NewEntryAction, Record, ActionHash, EntryHash, AgentPubKey } from '@holochain/client';

import { PostsClient } from './posts-client.js';

export class PostsStore {
  constructor(public client: PostsClient) {}
  
  /** Post */

  posts = new LazyHoloHashMap((postHash: ActionHash) => ({
    latestVersion: latestVersionOfEntryStore(this.client, () => this.client.getLatestPost(postHash)),
      original: immutableEntryStore(() => this.client.getOriginalPost(postHash)),
      allRevisions: allRevisionsOfEntryStore(this.client, () => this.client.getAllRevisionsForPost(postHash)),
      deletes: deletesForEntryStore(this.client, postHash, () => this.client.getAllDeletesForPost(postHash)),
    comments: {
      live: pipe(
        liveLinksStore(
          this.client,
          postHash,
          () => this.client.getCommentsForPost(postHash),
          'PostToComments'
        ), 
        links => slice(this.comments, links.map(l => l.target))
      ),
      deleted: pipe(
        deletedLinksStore(
          this.client,
          postHash,
          () => this.client.getDeletedCommentsForPost(postHash),
          'PostToComments'
        ), links => slice(this.comments, links.map(l => l[0].hashed.content.target_address))
      ),
    },
    certificates: pipe(
        liveLinksStore(
          this.client,
          postHash,
          () => this.client.getCertificatesForPost(postHash),
          'PostToCertificates'
        ), links => slice(this.certificates, links.map(l => l.target))
      ),
    })
  );

  /** Comment */

  comments = new LazyHoloHashMap((commentHash: ActionHash) => ({
      latestVersion: latestVersionOfEntryStore(this.client, () => this.client.getLatestComment(commentHash)),
      original: immutableEntryStore(() => this.client.getOriginalComment(commentHash)),
      allRevisions: allRevisionsOfEntryStore(this.client, () => this.client.getAllRevisionsForComment(commentHash)),
      deletes: deletesForEntryStore(this.client, commentHash, () => this.client.getAllDeletesForComment(commentHash)),
    })
  );

  /** Like */

  likes = new LazyHoloHashMap((likeHash: ActionHash) => ({
      entry: immutableEntryStore(() => this.client.getLike(likeHash)),
      deletes: deletesForEntryStore(this.client, likeHash, () => this.client.getAllDeletesForLike(likeHash)),
      likes: {
          live: pipe(
            liveLinksStore(
              this.client,
              likeHash,
              () => this.client.getLikesForLike(likeHash),
              'LikeToLikes'
            ), links => links.map(l => l.target)
          ),
          deleted: pipe(
            deletedLinksStore(
              this.client,
              likeHash,
              () => this.client.getDeletedLikesForLike(likeHash),
              'LikeToLikes'
            ), links=> links.map(l => l[0].hashed.content.target_address)
          ),
      },
    })
  );

  /** Certificate */

  certificates = new LazyHoloHashMap((certificateHash: ActionHash) => ({
      entry: immutableEntryStore(() => this.client.getCertificate(certificateHash)),
      certificates: pipe(
          liveLinksStore(
            this.client,
            certificateHash,
            () => this.client.getCertificatesForCertificate(certificateHash),
            'CertificateToCertificates'
          ), 
          links => links.map(l => l.target)
        ),
    })
  );

  certificatesForCertified = new LazyHoloHashMap((certified: AgentPubKey) => pipe(
      liveLinksStore(
        this.client,
        certified,
        () => this.client.getCertificatesForCertified(certified),
        'CertifiedToCertificates'
      ), links => slice(this.certificates, links.map(l => l.target))
    ),
  );
  
  /** All Posts */

  allPosts = pipe(
    collectionStore(
      this.client, 
      () => this.client.getAllPosts(),
      'AllPosts'
    ),
    allPosts => slice(this.posts, allPosts.map(l => l.target))
  );
  
  /** Posts By Author */

  postsByAuthor = new LazyHoloHashMap((author: AgentPubKey) => 
    pipe(
      collectionStore(
        this.client, 
        () => this.client.getPostsByAuthor(author),
        'PostsByAuthor'
      ),
      postsByAuthor => slice(this.posts, postsByAuthor.map(l => l.target))
    )
  );
  
  /** All Posts Entry Hash */

  allPostsEntryHash = pipe(
    collectionStore(
      this.client, 
      () => this.client.getAllPostsEntryHash(),
      'AllPostsEntryHash'
    ),
    allPostsEntryHash => slice(this.posts, allPostsEntryHash.map(l => l.target))
  );
  
  /** Posts By Author Entry Hash */

  postsByAuthorEntryHash = new LazyHoloHashMap((author: AgentPubKey) => 
    pipe(
      collectionStore(
        this.client, 
        () => this.client.getPostsByAuthorEntryHash(author),
        'PostsByAuthorEntryHash'
      ),
      postsByAuthorEntryHash => slice(this.posts, postsByAuthorEntryHash.map(l => l.target))
    )
  );
}
