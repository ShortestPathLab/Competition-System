## Requirement
1. Node.js
2. Docker 20.xx
3. Slurm is already set for evaluation, and the directory of this project is mounted to each node.

## Project Structure
```
Root
|--client
|--server
```
## Run the project

### Server Configuration
Fill each option in:
- `server/config.js`
- `server/config_docker.js`
- `server/config_benchmark.js`

### Client Configuration
Fill each option in:
- `client/src/config.jsx`

### Package Installation and Client Build

```bash
cd server
npm install
npm run build_client
```

### Run in Development Mode
```bash
cd server
npm run dev
```

### Run in Production Mode
Use pm2 for process management.
**Install PM2**
```bash
npm install pm2 -g
```
**Run the server**
```bash
cd server
pm2 start server.js
```

**Run the evaluation server**
```bash
cd server
pm2 srart job_creater.js
pm2 start job_scheduler.js
```



