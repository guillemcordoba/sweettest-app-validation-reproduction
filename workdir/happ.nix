{ inputs, ... }:

{
  perSystem =
    { inputs'
    , lib
    , self'
    , ...
    }: {
  	  packages.posts_test_app = inputs.hc-infra.outputs.lib.happ {
        holochain = inputs'.holochain;
        happManifest = ./happ.yaml;

        dnas = {
          # Include here the DNA packages for this hApp, e.g.:
          # my_dna = inputs'.some_input.packages.my_dna;
          # This overrides all the "bundled" properties for the hApp manifest 
          posts_test = self'.packages.posts_test_dna;
        };
      };
  	};
}
