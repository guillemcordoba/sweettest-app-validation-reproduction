#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use std::time::Duration;
use hdk::prelude::*;
use holochain::{conductor::config::ConductorConfig, sweettest::*};

use posts_integrity::*;

use posts::post::UpdatePostInput;

mod common;
use common::{create_post, sample_post_1, sample_post_2};


#[tokio::test(flavor = "multi_thread")]
async fn create_post_test() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join(std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"));
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("posts_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (_bobbo,)) = apps.into_tuples();
    
    let alice_zome = alice.zome("posts");
    
    let sample = sample_post_1(&conductors[0], &alice_zome).await;
    
    // Alice creates a Post
    let record: Record = create_post(&conductors[0], &alice_zome, sample.clone()).await;
    let entry: Post = record.entry().to_app_option().unwrap().unwrap();
    assert!(entry.eq(&sample));
}


#[tokio::test(flavor = "multi_thread")]
async fn create_and_read_post() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join(std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"));
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("posts_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("posts");
    let bob_zome = bobbo.zome("posts");

    let sample = sample_post_1(&conductors[0], &alice_zome).await;

    // Alice creates a Post
    let record: Record = create_post(&conductors[0], &alice_zome, sample.clone()).await;

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");
    
    let get_record: Option<Record> = conductors[1]
        .call(&bob_zome, "get_original_post", record.signed_action.action_address().clone())
        .await;

    assert_eq!(record, get_record.unwrap());    
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_update_post() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join(std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"));
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("posts_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("posts");
    let bob_zome = bobbo.zome("posts");

    let sample_1 = sample_post_1(&conductors[0], &alice_zome).await;

    // Alice creates a Post
    let record: Record = create_post(&conductors[0], &alice_zome, sample_1.clone()).await;
    let original_action_hash = record.signed_action.hashed.hash.clone();

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");
    
    let sample_2 = sample_post_2(&conductors[0], &alice_zome).await;
    let input = UpdatePostInput {
      original_post_hash: original_action_hash.clone(),
      previous_post_hash: original_action_hash.clone(),
      updated_post: sample_2.clone(),
    };
    
    // Alice updates the Post
    let update_record: Record = conductors[0]
        .call(&alice_zome, "update_post", input)
        .await;
        
    let entry: Post = update_record.entry().to_app_option().unwrap().unwrap();
    assert_eq!(sample_2, entry);
    
    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");
    
    let get_record: Option<Record> = conductors[1]
        .call(&bob_zome, "get_latest_post", original_action_hash.clone())
        .await;
  
    assert_eq!(update_record, get_record.unwrap());
    
    let input = UpdatePostInput {
      original_post_hash: original_action_hash.clone(),
      previous_post_hash: update_record.signed_action.hashed.hash.clone(),
      updated_post: sample_1.clone(),
    };
    
    // Alice updates the Post again
    let update_record: Record = conductors[0]
        .call(&alice_zome, "update_post", input)
        .await;
        
    let entry: Post = update_record.entry().to_app_option().unwrap().unwrap();
    assert_eq!(sample_1, entry);
    
    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");
    
    let get_record: Option<Record> = conductors[1]
        .call(&bob_zome, "get_latest_post", original_action_hash.clone())
        .await;
  
    assert_eq!(update_record, get_record.unwrap());

    let all_revisions: Vec<Record> = conductors[1]
        .call(&bob_zome, "get_all_revisions_for_post", original_action_hash.clone())
        .await;
    assert_eq!(all_revisions.len(), 3);
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_delete_post() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir()
        .unwrap()
        .join(std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"));
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("posts_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();
    
    let alice_zome = alice.zome("posts");
    let bob_zome = bobbo.zome("posts");
    
    let sample_1 = sample_post_1(&conductors[0], &alice_zome).await;
    
    // Alice creates a Post
    let record: Record = create_post(&conductors[0], &alice_zome, sample_1.clone()).await;
    let original_action_hash = record.signed_action.hashed.hash;
    
    // Alice deletes the Post
    let delete_action_hash: ActionHash = conductors[0]
        .call(&alice_zome, "delete_post", original_action_hash.clone())
        .await;

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");

    let deletes: Vec<SignedActionHashed> = conductors[1]
        .call(&bob_zome, "get_all_deletes_for_post", original_action_hash.clone())
        .await;
        
    assert_eq!(deletes.len(), 1);
    assert_eq!(deletes[0].hashed.hash, delete_action_hash);
}
