# LessonLens — AWS EC2 Deployment Guide

A step-by-step guide to deploy LessonLens on AWS EC2 with IAM Role authentication for Bedrock, Polly, and S3.

## Architecture

```
User → Caddy (port 80/443) → Next.js (port 3000) → Amazon Bedrock (Nova models)
                                                   → Amazon Polly (TTS)
                                                   → Amazon S3 (file storage)
```

- **EC2** runs the Next.js app
- **IAM Role** provides AWS credentials automatically (no access keys needed)
- **Caddy** handles reverse proxy + automatic HTTPS
- **PM2** keeps the app alive 24/7

---

## Prerequisites

- AWS account with Bedrock model access enabled in `us-east-1`
- AWS CLI installed and configured (`aws configure`)
- Git installed locally

Verify your CLI is working:

```bash
aws sts get-caller-identity
```

This prints your AWS account ID, user ARN, and account number. If it errors, run `aws configure` and enter your access key, secret key, and region (`us-east-1`).

---

## Step 1: Create IAM Role

An IAM Role is like a badge that grants permissions. Instead of putting access keys on your server (risky — they can leak), you attach a role to the EC2 instance. The AWS SDK inside your app automatically discovers temporary credentials from the instance metadata service.

### 1a. Create the role

```bash
aws iam create-role \
  --role-name LessonLensEC2Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }'
```

The trust policy (`assume-role-policy-document`) says: "Only the EC2 service can assume this role." No human user, no Lambda function — only EC2 instances.

### 1b. Attach permissions

```bash
aws iam attach-role-policy \
  --role-name LessonLensEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
```

Grants access to all Bedrock APIs — this is how your app calls Nova Pro, Nova Lite, and Nova Canvas.

```bash
aws iam attach-role-policy \
  --role-name LessonLensEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonPollyReadOnlyAccess
```

Grants read-only access to Amazon Polly for text-to-speech audio generation.

```bash
aws iam attach-role-policy \
  --role-name LessonLensEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

Grants access to S3 for file uploads/downloads. Skip this command if you're not using S3.

### 1c. Create an Instance Profile

EC2 instances don't use IAM roles directly — they use Instance Profiles (a wrapper around a role). Think of it as: Role = the permissions, Instance Profile = the container that attaches the role to EC2.

```bash
aws iam create-instance-profile \
  --instance-profile-name LessonLensEC2Profile
```

```bash
aws iam add-role-to-instance-profile \
  --instance-profile-name LessonLensEC2Profile \
  --role-name LessonLensEC2Role
```

---

## Step 2: Create SSH Key Pair

You need a key pair to SSH into your EC2 instance. AWS stores the public key, and you keep the private key (`.pem` file).

```bash
aws ec2 create-key-pair \
  --key-name lessonlens-key \
  --query 'KeyMaterial' \
  --output text > lessonlens-key.pem
```

This is the **only time** you can download the private key. If you lose it, you'll need to create a new key pair.

```bash
chmod 400 lessonlens-key.pem
```

Makes the key read-only. SSH refuses to use key files that have open permissions (anyone-can-read = insecure).

---

## Step 3: Create Security Group

A Security Group is a virtual firewall that controls which traffic can reach your instance. By default, all inbound traffic is blocked.

```bash
aws ec2 create-security-group \
  --group-name lessonlens-sg \
  --description "LessonLens - SSH, HTTP, HTTPS"
```

Save the Security Group ID:

```bash
SG_ID=$(aws ec2 describe-security-groups \
  --group-names lessonlens-sg \
  --query 'SecurityGroups[0].GroupId' \
  --output text)
echo "Security Group ID: $SG_ID"
```

Open the required ports:

```bash
# Port 22 — SSH access (to manage the server)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

# Port 80 — HTTP (how users access the app)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# Port 443 — HTTPS (encrypted access, needed for Caddy auto-TLS)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

`0.0.0.0/0` means "from anywhere." For production, you'd restrict SSH to your IP only (`--cidr YOUR_IP/32`), but for a hackathon demo this is fine.

---

## Step 4: Find the Latest AMI

An AMI (Amazon Machine Image) is the operating system template for your instance. We use Amazon Linux 2023 — it's free, lightweight, and optimized for EC2.

```bash
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023*-x86_64" \
            "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text)
echo "AMI ID: $AMI_ID"
```

This finds the latest Amazon Linux 2023 x86_64 AMI. AMI IDs change with every OS update, so we query dynamically instead of hardcoding.

---

