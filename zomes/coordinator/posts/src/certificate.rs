use hdk::prelude::*;
use posts_integrity::*;
#[hdk_extern]
pub fn create_certificate(certificate: Certificate) -> ExternResult<Record> {
    let certificate_hash = create_entry(&EntryTypes::Certificate(certificate.clone()))?;
    create_link(
        certificate.post_hash.clone(),
        certificate_hash.clone(),
        LinkTypes::PostToCertificates,
        (),
    )?;
    create_link(
        certificate.agent.clone(),
        certificate_hash.clone(),
        LinkTypes::CertifiedToCertificates,
        (),
    )?;
    for base in certificate.certifications_hashes.clone() {
        create_link(
            base,
            certificate_hash.clone(),
            LinkTypes::CertificateToCertificates,
            (),
        )?;
    }
    let record = get(certificate_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest("Could not find the newly created Certificate"
                .to_string())
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn get_certificate(certificate_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(certificate_hash, GetOptions::default())? else {
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
pub fn get_certificates_for_post(post_hash: ActionHash) -> ExternResult<Vec<Link>> {
    get_links(
        GetLinksInputBuilder::try_new(post_hash, LinkTypes::PostToCertificates)?.build(),
    )
}
#[hdk_extern]
pub fn get_certificates_for_certified(
    certified: AgentPubKey,
) -> ExternResult<Vec<Link>> {
    get_links(
        GetLinksInputBuilder::try_new(certified, LinkTypes::CertifiedToCertificates)?
            .build(),
    )
}
#[hdk_extern]
pub fn get_certificates_for_certificate(
    certificate_hash: EntryHash,
) -> ExternResult<Vec<Link>> {
    get_links(
        GetLinksInputBuilder::try_new(
                certificate_hash,
                LinkTypes::CertificateToCertificates,
            )?
            .build(),
    )
}
