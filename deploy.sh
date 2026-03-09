#!/bin/bash
# ============================================================================
# LessonLens EC2 Deployment Script
# ============================================================================
#
# PREREQUISITES (do these in the AWS Console BEFORE running this script):
#
# 1. Launch an EC2 instance:
#    - AMI: Amazon Linux 2023
#    - Instance type: t2.micro (free tier) or t3.small for better performance
#    - Region: us-east-1 (same region as your Bedrock models)
#    - Storage: 20 GB gp3
#    - Security Group: Allow inbound TCP 22 (SSH), 80 (HTTP), 443 (HTTPS)
#
# 2. Create an IAM Role with these policies and attach it to the EC2 instance:
#    - AmazonBedrockFullAccess     (for Nova model inference)
#    - AmazonPollyReadOnlyAccess   (for text-to-speech)
#    - AmazonS3FullAccess          (for file uploads — optional)
#    To attach: EC2 Console → select instance → Actions → Security →
#               Modify IAM Role → select your role
#
# 3. SSH into your instance:
#    ssh -i your-key.pem ec2-user@<public-ip>
#
# 4. Copy this script to the instance and run it:
#    chmod +x deploy.sh
#    ./deploy.sh
#
# ============================================================================

set -e  # Exit immediately if any command fails

echo "=========================================="
echo "  LessonLens EC2 Deployment"
echo "=========================================="

# --------------------------------------------------------------------------
# STEP 1: Install Node.js 18
# --------------------------------------------------------------------------
# Amazon Linux 2023 doesn't come with Node.js. We install it via the
# NodeSource repository which provides up-to-date LTS versions.
# Node 18 is the minimum required by Next.js 14.
# --------------------------------------------------------------------------
echo ""
echo "[1/8] Installing Node.js 18..."
if command -v node &> /dev/null; then
    echo "  → Node.js already installed: $(node --version)"
else
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo dnf install -y nodejs
    echo "  → Installed Node.js $(node --version)"
fi

# --------------------------------------------------------------------------
# STEP 2: Install Git
# --------------------------------------------------------------------------
# Needed to clone the repository from GitHub.
# --------------------------------------------------------------------------
echo ""
echo "[2/8] Installing Git..."
if command -v git &> /dev/null; then
    echo "  → Git already installed: $(git --version)"
else
    sudo dnf install -y git
    echo "  → Installed Git $(git --version)"
fi

# --------------------------------------------------------------------------
# STEP 3: Clone the repository
# --------------------------------------------------------------------------
# Replace the URL below with your actual GitHub repo URL.
# If the repo is private, you'll need to set up a deploy key or use
# a personal access token:
#   git clone https://<token>@github.com/yourusername/lesson-lens.git
# --------------------------------------------------------------------------
echo ""
echo "[3/8] Cloning repository..."
APP_DIR="/home/ec2-user/lesson-lens"
REPO_URL="https://github.com/YOUR_USERNAME/lesson-lens.git"  # ← CHANGE THIS

if [ -d "$APP_DIR" ]; then
    echo "  → Directory exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull
else
    echo "  → Cloning from $REPO_URL..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# --------------------------------------------------------------------------
# STEP 4: Create the .env.local file
# --------------------------------------------------------------------------
# This is where ALL your configuration lives. The file is created once
# and never overwritten on subsequent deploys.
#
# KEY SETTINGS:
# - NEXT_PUBLIC_DEMO_MODE=false  → Use real Bedrock AI (not mock data)
# - AWS_REGION=us-east-1         → Must match where your Nova models are enabled
# - GATE_USER/PASS/TOKEN         → Login credentials you'll share with judges
#
# WHY NO AWS KEYS?
# The EC2 instance has an IAM Role attached (from Step 2 in prerequisites).
# The AWS SDK automatically discovers credentials from the instance metadata.
# This is more secure than putting keys in env vars — nothing to leak.
# --------------------------------------------------------------------------
echo ""
echo "[4/8] Setting up environment variables..."
if [ ! -f "$APP_DIR/.env.local" ]; then
    GATE_TOKEN=$(openssl rand -hex 16)  # Generate a random 32-char token
    cat > "$APP_DIR/.env.local" << EOF
# ─── AI Mode ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN_OR_IP

# ─── AWS (credentials come from IAM Role — no keys needed) ───────────────
AWS_REGION=us-east-1

# ─── Gate Login (share these with judges) ─────────────────────────────────
GATE_USER=judge
GATE_PASS=LessonLens2026!
GATE_TOKEN=${GATE_TOKEN}
EOF
    echo "  → Created .env.local (GATE_TOKEN: ${GATE_TOKEN})"
    echo ""
    echo "  ╔════════════════════════════════════════════════════════╗"
    echo "  ║  IMPORTANT: Edit .env.local to set your domain/IP    ║"
    echo "  ║  nano /home/ec2-user/lesson-lens/.env.local          ║"
    echo "  ╚════════════════════════════════════════════════════════╝"
