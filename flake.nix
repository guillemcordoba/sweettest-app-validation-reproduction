{
  description = "Template for Holochain app development";

  inputs = {
    versions.url  = "github:holochain/holochain?dir=versions/weekly";

    holochain.url = "github:holochain/holochain";
    holochain.inputs.versions.follows = "versions";

    nixpkgs.follows = "holochain/nixpkgs";
    flake-parts.follows = "holochain/flake-parts";

    hc-infra = {
      url = "github:holochain-open-dev/infrastructure";
    };
    scaffolding = {
      url = "github:holochain-open-dev/templates";
    };

    profiles.url = "github:holochain-open-dev/profiles/nixify";
  };
  
  nixConfig = {
    extra-substituters = [
      "https://holochain-open-dev.cachix.org"
    ];	
  	extra-trusted-public-keys = [
  	  "holochain-open-dev.cachix.org-1:3Tr+9in6uo44Ga7qiuRIfOTFXog+2+YbyhwI/Z6Cp4U="
    ];
  };


  outputs = inputs:
    inputs.flake-parts.lib.mkFlake
      {
        inherit inputs;
        specialArgs = {
          # Special arguments for the flake parts of this repository
          
          rootPath = ./.;
        };
      }
      {
        imports = [
          ./zomes/integrity/posts/zome.nix
          ./zomes/coordinator/posts/zome.nix
          # Just for testing purposes
          ./workdir/dna.nix
          ./workdir/happ.nix
        ];
      
        systems = builtins.attrNames inputs.holochain.devShells;
        perSystem =
          { inputs'
          , config
          , pkgs
          , system
          , ...
          }: {
            devShells.default = pkgs.mkShell {
              inputsFrom = [ 
                inputs'.hc-infra.devShells.synchronized-pnpm
                inputs'.holochain.devShells.holonix 
              ];

              packages = [
                inputs'.scaffolding.packages.hc-scaffold-module-template
              ];
            };

            packages.scaffold = pkgs.symlinkJoin {
              name = "scaffold-remote-zome";
              paths = [ inputs'.hc-infra.packages.scaffold-remote-zome ];
              buildInputs = [ pkgs.makeWrapper ];
              postBuild = ''
                wrapProgram $out/bin/scaffold-remote-zome \
                  --add-flags "posts \
                    --integrity-zome-name posts_integrity \
                    --coordinator-zome-name posts \
                    --remote-zome-git-url github:holochain-open-dev/posts \
                    --remote-npm-package-name posts \
                    --remote-npm-package-path ui" \
                    # --remote-zome-git-branch main 
              '';
            };
          };
      };
}