## Step 5: Launch the EC2 Instance

```bash
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t2.micro \
  --key-name lessonlens-key \
  --security-group-ids $SG_ID \
  --iam-instance-profile Name=LessonLensEC2Profile \
  --block-device-mappings '[{
    "DeviceName": "/dev/xvda",
    "Ebs": { "VolumeSize": 20, "VolumeType": "gp3" }
  }]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=LessonLens}]' \
  --region us-east-1
```

What each flag does:

| Flag | Purpose |
|------|---------|
| `--image-id` | Which OS to install (Amazon Linux 2023) |
| `--instance-type t2.micro` | Free tier eligible — 1 vCPU, 1 GB RAM |
| `--key-name` | Which SSH key to authorize for login |
| `--security-group-ids` | Which firewall rules to apply |
| `--iam-instance-profile` | Which IAM role to attach (Bedrock/Polly/S3 permissions) |
| `--block-device-mappings` | 20 GB gp3 SSD storage (default is 8 GB, too small) |
| `--tag-specifications` | Names the instance "LessonLens" for easy identification |
| `--region` | Must match where your Bedrock models are enabled |

Wait ~30 seconds for the instance to start, then get the public IP:

```bash
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=LessonLens" \
            "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

---

## Step 6: SSH Into the Instance

```bash
ssh -i lessonlens-key.pem ec2-user@YOUR_PUBLIC_IP
```

`ec2-user` is the default username on Amazon Linux. Your `.pem` file proves your identity instead of a password.

---

## Step 7: Install Node.js and Git

```bash
sudo dnf update -y
```

Updates all system packages. `dnf` is the package manager on Amazon Linux 2023 (like `apt` on Ubuntu). `-y` skips the confirmation prompt.

```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
```

Downloads and runs the NodeSource setup script, which adds the Node.js 18 repository to the system. Without this, `dnf` only has an older Node version.

```bash
sudo dnf install -y nodejs git
```

Installs Node.js 18 (Next.js runtime) and Git (to clone your repo).

Verify:

```bash
node --version   # v18.x
npm --version    # 9.x or 10.x
```

---

## Step 8: Clone and Configure the App

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/lesson-lens.git
cd lesson-lens
```

If the repo is private, use a personal access token:

```bash
git clone https://YOUR_GITHUB_TOKEN@github.com/YOUR_USERNAME/lesson-lens.git
```

Generate a token at: GitHub → Settings → Developer settings → Personal access tokens

### Create environment variables

Generate a random gate token:

```bash
openssl rand -hex 16
```

Copy the output, then create the env file:

```bash
nano .env.local
```

Paste this (replace `YOUR_PUBLIC_IP` and `YOUR_GATE_TOKEN`):

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=http://YOUR_PUBLIC_IP
AWS_REGION=us-east-1
GATE_USER=judge
GATE_PASS=LessonLens2026!
GATE_TOKEN=YOUR_GATE_TOKEN
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

Why no AWS keys in this file? The IAM Role attached in Step 5 provides credentials automatically through the EC2 instance metadata service. The AWS SDK discovers them without any configuration.

---

## Step 9: Build the App

```bash
npm ci
```

Installs packages using exact versions from `package-lock.json`. Unlike `npm install`, this won't modify the lock file — builds are reproducible.

```bash
npm run build
```

Compiles TypeScript, runs ESLint, pre-renders static pages, and creates the production `.next/` bundle. Takes 30-60 seconds. You should see the route table at the end.

---

## Step 10: Set Up PM2 (Process Manager)

PM2 keeps your app running 24/7. Without it, your app stops when you close the SSH session.

```bash
sudo npm install -g pm2
```

Installs PM2 globally on the system.

```bash
pm2 start npm --name "lessonlens" -- start
```

Tells PM2 to run `npm start` and track the process as "lessonlens."

```bash
pm2 save
```

Saves the process list. PM2 will restore these processes after a reboot.

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

Creates a systemd service that launches PM2 on system boot. Without this, a server reboot would not restart your app.

Verify:

```bash
pm2 status          # Should show "lessonlens" with status "online"
pm2 logs lessonlens # Real-time logs (Ctrl+C to exit)
```

---

## Step 11: Set Up Caddy (Reverse Proxy)

Your app runs on port 3000, but users expect port 80 (HTTP) or 443 (HTTPS). Node.js can't bind to ports below 1024 without root privileges. Caddy solves this by listening on port 80/443 and forwarding requests to port 3000.

