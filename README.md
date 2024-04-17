# Reproducing the bug

```bash
nix build .#posts_test_dna -o workdir/posts_test.dna
RUST_LOG=holochain::core::workflow=info DNA_PATH=../../../workdir/posts_test.dna cargo test --profile release
```
