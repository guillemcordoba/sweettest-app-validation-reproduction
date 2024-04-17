use hdk::prelude::*;
use posts_integrity::*;
#[hdk_extern]
pub fn get_all_posts_entry_hash() -> ExternResult<Vec<Link>> {
    let path = Path::from("all_posts_entry_hash");
    get_links(
        GetLinksInputBuilder::try_new(
                path.path_entry_hash()?,
                LinkTypes::AllPostsEntryHash,
            )?
            .build(),
    )
}
