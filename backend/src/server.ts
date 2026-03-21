import http from 'http';
import app from './app';
import { config } from './config/config';

const server = http.createServer(app);

const PORT = process.env.PORT || config.server.port || 5000;

server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server is running on 0.0.0.0:${PORT}`);
});
