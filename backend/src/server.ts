import http from 'http';
import app from './app';
import { config } from './config/config';

const server = http.createServer(app);

server.listen(config.server.port, () => {
    console.log(`Server is running on port ${config.server.port}`);
});