else
    echo "  → .env.local already exists, skipping (won't overwrite)"
fi

# --------------------------------------------------------------------------
# STEP 5: Install dependencies and build
# --------------------------------------------------------------------------
# npm ci is faster and more reliable than npm install for production:
# - Uses exact versions from package-lock.json (reproducible builds)
# - Deletes node_modules first (clean slate)
# - Fails if package-lock.json is out of sync with package.json
#
# npm run build:
# - Compiles TypeScript
# - Runs ESLint checks
# - Pre-renders static pages
# - Bundles server and client code
# --------------------------------------------------------------------------
echo ""
echo "[5/8] Installing dependencies..."
npm ci --production=false  # Need devDependencies for build (TypeScript, ESLint)

echo ""
echo "[6/8] Building Next.js app..."
npm run build

# --------------------------------------------------------------------------
# STEP 7: Install and configure PM2 (process manager)
# --------------------------------------------------------------------------
# PM2 keeps your app running 24/7:
# - Automatically restarts if the app crashes
# - Restarts on server reboot (pm2 startup + pm2 save)
# - Provides logs: pm2 logs lessonlens
# - Monitors memory/CPU: pm2 monit
#
# Without PM2, your app would stop as soon as you close the SSH session.
# --------------------------------------------------------------------------
echo ""
echo "[7/8] Setting up PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Stop existing instance if running
pm2 delete lessonlens 2>/dev/null || true

# Start the app on port 3000
# --name: gives it a friendly name for pm2 commands
# --max-memory-restart: auto-restart if memory exceeds 512MB (prevents OOM)
pm2 start npm --name "lessonlens" -- start
pm2 save  # Save the process list so it survives reboot

# Configure PM2 to start on system boot
# This generates a systemd service that launches PM2 on reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user 2>/dev/null || true

# --------------------------------------------------------------------------
# STEP 8: Install and configure Caddy (reverse proxy + automatic HTTPS)
# --------------------------------------------------------------------------
# Caddy does two critical things:
#
# 1. REVERSE PROXY: Routes traffic from port 80/443 → port 3000 (your app)
#    Node.js can't bind to port 80 without root. Caddy runs as a system
#    service and forwards requests to your app on port 3000.
#
# 2. AUTOMATIC HTTPS: Caddy obtains and renews Let's Encrypt certificates
#    automatically. No manual cert management. Judges see a green padlock.
#    (Only works with a real domain — with an IP, it serves HTTP only.)
#
# IF YOU DON'T HAVE A DOMAIN:
#    Caddy will still work as a reverse proxy on port 80 (HTTP).
#    Replace YOUR_DOMAIN below with :80 to serve on plain HTTP.
# --------------------------------------------------------------------------
echo ""
echo "[8/8] Setting up Caddy reverse proxy..."
if ! command -v caddy &> /dev/null; then
    sudo dnf install -y 'dnf-command(copr)'
    sudo dnf copr enable -y @caddy/caddy
    sudo dnf install -y caddy
fi

# Write Caddy config
# Replace YOUR_DOMAIN with your actual domain (e.g., lessonlens.example.com)
# Or use :80 for HTTP-only access via IP address
sudo tee /etc/caddy/Caddyfile > /dev/null << 'EOF'
# ─── OPTION A: With a domain (automatic HTTPS) ───────────────────────────
# Uncomment the line below and replace with your domain:
# lessonlens.example.com {
#     reverse_proxy localhost:3000
# }

# ─── OPTION B: Without a domain (HTTP only, access via IP) ───────────────
:80 {
    reverse_proxy localhost:3000
}
EOF

sudo systemctl enable caddy   # Start Caddy on boot
sudo systemctl restart caddy   # Apply the new config

# --------------------------------------------------------------------------
# DONE!
# --------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "  Your app is running at:"
echo "    → http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_PUBLIC_IP')"
echo ""
echo "  Judge login credentials:"
echo "    → Username: judge"
echo "    → Password: LessonLens2026!"
echo ""
echo "  Useful commands:"
echo "    pm2 logs lessonlens     View app logs"
echo "    pm2 monit               Monitor CPU/memory"
echo "    pm2 restart lessonlens  Restart the app"
echo "    sudo systemctl status caddy  Check Caddy status"
echo ""
echo "  To update after code changes:"
echo "    cd $APP_DIR && git pull && npm ci && npm run build && pm2 restart lessonlens"
echo ""
