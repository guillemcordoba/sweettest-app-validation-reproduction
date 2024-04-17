use hdi::prelude::*;
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Like {
    pub like_hash: Option<ActionHash>,
    pub agent: AgentPubKey,
}
pub fn validate_create_like(
    _action: EntryCreationAction,
    like: Like,
) -> ExternResult<ValidateCallbackResult> {
    if let Some(action_hash) = like.like_hash.clone() {
        let record = must_get_valid_record(action_hash)?;
        let _like: crate::Like = record
            .entry()
            .to_app_option()
            .map_err(|e| wasm_error!(e))?
            .ok_or(
                wasm_error!(
                    WasmErrorInner::Guest(String::from("Dependant action must be accompanied by an entry"))
                ),
            )?;
    }
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_like(
    _action: Update,
    _like: Like,
    _original_action: EntryCreationAction,
    _original_like: Like,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("Likes cannot be updated")))
}
pub fn validate_delete_like(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_like: Like,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_create_link_like_to_likes(
    _action: CreateLink,
    base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    let action_hash = base_address
        .into_action_hash()
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("No action hash associated with link".to_string())
            ),
        )?;
    let record = must_get_valid_record(action_hash)?;
    let _like: crate::Like = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("Linked action must reference an entry"
                .to_string())
            ),
        )?;
    let action_hash = target_address
        .into_action_hash()
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("No action hash associated with link".to_string())
            ),
        )?;
    let record = must_get_valid_record(action_hash)?;
    let _like: crate::Like = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("Linked action must reference an entry"
                .to_string())
            ),
        )?;
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_link_like_to_likes(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
