
# test_dev.nix
let
  config = import ./dev.nix { pkgs = import <nixpkgs> {}; };
in
{
  # Assert that the channel is "stable-24.11"
  assert config.channel == "stable-24.11";

  # Assert that nodejs_20 is in the packages
  assert builtins.elem pkgs.nodejs_20 config.packages;

  # Assert that zulu is in the packages
  assert builtins.elem pkgs.zulu config.packages;

  # Assert that firebase emulators are disabled
  assert config.services.firebase.emulators.detect == false;

  # Assert that the web preview command is correct
  assert config.idx.previews.previews.web.command == ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];

  # Assert that the correct file is opened on workspace creation
  assert config.idx.workspace.onCreate.default.openFiles == ["src/app/page.tsx"];
}
