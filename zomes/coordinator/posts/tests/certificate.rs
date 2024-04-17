#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use std::time::Duration;
use hdk::prelude::*;
use holochain::{conductor::config::ConductorConfig, sweettest::*};

use posts_integrity::*;


mod common;
use common::{create_certificate, sample_certificate_1, sample_certificate_2};

use common::{create_post, sample_post_1, sample_post_2};

#[tokio::test(flavor = "multi_thread")]
async fn create_certificate_test() {
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
    
    let sample = sample_certificate_1(&conductors[0], &alice_zome).await;
    
    // Alice creates a Certificate
    let record: Record = create_certificate(&conductors[0], &alice_zome, sample.clone()).await;
    let entry: Certificate = record.entry().to_app_option().unwrap().unwrap();
    assert!(entry.eq(&sample));
}


#[tokio::test(flavor = "multi_thread")]
async fn create_and_read_certificate() {
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

    let sample = sample_certificate_1(&conductors[0], &alice_zome).await;

    // Alice creates a Certificate
    let record: Record = create_certificate(&conductors[0], &alice_zome, sample.clone()).await;

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");
    
    let get_record: Option<Record> = conductors[1]
        .call(&bob_zome, "get_certificate", record.signed_action.action_address().clone())
        .await;

    assert_eq!(record, get_record.unwrap());    
}


