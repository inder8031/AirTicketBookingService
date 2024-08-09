const express = require('express');
const bodyParser = require('body-parser');

const { PORT, DB_SYNC } = require('./config/serverConfig');
const db = require('./models/index');
const apiRoutes = require('./routes/index');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', apiRoutes);

app.listen(PORT, async () => {
    console.log(`Server started at port ${PORT}`);

    if(DB_SYNC) {
        try {
            await db.sequelize.sync({ alter: true});
        } catch (error) {
            console.log("DB SYNC Error");
            throw { error };
        }
    }
});