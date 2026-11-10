# Setup guide: GitHub and AWS

How to put this site online. About 45 minutes the first time.

You will end up with: a private GitHub repo, one small AWS server, and the
site reachable at `http://<your-server-ip>`.

```
your laptop ──git push──▶ GitHub (code)
     │
     └──scripts/deploy.sh──▶ AWS EC2 (Docker → nginx → site on port 80)
```

## Part 1 — GitHub (10 minutes)

1. Sign in at <https://github.com> (create an account if needed).
2. Check whether your laptop already has an SSH key:
   ```bash
   ls ~/.ssh/id_ed25519.pub
   ```
   If the file is missing, make one (press Enter at each question):
   ```bash
   ssh-keygen -t ed25519 -C "quest-laptop"
   ```
3. Copy the public key and add it at **GitHub → Settings → SSH and GPG
   keys → New SSH key**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
4. Test it. You should see "Hi <name>! You've successfully authenticated":
   ```bash
   ssh -T git@github.com
   ```
5. Create the repo: **GitHub → + → New repository**. Name `ai-quest`,
   **Private**, and leave every "add a file" box unticked.
6. Connect and push:
   ```bash
   cd ~/Repositories/ai-quest
   git remote add origin git@github.com:<your-username>/ai-quest.git
   git push -u origin main
   ```

Every push now runs the **CI** workflow, which builds the site and fails
if something is broken. See it under the repo's **Actions** tab.

## Part 2 — AWS server (20 minutes)

### Before you start: cost

One `t3.micro` server with a public address costs roughly **12 USD a
month** if it is not covered by free-tier credits. Check current prices at
<https://aws.amazon.com/ec2/pricing/on-demand/>. Step 1 sets an alert so
there are no surprises.

### Steps

1. **Budget alert.** AWS console → search **Budgets** → Create budget →
   "Zero spend budget" or a monthly budget of 15 USD → enter your email.
2. **Pick a region** close to your users (top-right menu), for example
   `eu-central-1` (Frankfurt). Stay in it for every step below.
3. **Launch the server.** Search **EC2** → **Launch instance**:
   - Name: `ai-quest`
   - Image: **Ubuntu Server 24.04 LTS**
   - Type: **t3.micro**
   - Key pair: **Create new key pair** → name `ai-quest`, type ED25519,
     format `.pem`. The file downloads once. Move it and lock it:
     ```bash
     mv ~/Downloads/ai-quest.pem ~/.ssh/ && chmod 400 ~/.ssh/ai-quest.pem
     ```
   - Network settings → **Edit**:
     - Allow SSH traffic from: **My IP**
     - Tick **Allow HTTP traffic from the internet**
     - Tick **Allow HTTPS traffic from the internet**
   - Storage: 12 GB gp3
   - **Launch instance**
4. **Give it a fixed address.** EC2 → **Elastic IPs** → Allocate →
   select it → **Actions → Associate** → choose the `ai-quest` instance.
   Write the address down; below it is `<server-ip>`.
5. **Add a shortcut** on your laptop, in `~/.ssh/config`:
   ```
   Host quest
       HostName <server-ip>
       User ubuntu
       IdentityFile ~/.ssh/ai-quest.pem
   ```
   Test it: `ssh quest` (answer `yes` the first time).
6. **Install Docker on the server:**
   ```bash
   ssh quest 'curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker ubuntu'
   ssh quest 'docker --version && docker compose version'
   ```

> **"My IP" changed?** If `ssh quest` starts timing out from a new place,
> your address changed. EC2 → Security Groups → the instance's group →
> Edit inbound rules → SSH → Source: **My IP** → Save.

## Part 3 — Deploy (5 minutes)

From your laptop:

```bash
cd ~/Repositories/ai-quest
./scripts/deploy.sh quest
```

The script builds the Docker image on your laptop, sends it to the server
over SSH, and starts it on port 80. No build happens on the small server
and the server needs no access to GitHub.

Check it:

```bash
curl -I http://<server-ip>        # expect: HTTP/1.1 200 OK
```

Open `http://<server-ip>` in a browser. Send the link to your colleague. 🎉

To update the site later: change something, commit, run the same script.

To go back to an earlier version: `./scripts/rollback.sh quest` lists the
versions on the server; `./scripts/rollback.sh quest <tag>` starts one.

## Part 4 — Optional: deploy on every push

The repo ships with a deploy workflow that is switched off. It does what
`deploy.sh` does, from GitHub's machines.

Trade-off: GitHub's machines have changing addresses, so SSH (port 22) on
the server must be open to everyone, not only your IP. Access is still by
key only. If you prefer the port closed, keep using the script.

1. Make a key only for deploys and install it on the server:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/quest-deploy -N "" -C "github-deploy"
   ssh-copy-id -i ~/.ssh/quest-deploy.pub quest
   ```
2. GitHub repo → **Settings → Secrets and variables → Actions**:
   - Secrets: `DEPLOY_HOST` = `<server-ip>`, `DEPLOY_USER` = `ubuntu`,
     `DEPLOY_KEY` = the full contents of `~/.ssh/quest-deploy`
   - Variables: `DEPLOY_ENABLED` = `true`
3. Security group → SSH rule → Source **Anywhere-IPv4**.
4. Push to `main` and watch the **Actions** tab.

## Part 5 — Optional: your own name and HTTPS

You need a domain (any registrar). Add an **A record** for, say,
`quest.example.com` pointing to `<server-ip>`. Then on the server, move
the site off port 80 (Caddy needs it), set the name, and start the HTTPS
profile:

```bash
ssh quest 'cd ~/ai-quest \
  && sed -i "s/^QUEST_PORT=.*/QUEST_PORT=8080/" .env \
  && echo "QUEST_DOMAIN=quest.example.com" >> .env \
  && docker compose --profile https up -d'
```

Caddy gets a free certificate by itself in about a minute. The site is then
at `https://quest.example.com`.

## Stop paying

- **Pause:** EC2 → Instances → select → Instance state → **Stop**. Disk
  and address still cost a little.
- **Remove everything:** Instance state → **Terminate**; then Elastic IPs
  → select → **Release**. Both steps, or the address keeps costing money.

## If something goes wrong

| You see | It means | Do this |
|---------|----------|---------|
| `ssh quest` times out | Port 22 is not open to your current IP | Update the SSH rule to **My IP** |
| `Permission denied (publickey)` | Wrong key or user | Check `IdentityFile` and `User ubuntu` |
| Browser times out on `http://<server-ip>` | Port 80 not allowed | Add the HTTP rule in the security group |
| `Connection refused` on port 80 | Container is not running | `ssh quest 'docker ps -a; docker logs ai-quest'` |
| `permission denied … docker.sock` | Group change not active yet | Log out of SSH and in again |

These are the same errors Level 2 of the quest teaches. Now you have met
them in the wild.
