import { 
  Record, 
  ActionHash, 
  DnaHash,
  SignedActionHashed,
  EntryHash, 
  AgentPubKey,
  Create,
  Update,
  Delete,
  CreateLink,
  DeleteLink
} from '@holochain/client';
import { ActionCommittedSignal } from '@holochain-open-dev/utils';

export type PostsSignal = ActionCommittedSignal<EntryTypes, LinkTypes>;

export type EntryTypes =
 | ({ type: 'Certificate'; } & Certificate)
 | ({ type: 'Like'; } & Like)
 | ({ type: 'Comment'; } & Comment)
 | ({  type: 'Post'; } & Post);

export type LinkTypes = string;



export interface Post { 
  title: string;

  needs: Array<string>;
}




export interface Comment { 
  post_hash: ActionHash;
}




export interface Like { 
  like_hash: ActionHash | undefined;

  agent: AgentPubKey;
}



export interface CertificateType {
  type:  
    | 'TypeOne'
        | 'TypeTwo'
    ;
}

export interface Certificate { 
  post_hash: ActionHash;

  agent: AgentPubKey;

  certifications_hashes: Array<EntryHash>;

  certificate_type: CertificateType;

  dna_hash: DnaHash;
}

