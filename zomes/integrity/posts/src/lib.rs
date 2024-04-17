pub mod certificate;
pub use certificate::*;
pub mod like;
pub use like::*;
pub mod comment;
pub use comment::*;
pub mod post;
pub use post::*;
use hdi::prelude::*;
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Post(Post),
    Comment(Comment),
    Like(Like),
    Certificate(Certificate),
}
#[derive(Serialize, Deserialize)]
#[hdk_link_types]
pub enum LinkTypes {
    PostUpdates,
    PostToComments,
    LikeToLikes,
    PostToCertificates,
    CertifiedToCertificates,
    CertificateToCertificates,
    AllPosts,
    PostsByAuthor,
    AllPostsEntryHash,
    PostsByAuthorEntryHash,
}
#[hdk_extern]
pub fn genesis_self_check(
    _data: GenesisSelfCheckData,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_agent_joining(
    _agent_pub_key: AgentPubKey,
    _membrane_proof: &Option<MembraneProof>,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, LinkTypes>()? {
        FlatOp::StoreEntry(store_entry) => {
            match store_entry {
                OpEntry::CreateEntry { app_entry, action } => {
                    match app_entry {
                        EntryTypes::Post(post) => {
                            validate_create_post(
                                EntryCreationAction::Create(action),
                                post,
                            )
                        }
                        EntryTypes::Comment(comment) => {
                            validate_create_comment(
                                EntryCreationAction::Create(action),
                                comment,
                            )
                        }
                        EntryTypes::Like(like) => {
                            validate_create_like(
                                EntryCreationAction::Create(action),
                                like,
                            )
                        }
                        EntryTypes::Certificate(certificate) => {
                            validate_create_certificate(
                                EntryCreationAction::Create(action),
                                certificate,
                            )
                        }
                    }
                }
                OpEntry::UpdateEntry { app_entry, action, .. } => {
                    match app_entry {
                        EntryTypes::Post(post) => {
                            validate_create_post(
                                EntryCreationAction::Update(action),
                                post,
                            )
                        }
                        EntryTypes::Comment(comment) => {
                            validate_create_comment(
                                EntryCreationAction::Update(action),
                                comment,
                            )
                        }
                        EntryTypes::Like(like) => {
                            validate_create_like(
                                EntryCreationAction::Update(action),
                                like,
                            )
                        }
                        EntryTypes::Certificate(certificate) => {
                            validate_create_certificate(
                                EntryCreationAction::Update(action),
                                certificate,
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        FlatOp::RegisterUpdate(update_entry) => {
            match update_entry {
                OpUpdate::Entry {
                    original_action,
                    original_app_entry,
                    app_entry,
                    action,
                } => {
                    match (app_entry, original_app_entry) {
                        (
                            EntryTypes::Certificate(certificate),
                            EntryTypes::Certificate(original_certificate),
                        ) => {
                            validate_update_certificate(
                                action,
                                certificate,
                                original_action,
                                original_certificate,
                            )
                        }
                        (EntryTypes::Like(like), EntryTypes::Like(original_like)) => {
                            validate_update_like(
                                action,
                                like,
                                original_action,
                                original_like,
                            )
                        }
                        (
                            EntryTypes::Comment(comment),
                            EntryTypes::Comment(original_comment),
                        ) => {
                            validate_update_comment(
                                action,
                                comment,
                                original_action,
                                original_comment,
                            )
                        }
                        (EntryTypes::Post(post), EntryTypes::Post(original_post)) => {
                            validate_update_post(
                                action,
                                post,
                                original_action,
                                original_post,
                            )
                        }
                        _ => {
                            Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original and updated entry types must be the same"
                                        .to_string(),
                                ),
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        FlatOp::RegisterDelete(delete_entry) => {
            match delete_entry {
                OpDelete::Entry { original_action, original_app_entry, action } => {
                    match original_app_entry {
                        EntryTypes::Post(post) => {
                            validate_delete_post(action, original_action, post)
                        }
                        EntryTypes::Comment(comment) => {
                            validate_delete_comment(action, original_action, comment)
                        }
                        EntryTypes::Like(like) => {
                            validate_delete_like(action, original_action, like)
                        }
                        EntryTypes::Certificate(certificate) => {
                            validate_delete_certificate(
                                action,
                                original_action,
                                certificate,
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        FlatOp::RegisterCreateLink {
            link_type,
            base_address,
            target_address,
            tag,
            action,
        } => {
            match link_type {
                LinkTypes::PostUpdates => {
                    validate_create_link_post_updates(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostToComments => {
                    validate_create_link_post_to_comments(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::LikeToLikes => {
                    validate_create_link_like_to_likes(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostToCertificates => {
                    validate_create_link_post_to_certificates(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::CertifiedToCertificates => {
                    validate_create_link_certified_to_certificates(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::CertificateToCertificates => {
                    validate_create_link_certificate_to_certificates(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::AllPosts => {
                    validate_create_link_all_posts(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostsByAuthor => {
                    validate_create_link_posts_by_author(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::AllPostsEntryHash => {
                    validate_create_link_all_posts_entry_hash(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostsByAuthorEntryHash => {
                    validate_create_link_posts_by_author_entry_hash(
                        action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
            }
        }
        FlatOp::RegisterDeleteLink {
            link_type,
            base_address,
            target_address,
            tag,
            original_action,
            action,
        } => {
            match link_type {
                LinkTypes::PostUpdates => {
                    validate_delete_link_post_updates(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostToComments => {
                    validate_delete_link_post_to_comments(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::LikeToLikes => {
                    validate_delete_link_like_to_likes(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostToCertificates => {
                    validate_delete_link_post_to_certificates(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::CertifiedToCertificates => {
                    validate_delete_link_certified_to_certificates(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::CertificateToCertificates => {
                    validate_delete_link_certificate_to_certificates(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::AllPosts => {
                    validate_delete_link_all_posts(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostsByAuthor => {
                    validate_delete_link_posts_by_author(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::AllPostsEntryHash => {
                    validate_delete_link_all_posts_entry_hash(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
                LinkTypes::PostsByAuthorEntryHash => {
                    validate_delete_link_posts_by_author_entry_hash(
                        action,
                        original_action,
                        base_address,
                        target_address,
                        tag,
                    )
                }
            }
        }
        FlatOp::StoreRecord(store_record) => {
            match store_record {
                OpRecord::CreateEntry { app_entry, action } => {
                    match app_entry {
                        EntryTypes::Post(post) => {
                            validate_create_post(
                                EntryCreationAction::Create(action),
                                post,
                            )
                        }
                        EntryTypes::Comment(comment) => {
                            validate_create_comment(
                                EntryCreationAction::Create(action),
                                comment,
                            )
                        }
                        EntryTypes::Like(like) => {
                            validate_create_like(
                                EntryCreationAction::Create(action),
                                like,
                            )
                        }
                        EntryTypes::Certificate(certificate) => {
                            validate_create_certificate(
                                EntryCreationAction::Create(action),
                                certificate,
                            )
                        }
                    }
                }
                OpRecord::UpdateEntry {
                    original_action_hash,
                    app_entry,
                    action,
                    ..
                } => {
                    let original_record = must_get_valid_record(original_action_hash)?;
                    let original_action = original_record.action().clone();
                    let original_action = match original_action {
                        Action::Create(create) => EntryCreationAction::Create(create),
                        Action::Update(update) => EntryCreationAction::Update(update),
                        _ => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original action for an update must be a Create or Update action"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    match app_entry {
                        EntryTypes::Post(post) => {
                            let result = validate_create_post(
                                EntryCreationAction::Update(action.clone()),
                                post.clone(),
                            )?;
                            if let ValidateCallbackResult::Valid = result {
                                let original_post: Option<Post> = original_record
                                    .entry()
                                    .to_app_option()
                                    .map_err(|e| wasm_error!(e))?;
                                let original_post = match original_post {
                                    Some(post) => post,
                                    None => {
                                        return Ok(
                                            ValidateCallbackResult::Invalid(
                                                "The updated entry type must be the same as the original entry type"
                                                    .to_string(),
                                            ),
                                        );
                                    }
                                };
                                validate_update_post(
                                    action,
                                    post,
                                    original_action,
                                    original_post,
                                )
                            } else {
                                Ok(result)
                            }
                        }
                        EntryTypes::Comment(comment) => {
                            let result = validate_create_comment(
                                EntryCreationAction::Update(action.clone()),
                                comment.clone(),
                            )?;
                            if let ValidateCallbackResult::Valid = result {
                                let original_comment: Option<Comment> = original_record
                                    .entry()
                                    .to_app_option()
                                    .map_err(|e| wasm_error!(e))?;
                                let original_comment = match original_comment {
                                    Some(comment) => comment,
                                    None => {
                                        return Ok(
                                            ValidateCallbackResult::Invalid(
                                                "The updated entry type must be the same as the original entry type"
                                                    .to_string(),
                                            ),
                                        );
                                    }
                                };
                                validate_update_comment(
                                    action,
                                    comment,
                                    original_action,
                                    original_comment,
                                )
                            } else {
                                Ok(result)
                            }
                        }
                        EntryTypes::Like(like) => {
                            let result = validate_create_like(
                                EntryCreationAction::Update(action.clone()),
                                like.clone(),
                            )?;
                            if let ValidateCallbackResult::Valid = result {
                                let original_like: Option<Like> = original_record
                                    .entry()
                                    .to_app_option()
                                    .map_err(|e| wasm_error!(e))?;
                                let original_like = match original_like {
                                    Some(like) => like,
                                    None => {
                                        return Ok(
                                            ValidateCallbackResult::Invalid(
                                                "The updated entry type must be the same as the original entry type"
                                                    .to_string(),
                                            ),
                                        );
                                    }
                                };
                                validate_update_like(
                                    action,
                                    like,
                                    original_action,
                                    original_like,
                                )
                            } else {
                                Ok(result)
                            }
                        }
                        EntryTypes::Certificate(certificate) => {
                            let result = validate_create_certificate(
                                EntryCreationAction::Update(action.clone()),
                                certificate.clone(),
                            )?;
                            if let ValidateCallbackResult::Valid = result {
                                let original_certificate: Option<Certificate> = original_record
                                    .entry()
                                    .to_app_option()
                                    .map_err(|e| wasm_error!(e))?;
                                let original_certificate = match original_certificate {
                                    Some(certificate) => certificate,
                                    None => {
                                        return Ok(
                                            ValidateCallbackResult::Invalid(
                                                "The updated entry type must be the same as the original entry type"
                                                    .to_string(),
                                            ),
                                        );
                                    }
                                };
                                validate_update_certificate(
                                    action,
                                    certificate,
                                    original_action,
                                    original_certificate,
                                )
                            } else {
                                Ok(result)
                            }
                        }
                    }
                }
                OpRecord::DeleteEntry { original_action_hash, action, .. } => {
                    let original_record = must_get_valid_record(original_action_hash)?;
                    let original_action = original_record.action().clone();
                    let original_action = match original_action {
                        Action::Create(create) => EntryCreationAction::Create(create),
                        Action::Update(update) => EntryCreationAction::Update(update),
                        _ => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original action for a delete must be a Create or Update action"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    let app_entry_type = match original_action.entry_type() {
                        EntryType::App(app_entry_type) => app_entry_type,
                        _ => {
                            return Ok(ValidateCallbackResult::Valid);
                        }
                    };
                    let entry = match original_record.entry().as_option() {
                        Some(entry) => entry,
                        None => {
                            if original_action.entry_type().visibility().is_public() {
                                return Ok(
                                    ValidateCallbackResult::Invalid(
                                        "Original record for a delete of a public entry must contain an entry"
                                            .to_string(),
                                    ),
                                );
                            } else {
                                return Ok(ValidateCallbackResult::Valid);
                            }
                        }
                    };
                    let original_app_entry = match EntryTypes::deserialize_from_type(
                        app_entry_type.zome_index,
                        app_entry_type.entry_index,
                        entry,
                    )? {
                        Some(app_entry) => app_entry,
                        None => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "Original app entry must be one of the defined entry types for this zome"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    match original_app_entry {
                        EntryTypes::Post(original_post) => {
                            validate_delete_post(action, original_action, original_post)
                        }
                        EntryTypes::Comment(original_comment) => {
                            validate_delete_comment(
                                action,
                                original_action,
                                original_comment,
                            )
                        }
                        EntryTypes::Like(original_like) => {
                            validate_delete_like(action, original_action, original_like)
                        }
                        EntryTypes::Certificate(original_certificate) => {
                            validate_delete_certificate(
                                action,
                                original_action,
                                original_certificate,
                            )
                        }
                    }
                }
                OpRecord::CreateLink {
                    base_address,
                    target_address,
                    tag,
                    link_type,
                    action,
                } => {
                    match link_type {
                        LinkTypes::PostUpdates => {
                            validate_create_link_post_updates(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::PostToComments => {
                            validate_create_link_post_to_comments(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::LikeToLikes => {
                            validate_create_link_like_to_likes(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::PostToCertificates => {
                            validate_create_link_post_to_certificates(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::CertifiedToCertificates => {
                            validate_create_link_certified_to_certificates(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::CertificateToCertificates => {
                            validate_create_link_certificate_to_certificates(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::AllPosts => {
                            validate_create_link_all_posts(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::PostsByAuthor => {
                            validate_create_link_posts_by_author(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::AllPostsEntryHash => {
                            validate_create_link_all_posts_entry_hash(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                        LinkTypes::PostsByAuthorEntryHash => {
                            validate_create_link_posts_by_author_entry_hash(
                                action,
                                base_address,
                                target_address,
                                tag,
                            )
                        }
                    }
                }
                OpRecord::DeleteLink { original_action_hash, base_address, action } => {
                    let record = must_get_valid_record(original_action_hash)?;
                    let create_link = match record.action() {
                        Action::CreateLink(create_link) => create_link.clone(),
                        _ => {
                            return Ok(
                                ValidateCallbackResult::Invalid(
                                    "The action that a DeleteLink deletes must be a CreateLink"
                                        .to_string(),
                                ),
                            );
                        }
                    };
                    let link_type = match LinkTypes::from_type(
                        create_link.zome_index,
                        create_link.link_type,
                    )? {
                        Some(lt) => lt,
                        None => {
                            return Ok(ValidateCallbackResult::Valid);
                        }
                    };
                    match link_type {
                        LinkTypes::PostUpdates => {
                            validate_delete_link_post_updates(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::PostToComments => {
                            validate_delete_link_post_to_comments(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::LikeToLikes => {
                            validate_delete_link_like_to_likes(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::PostToCertificates => {
                            validate_delete_link_post_to_certificates(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::CertifiedToCertificates => {
                            validate_delete_link_certified_to_certificates(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::CertificateToCertificates => {
                            validate_delete_link_certificate_to_certificates(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::AllPosts => {
                            validate_delete_link_all_posts(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::PostsByAuthor => {
                            validate_delete_link_posts_by_author(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::AllPostsEntryHash => {
                            validate_delete_link_all_posts_entry_hash(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                        LinkTypes::PostsByAuthorEntryHash => {
                            validate_delete_link_posts_by_author_entry_hash(
                                action,
                                create_link.clone(),
                                base_address,
                                create_link.target_address,
                                create_link.tag,
                            )
                        }
                    }
                }
                OpRecord::CreatePrivateEntry { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdatePrivateEntry { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CreateCapClaim { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CreateCapGrant { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdateCapClaim { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdateCapGrant { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::Dna { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::OpenChain { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CloseChain { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::InitZomesComplete { .. } => Ok(ValidateCallbackResult::Valid),
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        FlatOp::RegisterAgentActivity(agent_activity) => {
            match agent_activity {
                OpActivity::CreateAgent { agent, action } => {
                    let previous_action = must_get_action(action.prev_action)?;
                    match previous_action.action() {
                        Action::AgentValidationPkg(
                            AgentValidationPkg { membrane_proof, .. },
                        ) => validate_agent_joining(agent, membrane_proof),
                        _ => {
                            Ok(
                                ValidateCallbackResult::Invalid(
                                    "The previous action for a `CreateAgent` action must be an `AgentValidationPkg`"
                                        .to_string(),
                                ),
                            )
                        }
                    }
                }
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
    }
}
