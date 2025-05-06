{pkgs}: {
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_20
    pkgs.python311Full
    pkgs.python311Packages.pip
    pkgs.python311Packages.yfinance
    pkgs.python311Packages.pandas
    pkgs.python311Packages.numpy
    pkgs.python311Packages.scikit-learn
    # pkgs.python311Packages.tensorflow # Uncomment if needed
    # pkgs.python311Packages.pytorch    # Uncomment if needed
    pkgs.python311Packages.requests
    pkgs.python311Packages.firebase-admin
    pkgs.nodePackages.npm
    # pkgs.yarn # Uncomment if needed
    # pkgs.pnpm # Uncomment if needed
    pkgs.git
    pkgs.curl
    pkgs.wget
    pkgs.jq
    pkgs.tmux
    pkgs.vim
  ];
  env = {
    FIREBASE_PROJECT_ID = "tu-proyecto-firebase-id"; # Replace with your actual project ID or use secrets
    # Note: Setting PYTHONPATH might not be the best practice with Nix shells.
    # Consider using python.withPackages for managing Python dependencies instead.
    # PYTHONPATH = "${pkgs.python311Packages.yfinance}/lib/python3.11/site-packages:${pkgs.python311Packages.pandas}/lib/python3.11/site-packages";
  };
  idx = {
    extensions = [
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
      "ms-python.python"
      "ms-azuretools.vscode-docker" # Example: Added Docker extension
      # Add Firebase extension if available on open-vsx or configure manually
      # "ms-azuretools.firebase" # This might not be directly available on Open VSX, check publisher/ID
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
          "src/functions/main.py" # Corrected path based on project structure
          "README.md"
          "default.nix" # Open the Nix file itself
        ];
        # Commands to run when the workspace is created or resumed
        default.commands = [
           # Use postCreateCommand in devcontainer.json or similar for reliable dependency installation
           # "npm install",
           # "pip install -r src/functions/requirements.txt" # Corrected path
        ];
      };
      # Commands to run when the IDE is ready
      onLoad = {
        # Example: ensure pip requirements are installed if needed
        # default.commands = [
        #   "pip install -r src/functions/requirements.txt"
        # ];
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          # Ensure this matches your package.json dev script
          command = ["npm" "run" "dev"]; # Simplified, assumes default port/host handling by Next.js
          manager = "web";
          # port = 9002; # Let Next.js handle the port defined in package.json script
        };
        # Preview for the Python Cloud Function (if run locally using functions-framework)
        python_function = {
          # Example command to run the function locally (adjust as needed)
          # You might need to install functions-framework globally or manage it differently
          command = [
             "functions-framework"
             "--target" "obtener_y_guardar_datos" # Name of the function in main.py
             "--source" "src/functions/main.py"  # Path to the file
             "--port" "$PORT"
          ];
          manager = "web";
          # port = 8081; # Default for functions-framework often 8080, specify if needed
        };
      };
    };
    # Configure format on save
    workspace.editor = {
      formatOnSave = true;
      defaultFormatter = {
        javascript = "esbenp.prettier-vscode";
        typescript = "esbenp.prettier-vscode";
        typescriptreact = "esbenp.prettier-vscode";
        json = "esbenp.prettier-vscode";
        python = "ms-python.python"; # Use the Python extension's formatter
      };
    };
     # Add settings for linters if desired
     workspace.lint = {
       enable = true;
       # Example ESLint configuration
       # eslint = {
       #   command = "eslint";
       #   args = ["--fix", "."];
       # };
       # Example Python linter (e.g., flake8, requires adding flake8 to packages)
       # python = {
       #   command = "flake8";
       #   args = ["."];
       # };
     };
  };
}
