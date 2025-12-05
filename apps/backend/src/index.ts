import 'dotenv/config';
import "reflect-metadata";
import app from './app';
import { PORT } from './config/constants';


// TODO: Connect to Database and create a bootstrap function + graceful shutdown
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});