```bash
sudo dnf install -y 'dnf-command(copr)'
```

Installs the COPR plugin, which lets you add community repositories to dnf.

```bash
sudo dnf copr enable -y @caddy/caddy
```

Adds the official Caddy repository.

```bash
sudo dnf install -y caddy
```

Installs Caddy.

### Configure Caddy

```bash
sudo nano /etc/caddy/Caddyfile
```

**Option A — HTTP only (no domain, access via IP):**

```
:80 {
    reverse_proxy localhost:3000
}
```

**Option B — Automatic HTTPS (with a domain):**

```
lessonlens.yourdomain.com {
    reverse_proxy localhost:3000
}
```

With a domain, Caddy automatically obtains and renews a free Let's Encrypt HTTPS certificate. No manual cert management.

Save and exit: `Ctrl+O` → `Enter` → `Ctrl+X`

```bash
sudo systemctl enable caddy
```

Configures Caddy to start automatically on boot.

```bash
sudo systemctl restart caddy
```

Starts Caddy with the new configuration.

```bash
sudo systemctl status caddy
```

Verify it shows `active (running)`.

---

## Step 12: Test

Open your browser:

```
http://YOUR_PUBLIC_IP
```

You should see the LessonLens login page.

Login credentials:
- **Username:** `judge`
- **Password:** `LessonLens2026!`

### Verify IAM Role is working

```bash
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

This queries the EC2 instance metadata. If it returns your role name (`LessonLensEC2Role`), the AWS SDK will find credentials automatically.

---

## Common Commands

```bash
# View app logs
pm2 logs lessonlens

# Monitor CPU/memory
pm2 monit

# Restart the app
pm2 restart lessonlens

# Update after code changes
cd ~/lesson-lens && git pull && npm ci && npm run build && pm2 restart lessonlens

# Check Caddy status
sudo systemctl status caddy

# View Caddy logs
sudo journalctl -u caddy --no-pager -n 50
```

---

## Cleanup (After Judging Ends)

Run these from your local terminal (not the EC2 instance) to remove everything and stop all charges:

```bash
# Get instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=LessonLens" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

# Get security group ID
SG_ID=$(aws ec2 describe-security-groups \
  --group-names lessonlens-sg \
  --query 'SecurityGroups[0].GroupId' \
  --output text)

# Terminate instance
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

# Wait for instance to terminate (takes ~60 seconds)
aws ec2 wait instance-terminated --instance-ids $INSTANCE_ID

# Delete security group
aws ec2 delete-security-group --group-id $SG_ID

# Delete key pair
aws ec2 delete-key-pair --key-name lessonlens-key
rm lessonlens-key.pem

# Remove IAM role from instance profile
aws iam remove-role-from-instance-profile \
  --instance-profile-name LessonLensEC2Profile \
  --role-name LessonLensEC2Role

# Delete instance profile
aws iam delete-instance-profile \
  --instance-profile-name LessonLensEC2Profile

# Detach policies from role
aws iam detach-role-policy \
  --role-name LessonLensEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam detach-role-policy \
  --role-name LessonLensEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonPollyReadOnlyAccess

aws iam detach-role-policy \
  --role-name LessonLensEC2Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Delete role
aws iam delete-role --role-name LessonLensEC2Role
```

---

## Troubleshooting

### App returns "Gate not configured"

The `GATE_USER`, `GATE_PASS`, and `GATE_TOKEN` env vars are missing or empty. Check your `.env.local`:

```bash
cat ~/lesson-lens/.env.local
```

### Bedrock returns "Access Denied"

1. Check the IAM role is attached:

```bash
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

If this returns nothing, the role isn't attached. Go to EC2 Console → select instance → Actions → Security → Modify IAM Role.

2. Check Bedrock model access is enabled in `us-east-1`:
   - Go to Amazon Bedrock Console → Model access → Request access for Nova models

### Can't SSH into the instance

1. Check the security group allows port 22:

```bash
aws ec2 describe-security-groups --group-ids $SG_ID \
  --query 'SecurityGroups[0].IpPermissions'
```

2. Check the key file has correct permissions:

```bash
ls -la lessonlens-key.pem   # Should show -r--------
```

### App works on port 3000 but not port 80

Caddy might not be running:

```bash
sudo systemctl status caddy
sudo journalctl -u caddy --no-pager -n 20
```

Test port 3000 directly:

```bash
curl http://localhost:3000
```

If that works, the issue is Caddy config. Check `/etc/caddy/Caddyfile`.
