{ pkgs }:

let
  pythonVersion = "3.12"; # Updated to a more recent stable version if available in Nixpkgs
  python = pkgs.python311.withPackages (p: [ # Using 3.11 as specified in previous prompts, adjust if needed
    p.pip
    p.yfinance
    p.pandas
    p.numpy
    p.scikit-learn
    p.tensorflow # Consider CPU/GPU version if needed
    p.pytorch    # Consider CPU/GPU version if needed
    p.requests
    p.firebase-admin
    p.plotly
    p.statsmodels
    p.beautifulsoup4
    p.selenium
    p.jupyterlab
  ]);

  nodeVersion = "20";
  nodePackages = pkgs.nodejs_20; # Using nodejs_20 directly for package attributes

in {
  # Using stable channel as generally recommended, but unstable can be used for bleeding edge
  channel = "stable";

  packages = [
    python
    pkgs.nodejs_20 # Node.js environment
    nodePackages.pkgs.npm # npm from the nodejs_20 set
    nodePackages.pkgs.yarn # yarn from the nodejs_20 set
    # nodePackages.pkgs.pnpm # pnpm from the nodejs_20 set - Uncomment if needed
    pkgs.git
    pkgs.curl
    pkgs.wget
    pkgs.jq
    pkgs.tmux
    pkgs.vim
    pkgs.htop # Advanced process monitor
    pkgs.zsh  # Advanced shell
    pkgs.fzf  # Command-line fuzzy finder
    pkgs.nix-direnv # Nix integration with direnv
    pkgs.google-cloud-sdk # For Firebase/GCP interactions
    pkgs.nodePackages.firebase-tools # Firebase CLI
  ];

  env = {
    FIREBASE_PROJECT_ID = "hibllx-govai"; # Replace with your actual Firebase project ID
    PYTHONPATH = "${python}/lib/python${pkgs.lib.versions.majorMinor python.version}/site-packages"; # Dynamic Python version
    NODE_PATH = "${nodePackages}/lib/node_modules"; # Path for global Node modules if needed

    # Construct a robust PATH including essential Nix utilities and installed packages
    PATH = pkgs.lib.makeBinPath [
      pkgs.coreutils
      pkgs.findutils
      pkgs.gnugrep
      pkgs.gnused
      pkgs.gawk
      pkgs.zsh
      python
      nodePackages
      pkgs.git
      pkgs.curl
      pkgs.jq
      pkgs.tmux
      pkgs.vim
      pkgs.fzf
      pkgs.htop
      pkgs.google-cloud-sdk
      pkgs.nodePackages.firebase-tools
    ] + ":$PATH"; # Append existing PATH

    SHELL = "${pkgs.zsh}/bin/zsh";
    EDITOR = "vim";
    # Add other necessary environment variables like API keys (use secrets management for production)
    # Example: MY_API_KEY = "your_api_key_here"; # NOT RECOMMENDED FOR SENSITIVE KEYS
  };

  idx = {
    extensions = [
      "esbenp.prettier-vscode"       # Code formatter
      "dbaeumer.vscode-eslint"        # Linter for JS/TS
      "ms-python.python"              # Python support
      "ms-azuretools.vscode-docker"   # Docker support if needed
      "redhat.vscode-yaml"            # YAML support
      "ms-vscode.makefile-tools"      # Makefile support
      "oderwat.indent-rainbow"        # Indentation highlighting
      "eamodio.gitlens"               # Enhanced Git integration
      "GitHub.copilot"                # AI code assistant (optional)
      "VisualStudioExptTeam.vscodeintellicode" # AI-assisted IntelliSense
      "googlecloudtools.cloudcode"    # Google Cloud integration
      "bradlc.vscode-tailwindcss"     # Tailwind CSS IntelliSense
    ];
    workspace = {
      # Pre-initialize the workspace by cloning a repository, installing dependencies, and running commands
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx",
          "src/functions/main.py", # Corrected path based on structure
          "README.md",
          "src/functions/requirements.txt", # Corrected path
          "package.json",
          "dev.nix", # Open the Nix config itself
        ];
        # Commands to run when the workspace is created
        default.commands = [
          "echo 'Installing Node.js dependencies...'",
          "npm install || yarn install || pnpm install", # Try common install commands
          "echo 'Installing Python dependencies...'",
          "pip install -r src/functions/requirements.txt", # Use correct path
          "echo 'Setting up Firebase... (Ensure firebase login if needed)'",
          # "firebase login", # Uncomment if interactive login is needed initially
          "firebase use ${env.FIREBASE_PROJECT_ID}", # Set active project
          "echo 'Advanced development environment ready!'"
        ];
      };
      # Runs commands every time the workspace starts
      onStart = {
         # Example: Automatically start the frontend dev server
         # web-dev-server = "npm run dev";
      };
    };
    previews = {
      enable = true;
      previews = {
        # Preview for the Next.js frontend application
        web = {
          command = ["npm", "run", "dev", "--", "--port", "$PORT", "--hostname", "0.0.0.0"];
          manager = "web";
          # Use Nginx as a reverse proxy for the web preview (optional)
          # proxy = {
          #   nginx.conf = ''
          #     server {
          #       listen 8080;
          #       location / {
          #         proxy_pass http://localhost:$PORT;
          #         proxy_http_version 1.1;
          #         proxy_set_header Upgrade $http_upgrade;
          #         proxy_set_header Connection 'upgrade';
          #         proxy_set_header Host $host;
          #         proxy_cache_bypass $http_upgrade;
          #       }
          #     }
          #   '';
          #   port = 8080;
          # };
        };
        # Preview for the Python backend (Firebase Function emulator or custom server)
        python_backend = {
          # Command to run Flask locally for testing the function logic
          # Ensure your main.py can be run this way or adjust the command
          # You might need a wrapper script or use `functions-framework` directly
          command = ["functions-framework", "--target", "obtener_y_guardar_datos", "--port", "$PORT", "--host", "0.0.0.0"];
          # command = ["python", "-u", "src/functions/main.py", "$PORT", "0.0.0.0"]; # Alternative if main.py runs a server
          manager = "web";
          port = 8001; # Use a different port than the function's default if needed
        };
        # Preview for JupyterLab
        jupyter = {
          command = ["jupyter", "lab", "--port", "$PORT", "--ip", "0.0.0.0", "--no-browser", "--notebook-dir=./notebooks"]; # Specify notebook dir
          manager = "web";
          port = 8888;
          waitForPort = true; # Wait for Jupyter to be ready
        };
         # Preview for Firebase Emulators (optional)
         firebase_emulators = {
           command = ["firebase", "emulators:start", "--only", "functions,firestore,auth", "--import=./firebase-emulator-data", "--export-on-exit"];
           manager = "process"; # Run as a background process
           # Define ports if needed, though defaults usually work
         };
      };
    };
    # Advanced settings like custom container image, resource allocation etc. can go here
    # resources = {
    #   cpu = 4;
    #   memory = "8Gi";
    #   storage = "32Gi";
    # };
  };
}
