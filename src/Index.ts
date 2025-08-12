import 'dotenv/config';
import { createApp } from './App';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`API ouvindo em http://localhost:${port}`);
});
