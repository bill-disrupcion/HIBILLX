{pkgs}: {
  channel = "stable-24.11"; # Use a stable channel for consistency

  # List of packages needed for the development environment
  packages = [
    # Node.js related
    pkgs.nodejs_20  # Specific Node.js version
    pkgs.nodePackages.npm # Node Package Manager
    # pkgs.yarn # Uncomment if you use Yarn
    # pkgs.pnpm # Uncomment if you use pnpm

    # Python related (for the trading agent and Cloud Functions)
    pkgs.python311Full # Specific Python version
    pkgs.python311Packages.pip # Python package installer
    pkgs.python311Packages.yfinance # For financial data
    pkgs.python311Packages.pandas # Data manipulation
    pkgs.python311Packages.numpy # Numerical operations
    pkgs.python311Packages.scikit-learn # Machine learning (if needed)
    # pkgs.python311Packages.tensorflow # Uncomment if using TensorFlow
    # pkgs.python311Packages.pytorch    # Uncomment if using PyTorch
    pkgs.python311Packages.requests   # For making HTTP requests
    pkgs.python311Packages.firebase-admin # For Firebase interaction from Python

    # Firebase CLI
    pkgs.firebase-tools

    # General development tools
    pkgs.git
    pkgs.curl
    pkgs.wget
    pkgs.jq    # JSON processor
    pkgs.tmux  # Terminal multiplexer (optional)
    # pkgs.vim   # Uncomment or replace with your preferred terminal editor (e.g., pkgs.neovim)
  ];

  # Environment variables available in the development environment
  env = {
    # Replace with your actual Firebase Project ID
    # FIREBASE_PROJECT_ID = "<your-firebase-project-id>";
    FIREBASE_API_KEY = "<your-firebase-api-key>"; # Replace with your actual key if needed client-side (use secrets for backend)
    # Ensure Python can find installed packages
    PYTHONPATH = "${pkgs.python311Packages.yfinance}/lib/python3.11/site-packages:${pkgs.python311Packages.pandas}/lib/python3.11/site-packages:${pkgs.python311Packages.firebase-admin}/lib/python3.11/site-packages"; # Add more paths as needed
    # Example for API keys (use secrets management for production)
    # ALPHA_VANTAGE_API_KEY = "<your-alpha-vantage-key>";
    # POLYGON_API_KEY = "<your-polygon-key>";
    # Example Broker API Keys (Use Project IDX Secrets for these!)
    # REAL_BROKER_API_KEY = "YOUR_BROKER_API_KEY_SECRET_NAME";
    # REAL_BROKER_SECRET_KEY = "YOUR_BROKER_SECRET_KEY_SECRET_NAME";
    # REAL_BROKER_API_ENDPOINT = "https://api.broker.com"; # Or paper trading endpoint
    NEXT_PUBLIC_USE_MOCK_API="true"; # Control whether to use mock APIs ('true' or 'false')
    # NEXT_PUBLIC_BACKEND_API_ENDPOINT = "http://localhost:5001/<your-project-id>/us-central1/yourApiFunction"; # Example backend URL
  };

  # IDE settings for Firebase Studio (Project IDX)
  idx = {
    # VS Code extensions to install
    extensions = [
      "esbenp.prettier-vscode",       # Code formatter
      "dbaeumer.vscode-eslint",        # JavaScript/TypeScript linter
      "ms-python.python",              # Python support
      "ms-azuretools.vscode-docker",   # Docker support (if needed)
      "googlecloudtools.cloudcode",    # Google Cloud integration
      # "ms-azuretools.firebase",        # Alternative Firebase extension
      "bradlc.vscode-tailwindcss",   # Tailwind CSS IntelliSense
      "VisualStudioExptTeam.vscodeintellicode", # AI-assisted IntelliSense
    ];

    # Workspace settings
    workspace = {
      # Settings on workspace creation
      onCreate = {
        default = {
          # Files to open automatically
          openFiles = [
            "src/app/page.tsx", # Frontend entry point
            "src/components/dashboard.tsx", # Main dashboard component
            "src/services/broker-api.ts", # API interaction logic
            "src/ai/flows/suggest-trading-strategies.ts", # AI strategy logic
            "functions/main.py", # Cloud Functions code (if using Python)
            "README.md", # Project documentation
            "dev.nix", # This environment configuration file
          ];
          # Commands to run automatically on startup
          commands = [
            "echo 'Installing frontend dependencies...'",
            "npm install", # Install Node.js dependencies
            "echo 'Installing backend/functions dependencies...'",
            "(cd functions && pip install -r requirements.txt)", # Install Python dependencies for functions
            "echo 'Workspace setup complete.'",
          ];
        };
      };

      # VS Code settings overrides
      # Example: Enabling format on save
      # settings = {
      #   "editor.formatOnSave" = true;
      #   "[typescript]" = {
      #     "editor.defaultFormatter" = "esbenp.prettier-vscode";
      #   };
      #   "[python]" = {
      #     "editor.defaultFormatter" = "ms-python.black-formatter";
      #   };
      # };
    };

    # Preview settings
    previews = {
      enable = true; # Enable previews
      previews = {
        # Frontend preview (Next.js app)
        web = {
          # Command to start the Next.js dev server
          command = ["npm", "run", "dev", "--", "--port", "$PORT", "--hostname", "0.0.0.0"];
          manager = "web"; # Use the standard web preview manager
          # id = "web"; # Optional explicit ID
        };
        # Backend preview (Example for Python Flask backend, adjust as needed)
        # python-backend = {
        #   # Command to start the Python backend server
        #   # Example assumes Flask runs using `flask run` after setting FLASK_APP
        #   command = [
        #      "export FLASK_APP=functions/main:app", # Or however you define your Flask app
        #      "flask", "run", "--port", "$PORT", "--host", "0.0.0.0"
        #    ];
        #   manager = "web";
        #   env = { # Environment variables specific to this preview
        #       FLASK_ENV = "development";
        #   };
        #   # id = "backend"; # Optional explicit ID
        # };
        # Genkit UI Preview (if you want to inspect Genkit flows)
        genkit-ui = {
           command = ["genkit", "start", "--", "tsx", "src/ai/dev.ts"];
           manager = "web";
           port = 4000; # Default Genkit UI port
           # id = "genkit"; # Optional explicit ID
        };
      };
    };

     # Secrets management configuration (using Project IDX Secrets)
     # secrets = {
     #   # Define secrets that your application needs
     #   # The value should be the name you gave the secret in the IDX UI
     #   env = {
     #      REAL_BROKER_API_KEY = "IDX_SECRET_BROKER_API_KEY";
     #      REAL_BROKER_SECRET_KEY = "IDX_SECRET_BROKER_SECRET_KEY";
     #      # Add other secrets like database passwords, other API keys, etc.
     #   };
     # };

     # Optional: Configure databases, like Firestore Emulator
     # services.firestore.enable = true; # Enables the Firestore emulator
     # services.auth.enable = true; # Enables the Auth emulator

  };

  # Entrypoint for the environment (what runs when you open the workspace)
  # Often this is just starting the shell, but you could customize it
  entrypoint = "bash";
}
