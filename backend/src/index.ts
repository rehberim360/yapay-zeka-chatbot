import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

import onboardingRoutes from './routes/onboarding.routes.js';
import chatRoutes from './routes/chat.routes.js';

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', onboardingRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('Yapay Zeka Chatbot API');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
