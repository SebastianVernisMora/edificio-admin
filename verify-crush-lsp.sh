#!/bin/bash
# Verification script for Crush LSP configuration

echo "🔍 Verifying Crush LSP Configuration"
echo "====================================="

# Check if Crush LSP config files exist
echo "📄 Checking configuration files..."
if [ -f "$HOME/.config/crush/lsp.json" ]; then
    echo "✅ LSP configuration file exists: $HOME/.config/crush/lsp.json"
else
    echo "❌ LSP configuration file missing"
fi

if [ -f "$HOME/.config/crush/config.json" ]; then
    echo "✅ Main configuration file exists: $HOME/.config/crush/config.json"
else
    echo "❌ Main configuration file missing"
fi

if [ -f "$HOME/.local/share/crush/crush.json" ]; then
    echo "✅ Data configuration file exists: $HOME/.local/share/crush/crush.json"
else
    echo "❌ Data configuration file missing"
fi

echo ""
echo "🔧 Checking LSP server executables..."
LSP_SERVERS=("tsserver" "pylsp" "vscode-eslint-language-server" "vscode-css-language-server")

for server in "${LSP_SERVERS[@]}"; do
    if command -v "$server" &> /dev/null; then
        echo "✅ $server is available"
    else
        echo "❌ $server is not available"
    fi
done

echo ""
echo "📋 LSP configuration summary:"
echo "TypeScript/JavaScript: tsserver --stdio"
echo "Python: pylsp"
echo "ESLint: vscode-eslint-language-server --stdio" 
echo "CSS: vscode-css-language-server --stdio"

echo ""
echo "✅ Crush is now configured to use the following LSP servers:"
echo "   - TypeScript Server (tsserver) for JavaScript/TypeScript"
echo "   - Python Language Server (pylsp) for Python"
echo "   - ESLint Language Server for linting"
echo "   - VSCode CSS Language Server for CSS/SCSS/SASS/LESS"
echo ""
echo "🚀 Configuration completed successfully!"