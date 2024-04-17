use hdk::prelude::*;
use holochain::sweettest::*;

use posts_integrity::*;



pub async fn sample_post_1(conductor: &SweetConductor, zome: &SweetZome) -> Post {
    Post {
	  title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
	  needs: vec!["Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string()],
    }
}

pub async fn sample_post_2(conductor: &SweetConductor, zome: &SweetZome) -> Post {
    Post {
	  title: "Lorem ipsum 2".to_string(),
	  needs: vec!["Lorem ipsum 2".to_string()],
    }
}

pub async fn create_post(conductor: &SweetConductor, zome: &SweetZome, post: Post) -> Record {
    let record: Record = conductor
        .call(zome, "create_post", post)
        .await;
    record
}



pub async fn sample_comment_1(conductor: &SweetConductor, zome: &SweetZome) -> Comment {
    Comment {
          post_hash: create_post(conductor, zome, sample_post_1(conductor, zome).await).await.signed_action.hashed.hash,
    }
}

pub async fn sample_comment_2(conductor: &SweetConductor, zome: &SweetZome) -> Comment {
    Comment {
          post_hash: create_post(conductor, zome, sample_post_2(conductor, zome).await).await.signed_action.hashed.hash,
    }
}

pub async fn create_comment(conductor: &SweetConductor, zome: &SweetZome, comment: Comment) -> Record {
    let record: Record = conductor
        .call(zome, "create_comment", comment)
        .await;
    record
}



pub async fn sample_like_1(conductor: &SweetConductor, zome: &SweetZome) -> Like {
    Like {
          like_hash: None,
	  agent: ::fixt::fixt!(AgentPubKey),
    }
}

pub async fn sample_like_2(conductor: &SweetConductor, zome: &SweetZome) -> Like {
    Like {
          like_hash: None,
	  agent: ::fixt::fixt!(AgentPubKey),
    }
}

pub async fn create_like(conductor: &SweetConductor, zome: &SweetZome, like: Like) -> Record {
    let record: Record = conductor
        .call(zome, "create_like", like)
        .await;
    record
}



pub async fn sample_certificate_1(conductor: &SweetConductor, zome: &SweetZome) -> Certificate {
    Certificate {
          post_hash: create_post(conductor, zome, sample_post_1(conductor, zome).await).await.signed_action.hashed.hash,
          agent: zome.cell_id().agent_pubkey().clone(),
          certifications_hashes: vec![],
	  certificate_type: CertificateType::TypeOne,
	  dna_hash: ::fixt::fixt!(DnaHash),
    }
}

pub async fn sample_certificate_2(conductor: &SweetConductor, zome: &SweetZome) -> Certificate {
    Certificate {
          post_hash: create_post(conductor, zome, sample_post_2(conductor, zome).await).await.signed_action.hashed.hash,
          agent: zome.cell_id().agent_pubkey().clone(),
          certifications_hashes: vec![],
	  certificate_type: CertificateType::TypeTwo
,
	  dna_hash: ::fixt::fixt!(DnaHash),
    }
}

pub async fn create_certificate(conductor: &SweetConductor, zome: &SweetZome, certificate: Certificate) -> Record {
    let record: Record = conductor
        .call(zome, "create_certificate", certificate)
        .await;
    record
}

