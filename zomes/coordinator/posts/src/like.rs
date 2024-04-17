use hdk::prelude::*;
use posts_integrity::*;
#[hdk_extern]
pub fn create_like(like: Like) -> ExternResult<Record> {
    let like_hash = create_entry(&EntryTypes::Like(like.clone()))?;
    if let Some(base) = like.like_hash.clone() {
        create_link(base, like_hash.clone(), LinkTypes::LikeToLikes, ())?;
    }
    let record = get(like_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("Could not find the newly created Like"
                .to_string())
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn get_like(like_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(like_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => {
            Err(
                wasm_error!(
                    WasmErrorInner::Guest("Malformed get details response".to_string())
                ),
            )
        }
    }
}
#[hdk_extern]
pub fn delete_like(original_like_hash: ActionHash) -> ExternResult<ActionHash> {
    let details = get_details(original_like_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("{pascal_entry_def_name} not found"))
            ),
        )?;
    let record = match details {
        Details::Record(details) => Ok(details.record),
        _ => {
            Err(
                wasm_error!(
                    WasmErrorInner::Guest(String::from("Malformed get details response"))
                ),
            )
        }
    }?;
    let entry = record
        .entry()
        .as_option()
        .ok_or(
            wasm_error!(WasmErrorInner::Guest("Like record has no entry".to_string())),
        )?;
    let like = Like::try_from(entry)?;
    if let Some(base_address) = like.like_hash.clone() {
        let links = get_links(
            GetLinksInputBuilder::try_new(base_address, LinkTypes::LikeToLikes)?.build(),
        )?;
        for link in links {
            if let Some(action_hash) = link.target.into_action_hash() {
                if action_hash.eq(&original_like_hash) {
                    delete_link(link.create_link_hash)?;
                }
            }
        }
    }
    delete_entry(original_like_hash)
}
#[hdk_extern]
pub fn get_all_deletes_for_like(
    original_like_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_like_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => {
            Err(wasm_error!(WasmErrorInner::Guest("Malformed details".into())))
        }
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}
#[hdk_extern]
pub fn get_oldest_delete_for_like(
    original_like_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) = get_all_deletes_for_like(original_like_hash)? else {
        return Ok(None);
    };
    deletes
        .sort_by(|delete_a, delete_b| {
            delete_a.action().timestamp().cmp(&delete_b.action().timestamp())
        });
    Ok(deletes.first().cloned())
}
#[hdk_extern]
pub fn get_likes_for_like(like_hash: ActionHash) -> ExternResult<Vec<Link>> {
    get_links(GetLinksInputBuilder::try_new(like_hash, LinkTypes::LikeToLikes)?.build())
}
#[hdk_extern]
pub fn get_deleted_likes_for_like(
    like_hash: ActionHash,
) -> ExternResult<Vec<(SignedActionHashed, Vec<SignedActionHashed>)>> {
    let details = get_link_details(
        like_hash,
        LinkTypes::LikeToLikes,
        None,
        GetOptions::default(),
    )?;
    Ok(
        details
            .into_inner()
            .into_iter()
            .filter(|(_link, deletes)| !deletes.is_empty())
            .collect(),
    )
}
