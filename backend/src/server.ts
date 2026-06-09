import { createApp } from './app.js';

const app = createApp();
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  // Startup log — the one place a console statement is acceptable in the scaffold.
  console.log(`BanyanBoard API listening on port ${port}`);
});
