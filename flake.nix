nix
{
  description = "A basic flake for a project using dev.nix";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      pkgs = nixpkgs.legacyPackages.x86_64-linux; # Adjust system if needed
      devShellConfig = import ./.idx/dev.nix { inherit pkgs; };
    in
    {
      devShells.x86_64-linux.default = pkgs.mkShell { # Adjust system if needed
        buildInputs = devShellConfig.packages;
        shellHook = builtins.concatStringsSep "\n" [
          "echo \"Welcome to the development shell!\""
          (builtins.concatStringsSep "\n" (builtins.mapAttrsToList (name: value: "export ${name}=${value}") devShellConfig.env))
        ];
      };
    };
}