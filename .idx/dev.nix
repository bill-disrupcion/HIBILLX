{ pkgs ? import <nixpkgs> {} }:

let
  # Definir python3 primero
  python3 = pkgs.python312; # O pkgs.python3 si quieres la versión por defecto de nixpkgs

  # Ahora definir python usando la variable python3
  python = python3.withPackages (p: with p; [ # 'with p;' permite omitir 'p.' para los paquetes de python
    pip
    yfinance # Financial data
    pandas
    numpy
    scipy # For advanced statistical analysis
    requests
    dash # For interactive financial dashboards
    statsmodels
    # ta-lib # Puede requerir configuración adicional o estar disponible como pkgs.ta-lib
    finplot # For financial plotting
    alphalens # For evaluating trading strategies
    backtrader # For backtesting trading strategies
    riskfolio-lib # Portfolio optimization and risk management
    pyfolio # For performance and risk analysis of financial portfolios
    numba # For optimizing numerical computations
  ]);

  # pythonVersion = "3.12"; # Esta variable no se usa directamente para seleccionar el paquete python3,
                           # pero se usa en PYTHON_JUPYTER_KERNEL.
                           # Asegúrate de que coincida con la versión de 'python3' si es importante.

in {
  channel = "stable"; # Nota: 'channel' es más relevante para nix-channel,
                      # en flakes o dev.nix con import <nixpkgs> {}, la versión de pkgs
                      # depende de cómo se esté obteniendo <nixpkgs>.

  packages = with pkgs; [
    nodejs # Asumes que 'nodejs' se refiere a la versión más reciente o la que necesites.
           # Podrías ser más específico como nodejs_20, nodejs_18, etc.
    nodePackages.npm
    nodePackages.yarn
    git
    ollama
    diffstat
    tree
    python # Incluye el entorno python definido arriba
    (ta-lib.override { inherit python3; }) # Ejemplo de cómo incluir ta-lib si necesita compilarse con tu python3
                                         # O simplemente 'pkgs.ta-lib' si existe y es compatible.
                                         # Busca 'ta-lib' en search.nixos.org/packages para la forma correcta.
  ];

  env = {
    PYTHONPATH = "${python}/lib/python${lib.versions.majorMinor python.version}/site-packages";
    PATH = pkgs.lib.makeBinPath [
      pkgs.coreutils
      pkgs.findutils  # CORREGIDO: Añadido pkgs.
      pkgs.gnugrep    # CORREGIDO: Añadido pkgs.
      pkgs.gnused     # CORREGIDO: Añadido pkgs.
      pkgs.fzf        # CORREGIDO: Añadido pkgs.
      pkgs.google-cloud-sdk
      pkgs.nodePackages.firebase-tools # CORREGIDO: Añadido pkgs.
      pkgs.diffstat
      pkgs.tree
      python # Para que los ejecutables de python estén en PATH
    ];
    EDITOR = "vim"; # o "nano" si lo prefieres e incluyes pkgs.nano en 'packages'
    FIREBASE_PROJECT_ID = "hibllx-ai-finance-pilot"; # Replace with your actual Firebase project ID
    PYTHON_JUPYTER_KERNEL_NAME = "python3"; # Jupyter usualmente busca 'python3'
                                          # o el nombre que registres para el kernel.
                                          # PYTHON_JUPYTER_KERNEL no es una variable estándar que Jupyter use.
  };

  idx = { # Esta sección es específica para el entorno de desarrollo .idx (Google IDX Project?)
    extensions = [
      "ms-python.python"
      "googlecloudtools.cloudcode"
      "ms-toolsai.jupyter"
      "ms-toolsai.vscode-jupyter-cell-execution"
      "ms-toolsai.vscode-jupyter-slideshow"
      "ms-toolsai.vscode-jupyter-keymap"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/functions/main.py",
          "README.md",
          "package.json",
          ".idx/dev.nix"
        ];
        default.commands = [
          "echo 'Installing Node.js dependencies...'",
          "npm install",
          "echo 'Installing Python dependencies...'",
          "pip install -r src/functions/requirements.txt", # Asegúrate que este archivo existe y es correcto
          "echo 'Setting up Firebase... (Ensure firebase login if needed)'",
          "firebase use ${env.FIREBASE_PROJECT_ID}", # Esto podría ser redundante si FIREBASE_PROJECT_ID ya está en env
          "echo 'Simplified development environment ready!'"
        ];
      };
      onStart = {
        # firebase-emulators = "firebase emulators:start --only functions,firestore,auth"
      };
    };
    previews = {
      enable = true;
      previews = {
        firebase_emulators = {
          command = ["firebase", "emulators:start", "--only", "functions,firestore,auth", "--import=./firebase-emulator-data", "--export-on-exit"];
          manager = "process";
        };
      };
    };
    resources = { # Esto parece configuración específica de IDX, no estándar de Nix devShell
      cpu = 8;
      memory = "16Gi";
      storage = "128Gi";
    };
  };
}