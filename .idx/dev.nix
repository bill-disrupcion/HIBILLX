{ pkgs }:

let
  pythonVersion = "3.12";
  python = pkgs.python3.withPackages (p: [
    p.pip
    p.yfinance
    p.pandas
    p.numpy
    p.scipy # For advanced statistical analysis
    p.scikit-learn
    p.tensorflow # Consider GPU version if available and needed
    p.pytorch    # Consider GPU version if available and needed
    p.requests
    p.firebase-admin
    p.plotly
    p.dash # For interactive financial dashboards
    p.statsmodels
    p.beautifulsoup4
    p.selenium
    p.jupyterlab
    p.ta-lib # For technical analysis
    p.finplot # For financial plotting
    p.alphalens # For evaluating trading strategies
    p.backtrader # For backtesting trading strategies
    p.riskfolio-lib # For portfolio optimization and risk management
    p.pyfolio # For performance and risk analysis of financial portfolios
    p.numba # For optimizing numerical computations
    p.networkx # For network analysis (e.g., market correlations)
    p.sqlalchemy # For database interactions if needed
  ]);

  nodeVersion = "20";
  nodePackages = pkgs.nodejs_20.pkgs; # Corrected to pkgs.nodejs_20.pkgs

in {
  channel = "stable";

  packages = [
    python
    pkgs.nodejs_20
    nodePackages.npm
    nodePackages.yarn
    pkgs.git
    pkgs.curl
    pkgs.wget
    pkgs.jq
    pkgs.tmux
    pkgs.vim
    pkgs.htop
    pkgs.zsh
    pkgs.fzf
    pkgs.nix-direnv
    pkgs.google-cloud-sdk
    nodePackages.firebase-tools
    pkgs.postgresql # For local relational database if needed
    pkgs.redis # For local in-memory data store/cache
    pkgs.wireshark-cli # For network traffic analysis if debugging APIs
    pkgs.diffstat # For better diff output
    pkgs.tree # For displaying directory structures
  ];

  env = {
    FIREBASE_PROJECT_ID = "hibllx-govai"; # Replace with your actual Firebase project ID
    PYTHONPATH = "${python}/lib/python${pkgs.lib.versions.majorMinor python.version}/site-packages";
    NODE_PATH = "${nodePackages.npm}/lib/node_modules"; # Corrected to use nodePackages.npm
    PATH = pkgs.lib.makeBinPath [
      pkgs.coreutils
      pkgs.findutils
      pkgs.gnugrep
      pkgs.gnused
      pkgs.gawk
      pkgs.zsh
      python
      pkgs.nodejs_20 # Add nodejs_20 to makeBinPath for node, npm, yarn etc.
      # nodePackages.npm # npm, yarn etc. are usually in nodejs_20/bin
      pkgs.git
      pkgs.curl
      pkgs.wget
      pkgs.jq
      pkgs.tmux
      pkgs.vim
      pkgs.htop
      pkgs.fzf
      pkgs.google-cloud-sdk
      # nodePackages.firebase-tools # firebase-tools is installed via npm, its bin should be in nodejs_20/bin
      pkgs.postgresql
      pkgs.redis
      pkgs.wireshark-cli
      pkgs.diffstat
      pkgs.tree
    ] + ":$PATH";
    SHELL = "${pkgs.zsh}/bin/zsh";
    EDITOR = "vim";
    # Example: API keys - consider more secure methods for production
    # ALPHA_VANTAGE_API_KEY = "YOUR_ALPHA_VANTAGE_KEY";
    # IEX_CLOUD_API_KEY = "YOUR_IEX_CLOUD_KEY";
    # ... other API keys
    PYTHON_JUPYTER_KERNEL = "python${pythonVersion}"; # Ensure Jupyter uses the correct kernel
  };

  idx = {
    extensions = [
      "esbenp.prettier-vscode"         # Code formatter
      "dbaeumer.vscode-eslint"          # Linter for JS/TS
      "ms-python.python"                # Python support
      "ms-azuretools.vscode-docker"     # Docker support
      "redhat.vscode-yaml"              # YAML support
      "ms-vscode.makefile-tools"        # Makefile support
      "oderwat.indent-rainbow"          # Indentation highlighting
      "eamodio.gitlens"                 # Enhanced Git integration
      "GitHub.copilot"                  # AI code assistant (optional)
      "VisualStudioExptTeam.vscodeintellicode" # AI-assisted IntelliSense
      "googlecloudtools.cloudcode"      # Google Cloud integration
      "bradlc.vscode-tailwindcss"       # Tailwind CSS IntelliSense
      "ms-vscode.remote.remote-containers" # Remote Containers
      "ms-vscode.remote.ssh"            # Remote SSH
      "ms-vscode.remote.wsl"            # WSL integration
      "formulahendry.code-runner"       # Run code snippets
      "christian-kohler.npm-intellisense" # npm Intellisense
      "bierner.markdown-preview-enhanced" # Enhanced Markdown preview
      "njpwerner.autodocstring"         # Auto-generate Python docstrings
      "ms-toolsai.jupyter"              # Jupyter support in VS Code
      "ms-toolsai.vscode-jupyter-cell-execution"
      "ms-toolsai.vscode-jupyter-slideshow"
      "ms-toolsai.vscode-jupyter-keymap"
      "littlefoxteam.vscode-python-test-adapter" # Python testing
      "charliermarsh.ruff"              # Fast Python linter
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx",
          "src/functions/main.py",
          "README.md",
          "src/functions/requirements.txt",
          "package.json",
          ".idx/dev.nix", # Corrected path
          "notebooks/data_exploration.ipynb",
          "data/financial_data_sources.md", # Example documentation
          "scripts/data_pipeline.py", # Example data processing script
        ];
        default.commands = [
          "echo 'Installing Node.js dependencies...'",
          "npm install || yarn install || pnpm install",
          "echo 'Installing Python dependencies...'",
          "pip install -r src/functions/requirements.txt",
          "echo 'Setting up Firebase... (Ensure firebase login if needed)'",
          "firebase use ${env.FIREBASE_PROJECT_ID} || echo 'Firebase project not found or not logged in, skipping use command'", # Added fallback
          "echo 'Advanced development environment ready!'",
          "mkdir -p data", # Create a data directory
          "mkdir -p notebooks", # Create a notebooks directory
          "mkdir -p scripts", # Create a scripts directory
          "touch data/financial_data_sources.md",
          "touch scripts/data_pipeline.py",
          "echo '# Financial Data Sources' > data/financial_data_sources.md",
          "echo '# Data Pipeline Script' > scripts/data_pipeline.py",
          "touch notebooks/data_exploration.ipynb" # Ensure ipynb file exists
        ];
      };
      onStart = {
        # Example: Start emulators and other services
        # firebase-emulators = "firebase emulators:start --only functions,firestore,auth";
        # start-postgres = "pg_ctl -D ./postgres_data -l log_postgres start";
        # start-redis = "redis-server";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm", "run", "dev", "--", "--port", "$PORT", "--hostname", "0.0.0.0"];
          manager = "web";
        };
        python_backend = {
          # Assumes main.py is in src/functions and can be run with functions-framework
          command = ["functions-framework", "--source=src/functions/main.py", "--target=obtener_y_guardar_datos", "--port", "$PORT", "--host", "0.0.0.0"];
          manager = "web";
          port = 8001; # Changed port to avoid conflict with potential Next.js dev server
        };
        jupyter = {
          command = ["jupyter", "lab", "--port", "$PORT", "--ip", "0.0.0.0", "--no-browser", "--notebook-dir=./notebooks"];
          manager = "web";
          port = 8888;
          waitForPort = true;
        };
        firebase_emulators = {
          command = ["firebase", "emulators:start", "--only", "functions,firestore,auth", "--import=./firebase-emulator-data", "--export-on-exit"];
          manager = "process";
          # Ensure firebase-emulator-data directory exists or remove --import if not used initially
        };
        # postgres = {
        #   command = ["pg_ctl", "-D", "./postgres_data", "-l", "log_postgres", "start"];
        #   manager = "process";
        #   onStop = ["pg_ctl", "-D", "./postgres_data", "stop"];
        # };
        # redis = {
        #   command = ["redis-server"];
        #   manager = "process";
        # };
        dash_dashboard = {
          command = ["python", "scripts/dashboard.py", "--port", "$PORT", "--host", "0.0.0.0"]; # Example Dash app
          manager = "web";
          port = 8050;
          waitForPort = true;
          # Ensure scripts/dashboard.py exists and is executable
        };
      };
    };
    # Advanced resource allocation for more demanding tasks
    resources = {
      cpu = 8;
      memory = "16Gi";
      storage = "128Gi"; # Increased storage for potential datasets
    };
  };
}
