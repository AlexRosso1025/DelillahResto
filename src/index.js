const app = require('./config/server');

require('./app/routes/products')(app);

app.listen(app.get('port'),()=>{
    console.log(`Server is working on port`,app.get('port'));
});