{ inputs, rootPath, ... }:

{
  perSystem =
    { inputs'
    , ...
    }: {
      packages.posts_integrity = inputs.hc-infra.outputs.lib.rustZome {
        workspacePath = rootPath;
        holochain = inputs'.holochain;
        crateCargoToml = ./Cargo.toml;
      };
    };
}

