use hdi::prelude::*;
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(tag = "type")]
pub enum CertificateType {
    TypeOne,
    TypeTwo,
}
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Certificate {
    pub post_hash: ActionHash,
    pub agent: AgentPubKey,
    pub certifications_hashes: Vec<EntryHash>,
    pub certificate_type: CertificateType,
    pub dna_hash: DnaHash,
}
pub fn validate_create_certificate(
    _action: EntryCreationAction,
    certificate: Certificate,
) -> ExternResult<ValidateCallbackResult> {
    let record = must_get_valid_record(certificate.post_hash.clone())?;
    let _post: crate::Post = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Dependant action must be accompanied by an entry"))
            ),
        )?;
    for entry_hash in certificate.certifications_hashes.clone() {
        let entry = must_get_entry(entry_hash)?;
        let _certificate = crate::Certificate::try_from(entry)?;
    }
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_certificate(
    _action: Update,
    _certificate: Certificate,
    _original_action: EntryCreationAction,
    _original_certificate: Certificate,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("Certificates cannot be updated")))
}
pub fn validate_delete_certificate(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_certificate: Certificate,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from("Certificates cannot be deleted")))
}
pub fn validate_create_link_post_to_certificates(
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
    let _post: crate::Post = record
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
    let _certificate: crate::Certificate = record
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
pub fn validate_delete_link_post_to_certificates(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        ValidateCallbackResult::Invalid(
            String::from("PostToCertificates links cannot be deleted"),
        ),
    )
}
pub fn validate_create_link_certified_to_certificates(
    _action: CreateLink,
    _base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    let action_hash = target_address
        .into_action_hash()
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("No action hash associated with link".to_string())
            ),
        )?;
    let record = must_get_valid_record(action_hash)?;
    let _certificate: crate::Certificate = record
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
pub fn validate_delete_link_certified_to_certificates(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        ValidateCallbackResult::Invalid(
            String::from("CertifiedToCertificates links cannot be deleted"),
        ),
    )
}
pub fn validate_create_link_certificate_to_certificates(
    _action: CreateLink,
    base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    let entry_hash = base_address
        .into_entry_hash()
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("No entry hash associated with link".to_string())
            ),
        )?;
    let entry = must_get_entry(entry_hash)?.content;
    let _certificate = crate::Certificate::try_from(entry)?;
    let action_hash = target_address
        .into_action_hash()
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("No action hash associated with link".to_string())
            ),
        )?;
    let record = must_get_valid_record(action_hash)?;
    let _certificate: crate::Certificate = record
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
pub fn validate_delete_link_certificate_to_certificates(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(
        ValidateCallbackResult::Invalid(
            String::from("CertificateToCertificates links cannot be deleted"),
        ),
    )
}
