import http from 'http';
import { exec } from 'child_process';

const SECRET = 'supersecret';
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.secret !== SECRET) {
          res.writeHead(403);
          return res.end('Forbidden');
        }

        const commands = `
          cd /home/station3/Desktop/sensorhub-stack/server_compose &&
          docker compose down --remove-orphans &&

          cd /home/station3/Desktop/sensorhub-stack/client_interface &&
          docker compose down --remove-orphans &&

          cd /home/station3/Desktop &&
          rm -rf sensorhub-stack &&
          git clone https://github.com/Heather-Glen-Village/sensorhub-stack.git sensorhub-stack &&

          cd sensorhub-stack/server_compose &&
          docker compose up -d --build --remove-orphans &&

          cd ../client_interface &&
          docker compose up -d --build --remove-orphans
        `;

        exec(commands, { shell: '/bin/bash' }, (err, stdout, stderr) => {
          if (err) {
            console.error('❌ Deploy error:', stderr);
            res.writeHead(500);
            return res.end('Deploy failed');
          }
          console.log('✅ Deploy succeeded:\n', stdout);
          res.writeHead(200);
          res.end('Deployed successfully');
        });

      } catch (err) {
        console.error('❌ Bad request:', err);
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8085, '0.0.0.0', () => {
  console.log('🚀 Webhook listener running on port 8085');
});

// keep alive
setInterval(() => {}, 1 << 30);
