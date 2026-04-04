import { App } from './app';
import { config } from './config/config';

const app = new App();

app.start(config.port);